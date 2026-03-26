# Guide de démarrage — Lyra Music sur Windows
## Pour débutants complets, étape par étape

---

## Ce dont tu as besoin (logiciels à installer)

| Logiciel | À quoi ça sert | Obligatoire |
|----------|----------------|-------------|
| Node.js v20 | Faire tourner le backend et l'app mobile | OUI |
| PostgreSQL | Base de données (ou Supabase en ligne) | OUI |
| VS Code | Éditeur de code | Recommandé |
| Expo Go (téléphone) | Voir l'app mobile sur ton téléphone | OUI pour mobile |

---

## ÉTAPE 1 — Installer Node.js

1. Va sur **https://nodejs.org**
2. Clique sur le bouton vert **"LTS"** (la version stable)
3. Lance le fichier `.msi` téléchargé
4. Clique "Next" jusqu'à la fin, laisse tout par défaut
5. **Redémarre ton ordinateur**

**Vérification** — Ouvre PowerShell (touche Windows + X → "Windows PowerShell") et tape :
```
node --version
npm --version
```
Tu dois voir quelque chose comme `v20.x.x` et `10.x.x`.

---

## ÉTAPE 2 — Créer la base de données (Supabase — GRATUIT, pas d'installation)

> Supabase est une base de données PostgreSQL dans le cloud, gratuite pour les projets perso.

1. Va sur **https://supabase.com** et crée un compte (avec ton email Google)
2. Clique **"New project"**
3. Donne un nom : `lyra-music`
4. Choisis un mot de passe fort → **note-le quelque part**
5. Région : **West EU (Ireland)** → clique "Create new project"
6. Attends 1-2 minutes que le projet se crée

**Récupérer l'URL de connexion :**
- Menu gauche → **Settings** (engrenage) → **Database**
- Descends jusqu'à **"Connection string"** → choisis **"URI"**
- Copie l'URL qui ressemble à :
  ```
  postgresql://postgres:[MOT-DE-PASSE]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
  ```
- Remplace `[MOT-DE-PASSE]` par le mot de passe que tu as choisi à l'étape 5

---

## ÉTAPE 3 — Configurer les variables d'environnement

1. Dans le dossier `lyra-music/backend/`, cherche le fichier `.env.example`
2. **Copie ce fichier** et renomme la copie `.env` (sans "example")
3. Ouvre `.env` avec le Bloc-notes et remplis :

```env
# OBLIGATOIRE pour démarrer
DATABASE_URL="postgresql://postgres:[TON-MOT-DE-PASSE]@db.XXXX.supabase.co:5432/postgres"
JWT_SECRET="lyra-music-dev-secret-key-change-en-prod-32chars"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# OPTIONNEL pour l'instant (laisse les valeurs par défaut)
STRIPE_SECRET_KEY="sk_test_remplacer_plus_tard"
STRIPE_WEBHOOK_SECRET="whsec_remplacer_plus_tard"
STRIPE_PLATFORM_ACCOUNT="acct_remplacer_plus_tard"
MAKE_WEBHOOK_URL="https://hook.eu2.make.com/remplacer"
RESEND_API_KEY="re_remplacer_plus_tard"
EMAIL_FROM="noreply@lyra-music.app"
FIREBASE_PROJECT_ID="lyra-music-app"
FIREBASE_PRIVATE_KEY="placeholder"
FIREBASE_CLIENT_EMAIL="placeholder@placeholder.com"
```

> **Note** : Pour l'instant, seul `DATABASE_URL` et `JWT_SECRET` sont indispensables pour démarrer.

---

## ÉTAPE 4 — Lancer le Backend

Ouvre PowerShell, puis tape ces commandes **une par une** :

```powershell
# Aller dans le dossier backend
cd "C:\Users\nkie9\Downloads\lyra-music-github-repo\lyra-music\backend"

# Installer les dépendances (à faire une seule fois)
npm install

# Générer le client de base de données
npx prisma generate

# Créer les tables dans la base de données
npx prisma migrate dev --name init

# Démarrer le serveur en mode développement
npm run dev
```

**Succès** : tu dois voir dans la console :
```
Server running on port 3001
Database connected
```

L'API est accessible sur : **http://localhost:3001**

---

## ÉTAPE 5 — Lancer l'App Mobile

**D'abord, installe Expo Go sur ton téléphone** :
- Android : Google Play Store → cherche "Expo Go"
- iPhone : App Store → cherche "Expo Go"

Ensuite, ouvre **un deuxième PowerShell** (laisse le backend tourner dans le premier) :

```powershell
# Aller dans le dossier mobile
cd "C:\Users\nkie9\Downloads\lyra-music-github-repo\lyra-music\mobile"

# Installer les dépendances (à faire une seule fois)
npm install

# Démarrer le serveur Expo
npm start
```

Un **QR code** apparaît dans la console.

**Sur ton téléphone :**
- Android : ouvre l'app Expo Go → scanne le QR code
- iPhone : ouvre l'app Appareil photo → scanne le QR code

L'app se charge sur ton téléphone !

---

## ÉTAPE 6 — Voir le Site Web

Le frontend est un simple fichier HTML, pas besoin de serveur.

- Ouvre le dossier `lyra-music/site-c/`
- Double-clique sur `index.html`
- Le site s'ouvre dans ton navigateur

---

## Résumé — Ce que tu fais chaque jour pour développer

### Terminal 1 — Backend
```powershell
cd "C:\Users\nkie9\Downloads\lyra-music-github-repo\lyra-music\backend"
npm run dev
```

### Terminal 2 — Mobile
```powershell
cd "C:\Users\nkie9\Downloads\lyra-music-github-repo\lyra-music\mobile"
npm start
```

---

## Problèmes fréquents

| Problème | Solution |
|----------|----------|
| `node: command not found` | Redémarre le PC après installation de Node.js |
| Erreur connexion base de données | Vérifie l'URL dans `.env`, et que tu as bien remplacé le mot de passe |
| Port 3001 déjà utilisé | Change `PORT=3001` en `PORT=3002` dans `.env` |
| QR code Expo ne fonctionne pas | Assure-toi que ton PC et téléphone sont sur le même Wi-Fi |
| `prisma migrate` échoue | Vérifie que `DATABASE_URL` dans `.env` est correcte |

---

## Prochaines étapes (quand le dev local fonctionne)

1. **Stripe** : Crée un compte sur stripe.com → récupère les clés de test → mets à jour `.env`
2. **Resend** : Crée un compte sur resend.com → récupère `RESEND_API_KEY`
3. **Firebase** : Crée un projet sur console.firebase.google.com pour les notifications push
4. **Déploiement** : Backend → Railway.app | Frontend → Netlify | Mobile → EAS Build

---

*Guide créé le 2026-03-26 — Lyra Music v1.0*
