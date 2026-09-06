import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedClient, getProducts } from '@/lib/supabase';
import { isAllowedRole } from '@/lib/auth';

const productInputSchema = z.object({
  title: z.string().trim().min(3, 'Le titre doit contenir au moins 3 caractères.').max(120),
  price: z.coerce.number().int().min(100, 'Le prix minimum est de 100 MGA.').max(100_000_000),
  description: z.string().trim().min(10, 'La description doit contenir au moins 10 caractères.').max(5_000),
  file_url: z.string().url('Le lien du fichier est invalide.'),
  image_url: z.string().trim().max(120).nullable().optional(),
  category: z.enum(['Design', 'Marketing', 'Productivité', 'Automatisation']),
});

const fallbackProducts = [
  {
    id: 'demo-1',
    title: 'Pack Starter Canva Pro',
    price: 15000,
    description: 'Modèles premium pour créer des visuels professionnels et accélérer votre présence digitale.',
    category: 'Design',
    file_url: 'https://example.com/files/canva-pack.zip',
    image_url: '🎨',
  },
  {
    id: 'demo-2',
    title: 'Mini cours Notion Business',
    price: 22000,
    description: 'Un système simple pour organiser vos tâches, vos clients et votre suivi commercial.',
    category: 'Productivité',
    file_url: 'https://example.com/files/notion-business.pdf',
    image_url: '📘',
  },
  {
    id: 'demo-3',
    title: 'Kit de branding digital',
    price: 35000,
    description: 'Un pack complet pour lancer une identité visuelle cohérente et mémorable.',
    category: 'Marketing',
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

    const parsed = productInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Données produit invalides.' }, { status: 400 });
    }

    const { data: product, error: productError } = await client.from('products').insert({
      ...parsed.data,
      image_url: parsed.data.image_url || null,
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
