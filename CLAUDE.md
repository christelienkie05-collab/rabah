# CLAUDE.md — Lyra Music

Documentation de référence pour l'assistant IA sur ce projet.

---

## Vue d'ensemble

**Lyra Music** est une marketplace trois-tiers pour les musiciens gospel chrétiens. Elle connecte des organisateurs d'événements avec des talents musicaux chrétiens, et opère une boutique dropshipping d'instruments de musique. Les paiements sont sécurisés via un système d'escrow Stripe.

---

## Architecture

```
lyra-music/
├── backend/          # API Node.js/Express (Railway)
├── site-c/           # Frontend SPA HTML/CSS/JS (Netlify)
├── mobile/           # App React Native/Expo (iOS + Android)
├── make-scenario/    # Automatisations Make.com (Thomann)
└── .github/          # CI/CD GitHub Actions
```

### Déploiements

| Composant | Technologie | URL cible |
|-----------|-------------|-----------|
| Frontend  | Netlify     | lyra-music-app.netlify.app |
| API       | Railway     | lyra-music-api.railway.app |
| Mobile    | EAS Build   | iOS App Store + Google Play |

---

## Stack Technique

### Backend (`/backend`)
- **Runtime**: Node.js v20
- **Framework**: Express.js
- **Base de données**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Paiements**: Stripe (PaymentIntents, Connect, Transfers)
- **Email**: Resend API
- **Push notifications**: Firebase Cloud Messaging (FCM)
- **Cron**: node-cron (auto-libération escrow)

### Frontend (`/site-c`)
- HTML/CSS/JavaScript vanilla — aucun framework
- Polices : Cormorant Garamond + DM Sans (Google Fonts)
- Thème : fond sombre `#0D0D0D`, accents or `#C9A84C`
- Layout : CSS Grid masonry responsive (3 col → 2 → 1)

### Mobile (`/mobile`)
- **Framework**: React Native + Expo
- **Navigation**: React Navigation (stack + onglets bas)
- **Push**: expo-notifications + FCM
- **Types**: TypeScript

---

## Base de Données (Prisma)

### Modèles principaux

| Modèle | Description |
|--------|-------------|
| `User` | Utilisateurs (email, rôle, plan Stripe, FCM token) |
| `TalentProfile` | Profil musicien (catégorie, bio, zone géo, Stripe Connect) |
| `ServiceProvider` | Prestataires (son, déco, restauration) |
| `Announcement` | Annonces d'événements (date, budget, instruments, SOS) |
| `Booking` | Réservations avec escrow Stripe et frais plateforme |
| `Product` | Instruments Thomann avec prix dynamiques |
| `Order` | Commandes dropshipping avec suivi marges |
| `Boost` | Visibilité payante avec expiration |
| `Message` | Messagerie interne entre utilisateurs |

### Rôles utilisateurs (`UserRole`)
- `ANNONCEUR` — Organisateurs d'événements
- `MUSICIEN` — Talents musicaux
- `ADMIN` — Administration plateforme

### Plans (`UserPlan`)
- `FREE` — Gratuit
- `BASIC` — 5€/mois
- `PRO` — 15€/mois

### Catégories de talents (`TalentCategory`)
`PIANO`, `GUITARE`, `BASSE`, `BATTERIE`, `CHANT`, `VIOLON`, `SAXOPHONE`, `TROMPETTE`, `DJ`, `DANSEUR`

### Statuts de réservation (`BookingStatus`)
`PENDING` → `ESCROW` → `COMPLETED` / `DISPUTED` / `CANCELLED`

---

## Services Backend

### Escrow (`src/escrow/service.js`)
Gère le flux de paiement sécurisé :
1. Crée un `PaymentIntent` Stripe en capture manuelle (argent bloqué)
2. Libère l'escrow après confirmation de l'organisateur
3. **Auto-libération** 48h après l'événement si aucun litige
4. Gestion des litiges et remboursements
5. Notifications email/push à chaque étape

**Frais plateforme** : 10% sur chaque réservation.

### Moteur de prix (`src/pricing/engine.js`)
Calcul dynamique des marges par catégorie de produit :
- Instruments haute valeur (pianos) → faible marge %
- Accessoires bas de gamme (câbles, médiators) → marge élevée %
- Recalcul possible de tout le catalogue si les prix sources changent

### Notifications (`src/notifications/`)
- **Email** (`email.js`) : confirmations de commande, virements, alertes litiges — via Resend API
- **Push** (`push.js`) : alertes SOS aux talents par catégorie + zone géo, paiements, livraisons — via FCM

### Commandes (`src/orders/service.js`)
Flux dropshipping : `PAID` → `FORWARDED` → `SHIPPED` → `DELIVERED` / `REFUNDED`

---

## App Mobile — Écrans

| Écran | Fichier | Description |
|-------|---------|-------------|
| Feed | `FeedScreen.tsx` | Galerie masonry des talents avec filtres |
| Annonces | `AnnoncesScreen.tsx` | Annonces d'événements |
| Boutique | `BoutiqueScreen.tsx` | Shop d'instruments |
| SOS | `SOSScreen.tsx` | Demandes urgentes de talents |

---

## Modèle Économique

| Source | Montant |
|--------|---------|
| Commission escrow | 10% par réservation |
| Boost visibilité | 5€/semaine ou 15€/mois |
| Abonnement Basic | 5€/mois |
| Abonnement Pro | 15€/mois |
| Marges boutique | 8% (pianos) à 30% (médiators/accessoires) |

---

## Variables d'Environnement

Fichier de référence : `backend/.env.example`

```env
# Base de données
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_ACCOUNT=acct_...

# Make.com (Thomann dropshipping)
MAKE_WEBHOOK_URL=https://hook.eu2.make.com/...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@lyra-music.app

# Firebase FCM
FIREBASE_PROJECT_ID=lyra-music-app
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...

# App
JWT_SECRET=          # min 32 caractères
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## Commandes de Développement

### Backend
```bash
cd backend
npm install
npm run db:generate    # génère le client Prisma
npm run db:migrate     # applique les migrations
npm run db:studio      # ouvre Prisma Studio (UI DB)
npm run dev            # démarrage avec nodemon
npm start              # production
```

### Mobile
```bash
cd mobile
npm install
npm start              # Expo dev server
npm run android        # émulateur Android
npm run ios            # simulateur iOS
npm run build:android  # EAS build Android
npm run build:ios      # EAS build iOS
```

---

## CI/CD (GitHub Actions)

Fichier : `.github/workflows/ci.yml`

**Déclencheurs** : push sur `main`/`develop`, PR vers `main`

**Pipeline Backend** :
1. `npm ci`
2. `prisma validate`

**Pipeline Mobile** :
1. `npm ci`
2. TypeScript `tsc --noEmit`

---

## Intégration Thomann (Make.com)

Le fichier `make-scenario/dropshipping-thomann.json` contient le scénario Make.com pour :
- Recevoir les commandes depuis le backend (webhook)
- Les transmettre automatiquement à Thomann
- Mettre à jour le statut de commande en retour

---

## Points d'attention

- **Escrow** : ne jamais capturer manuellement un `PaymentIntent` sans vérification du statut de la réservation
- **Stripe Connect** : chaque musicien a son propre `stripeAccountId` — les virements se font vers ce compte
- **SOS** : les notifications SOS sont diffusées par catégorie ET zone géographique — vérifier la logique de filtrage dans `push.js`
- **Marges** : le moteur de prix inclut des justifications texte affichées aux clients — ne pas supprimer ce champ
- **JWT_SECRET** : doit faire au moins 32 caractères en production
