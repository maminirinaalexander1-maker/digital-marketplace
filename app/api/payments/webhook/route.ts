import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function getString(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const status = (getString(payload, ['paymentStatus', 'status', 'payment_status', 'state']) || '').toLowerCase();
    const reference = getString(payload, ['paymentReference', 'order_id', 'orderId', 'item_id', 'reference', 'transaction_id']);
    const notificationToken = getString(payload, ['notificationToken', 'notification_token']);

    if (!reference) {
      return NextResponse.json({ error: 'Référence de commande absente.' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: order, error: orderLookupError } = await admin
      .from('orders')
      .select('id, status, provider_notification_token')
      .eq('id', reference)
      .maybeSingle();
    if (orderLookupError) return NextResponse.json({ error: orderLookupError.message }, { status: 500 });
    if (!order) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    if (!notificationToken || notificationToken !== order.provider_notification_token) {
      return NextResponse.json({ error: 'Notification Papi.mg non vérifiée.' }, { status: 401 });
    }

    const isPaid = ['success', 'paid'].includes(status);
    const isFailed = ['failed', 'cancelled', 'canceled', 'expired'].includes(status);
    const nextStatus = isPaid ? 'paid' : isFailed ? 'failed' : null;

    if (!nextStatus) {
      return NextResponse.json({ received: true, updated: false });
    }

    const update = {
      status: nextStatus,
      ...(isPaid ? { paid_at: new Date().toISOString() } : {}),
    };
    const { error } = await admin.from('orders').update(update).eq('id', reference);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ received: true, updated: true });
  } catch {
    return NextResponse.json({ error: 'Payload webhook invalide.' }, { status: 400 });
  }
}
