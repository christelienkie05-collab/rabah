# Lyra Music — Plateforme Gospel & Événementiel

> Marketplace de talents musicaux chrétiens · Boutique dropshipping · App mobile React Native

---

## 🗂 Structure du repo

```
lyra-music/
├── site-c/          → Frontend HTML/CSS/JS (Netlify)
├── backend/         → API Node.js + Prisma + Stripe escrow
├── mobile/          → App React Native (iOS + Android)
└── make-scenario/   → Scénario Make.com (dropshipping Thomann)
```

## 🚀 Démarrage rapide

### Backend
```bash
cd backend
cp .env.example .env   # Remplir les clés
npm install
npx prisma migrate dev
npm run dev
```

### Site C (Netlify)
```bash
cd site-c
# Drag & drop sur Netlify OU
netlify deploy --prod
```

### App Mobile
```bash
cd mobile
npm install
npx expo start
```

## 🌐 URLs
| Env | URL |
|-----|-----|
| Site C (prod) | `lyra-music-app.netlify.app` |
| API (prod) | `lyra-music-api.railway.app` |
| Admin | `/admin` |

## 💰 Monétisation
- **Escrow** : 10% commission sur chaque prestation
- **Boost** : 5€/sem ou 15€/mois pour apparaître en tête de feed
- **Plans** : Basique 5€/mois · Pro 15€/mois
- **Boutique** : Marge variable par catégorie (voir `backend/src/pricing/`)

## 📱 App Mobile — Fonctionnalités
- Feed masonry talents + filtres
- Profil musicien complet
- Notifications push SOS urgence (FCM)
- Messagerie interne
- Setlists partagées
- Paiement intégré Stripe

## 🔑 Variables d'environnement
Voir `backend/.env.example`
