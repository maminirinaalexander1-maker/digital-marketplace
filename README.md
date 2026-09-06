# Mada Digital Market

Marketplace de produits numériques avec paiement en Ariary MGA, intégration Supabase, Gemini AI et Papi.mg.

## Fonctionnalités
- page d’accueil avec catalogue de produits
- formulaire vendeur avec upload de fichier
- IA Gemini pour réécrire la description commerciale
- lecture des produits via Supabase
- upload dans le bucket `digital-files`
- checkout vers Papi.mg pour paiement MVola / Orange Money
- page de succès avec lien de téléchargement
- auth Supabase avec rôles `buyer`, `seller`, `admin`

## Variables d’environnement
Créer un fichier `.env.local` basé sur `.env.example` :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
PAPI_MG_API_KEY=your-papi-mg-api-key
PAPI_MG_BASE_URL=https://app.papi.mg
PAPI_MG_NOTIFICATION_URL=http://localhost:3000/api/payments/webhook
PAPI_MG_TEST_MODE=false
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Supabase Auth
1. Créer un projet Supabase.
2. Activer `Authentication > Providers > Email`.
3. Ajouter les URLs de redirection :
   - `http://localhost:3000`
   - `http://localhost:3000/**`
   - `http://localhost:3001/**`
4. Exécuter le SQL de [supabase/schema.sql](supabase/schema.sql) et [supabase/auth-triggers.sql](supabase/auth-triggers.sql) dans le SQL Editor.
5. Vérifier que les profils sont créés automatiquement dans `public.profiles` lors des inscriptions.

## Supabase
- Créer un bucket `digital-files`
- Créer une table `products` avec ces colonnes :
  - `id` uuid primary key default gen_random_uuid()
  - `title` text
  - `price` int8
  - `description` text
  - `file_url` text
  - `image_url` text nullable
  - `created_at` timestamptz default now()

## Démarrage
```bash
npm install
npm run dev -- --hostname 0.0.0.0
```

## Vérification
```bash
npm run build
```

## Déploiement Vercel
1. Importer le dépôt GitHub dans Vercel.
2. Sélectionner le framework `Next.js`.
3. Ajouter toutes les variables de `.env.example` dans `Settings > Environment Variables`.
4. Déployer avec les environnements `Production` et `Preview` sélectionnés.
5. Remplacer `NEXT_PUBLIC_APP_URL` par l’URL Vercel réelle, par exemple `https://mon-projet.vercel.app`.

## Déploiement Render
Le fichier `render.yaml` configure un Web Service Node.js avec :

```text
Build: npm ci && npm run build
Start: npm run start
```

Dans Render :
1. Créer un `Blueprint` depuis le dépôt GitHub, ou un Web Service classique.
2. Ajouter les variables marquées `sync: false` dans `render.yaml`.
3. Mettre `NEXT_PUBLIC_APP_URL` à l’URL Render réelle.
4. Lancer le déploiement et vérifier la route `/`.

## URLs Supabase après déploiement
Dans `Authentication > URL Configuration`, ajouter les URLs publiques Vercel et Render :

```text
https://mon-projet.vercel.app/**
https://mon-projet.onrender.com/**
```

Le checkout Papi.mg utilise `Token`, `reference`, `successUrl`, `failureUrl` et `notificationUrl`. Le webhook vérifie `paymentReference` et `notificationToken` avant de passer une commande à `paid`.

En local, `PAPI_MG_NOTIFICATION_URL` doit être une URL HTTPS publique (par exemple un tunnel ngrok), car Papi.mg ne peut pas appeler `localhost`. Le bucket `digital-files` est encore public pour les tests ; avant la production commerciale, passez-le en privé et servez uniquement des URLs signées.

Documentation officielle consultée :
- https://docs.papi.mg/fr/docs/developper-guide/integration-guide
- https://docs.papi.mg/fr/docs/developper-guide/sandbox-environment
- https://docs.papi.mg/fr/docs/developper-guide/preparing-for-production

Le mode sandbox se configure dans le tableau de bord Papi.mg, au niveau de l’application. Pour les tests documentés, Papi fournit des numéros de téléphone et montants déclencheurs ; ne passez en production qu’après avoir testé les statuts `SUCCESS`, `PENDING` et `FAILED`.
