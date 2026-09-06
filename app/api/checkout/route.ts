import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProductById } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const checkoutInputSchema = z.object({
  productId: z.string().min(1),
  email: z.string().email('Adresse e-mail invalide.'),
});

const fallbackProducts = [
  { id: 'demo-1', title: 'Pack Starter Canva Pro', price: 15000, file_url: 'https://example.com/files/canva-pack.zip' },
  { id: 'demo-2', title: 'Mini cours Notion Business', price: 22000, file_url: 'https://example.com/files/notion-business.pdf' },
  { id: 'demo-3', title: 'Kit de branding digital', price: 35000, file_url: 'https://example.com/files/branding-kit.zip' },
];

export async function POST(request: Request) {
  try {
    const parsed = checkoutInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Données de paiement invalides.' }, { status: 400 });
    }
    const { productId, email } = parsed.data;

    const fallbackProduct = fallbackProducts.find((product) => product.id === productId);
    const product = fallbackProduct || await getProductById(productId);

    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });
    }

    const admin = getSupabaseAdmin();
    const { data: order, error: orderError } = await admin.from('orders').insert({
      product_id: product.id.startsWith('demo-') ? null : product.id,
      email,
      amount: product.price,
      status: 'pending',
    }).select('id, access_token').single();

    if (orderError || !order) {
      throw new Error(orderError?.message || 'Impossible de créer la commande.');
    }

    const apiKey = process.env.PAPI_MG_API_KEY;
    const baseUrl = (process.env.PAPI_MG_BASE_URL || 'https://app.papi.mg').replace(/\/dashboard\/api\/?$/, '');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const notificationUrl = process.env.PAPI_MG_NOTIFICATION_URL || `${appUrl}/api/payments/webhook`;

    if (!apiKey) {
      return NextResponse.json({ error: 'PAPI_MG_API_KEY non configurée.' }, { status: 500 });
    }

    const response = await fetch(`${baseUrl}/dashboard/api/payment-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Token: apiKey,
      },
      body: JSON.stringify({
        amount: product.price,
        currency: 'MGA',
        clientName: email.split('@')[0],
        reference: order.id,
        description: `Achat de ${product.title}`,
        successUrl: `${appUrl}/checkout/success?order=${order.id}&token=${order.access_token}`,
        failureUrl: `${appUrl}/checkout/success?order=${order.id}&token=${order.access_token}&status=failed`,
        notificationUrl,
        validDuration: 24,
        payerEmail: email,
        isTestMode: process.env.PAPI_MG_TEST_MODE === 'true',
        ...(process.env.PAPI_MG_TEST_MODE === 'true' ? { testReason: 'Mada Digital Market test' } : {}),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      await admin.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return NextResponse.json({
        error: data?.message || 'Erreur lors de la génération du lien de paiement.',
      }, { status: response.status || 500 });
    }

    const providerData = data?.data || data;
    const paymentUrl = providerData?.paymentLink || data?.payment_link || data?.url || data?.link || '';
    if (!paymentUrl) {
      await admin.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return NextResponse.json({ error: 'Le prestataire n’a pas retourné de lien de paiement.' }, { status: 502 });
    }

    const notificationToken = providerData?.notificationToken;
    const providerReference = providerData?.paymentReference;
    const { error: orderUpdateError } = await admin.from('orders').update({
      provider_notification_token: typeof notificationToken === 'string' ? notificationToken : null,
      provider_reference: typeof providerReference === 'string' ? providerReference : null,
    }).eq('id', order.id);
    if (orderUpdateError) throw new Error(orderUpdateError.message);

    return NextResponse.json({
      paymentUrl,
      orderId: order.id,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors du checkout.' },
      { status: 500 },
    );
  }
}
