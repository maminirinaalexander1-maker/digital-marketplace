import { NextResponse } from 'next/server';
import { createAuthenticatedClient, getProducts } from '@/lib/supabase';
import { isAllowedRole } from '@/lib/auth';

const fallbackProducts = [
  {
    id: 'demo-1',
    title: 'Pack Starter Canva Pro',
    price: 15000,
    description: 'Modèles premium pour créer des visuels professionnels et accélérer votre présence digitale.',
    file_url: 'https://example.com/files/canva-pack.zip',
    image_url: '🎨',
  },
  {
    id: 'demo-2',
    title: 'Mini cours Notion Business',
    price: 22000,
    description: 'Un système simple pour organiser vos tâches, vos clients et votre suivi commercial.',
    file_url: 'https://example.com/files/notion-business.pdf',
    image_url: '📘',
  },
  {
    id: 'demo-3',
    title: 'Kit de branding digital',
    price: 35000,
    description: 'Un pack complet pour lancer une identité visuelle cohérente et mémorable.',
    file_url: 'https://example.com/files/branding-kit.zip',
    image_url: '✨',
  },
];

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ products });
  } catch (error: unknown) {
    return NextResponse.json({
      products: fallbackProducts,
      error: error instanceof Error ? error.message : 'Erreur de récupération des produits.',
    }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const accessToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
    if (!accessToken) {
      return NextResponse.json({ error: 'Session Supabase requise.' }, { status: 401 });
    }

    const client = createAuthenticatedClient(accessToken);
    const { data: authData, error: authError } = await client.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Session Supabase invalide ou expirée.' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('email, name, role')
      .eq('id', authData.user.id)
      .maybeSingle();
    const role = profile?.role;
    if (profileError || !profile || !isAllowedRole({ email: profile.email, name: profile.name, role }, ['seller', 'admin'])) {
      return NextResponse.json({ error: 'Accès réservé aux vendeurs et administrateurs.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, price, description, file_url, image_url } = body ?? {};

    if (!title || !description || !file_url) {
      return NextResponse.json({ error: 'Titre, description et fichier requis.' }, { status: 400 });
    }

    const { data: product, error: productError } = await client.from('products').insert({
      title: String(title),
      price: Number(price) || 0,
      description: String(description),
      file_url: String(file_url),
      image_url: image_url ? String(image_url) : null,
      seller_id: authData.user.id,
    }).select().single();

    if (productError) throw new Error(productError.message);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur de création du produit.' },
      { status: 500 },
    );
  }
}
