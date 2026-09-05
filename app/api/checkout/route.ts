import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/supabase';

const fallbackProducts = [
  { id: 'demo-1', title: 'Pack Starter Canva Pro', price: 15000, file_url: 'https://example.com/files/canva-pack.zip' },
  { id: 'demo-2', title: 'Mini cours Notion Business', price: 22000, file_url: 'https://example.com/files/notion-business.pdf' },
  { id: 'demo-3', title: 'Kit de branding digital', price: 35000, file_url: 'https://example.com/files/branding-kit.zip' },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, email } = body ?? {};

    if (!productId || typeof productId !== 'string' || !email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Données de paiement incomplètes.' }, { status: 400 });
    }

    const fallbackProduct = fallbackProducts.find((product) => product.id === productId);
    const product = fallbackProduct || await getProductById(productId);

    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });
    }

    const apiKey = process.env.PAPI_MG_API_KEY;
    const baseUrl = (process.env.PAPI_MG_BASE_URL || 'https://app.papi.mg').replace(/\/dashboard\/api\/?$/, '');

    if (!apiKey) {
      return NextResponse.json({ error: 'PAPI_MG_API_KEY non configurée.' }, { status: 500 });
    }

    const response = await fetch(`${baseUrl}/dashboard/api/payment-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount: product.price,
        currency: 'MGA',
        description: `Achat de ${product.title}`,
        email,
        item_id: product.id,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?title=${encodeURIComponent(product.title)}&download=${encodeURIComponent(product.file_url)}`,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json({
        error: data?.message || 'Erreur lors de la génération du lien de paiement.',
      }, { status: response.status || 500 });
    }

    return NextResponse.json({
      paymentUrl: data?.payment_link || data?.url || data?.link || '',
      downloadUrl: product.file_url,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors du checkout.' },
      { status: 500 },
    );
  }
}
