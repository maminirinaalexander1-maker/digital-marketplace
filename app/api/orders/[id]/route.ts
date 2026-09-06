import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type RouteContext = { params: Promise<{ id: string }> };

function getStoragePath(fileUrl: string) {
  const marker = '/storage/v1/object/public/digital-files/';
  const index = fileUrl.indexOf(marker);
  return index >= 0 ? decodeURIComponent(fileUrl.slice(index + marker.length)) : null;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const token = new URL(request.url).searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Jeton de commande requis.' }, { status: 401 });

    const admin = getSupabaseAdmin();
    const { data: order, error } = await admin
      .from('orders')
      .select('id, status, amount, created_at, paid_at, products(title, file_url)')
      .eq('id', id)
      .eq('access_token', token)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!order) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });

    const product = Array.isArray(order.products) ? order.products[0] : order.products;
    let downloadUrl: string | null = null;
    if (order.status === 'paid' && product?.file_url) {
      const path = getStoragePath(product.file_url);
      if (path) {
        const signed = await admin.storage.from('digital-files').createSignedUrl(path, 600);
        downloadUrl = signed.data?.signedUrl || null;
      } else {
        downloadUrl = product.file_url;
      }
    }

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        amount: order.amount,
        created_at: order.created_at,
        paid_at: order.paid_at,
        title: product?.title || 'Votre achat',
        downloadUrl,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur de récupération de la commande.' },
      { status: 500 },
    );
  }
}
