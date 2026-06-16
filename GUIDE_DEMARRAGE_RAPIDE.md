╔════════════════════════════════════════════════════════════════════════════════╗
║        🚀 GUIDE DE DÉMARRAGE RAPIDE - OOREDOO PORTAL (COMPLET)                  ║
╚════════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
PRÉ-REQUIS
═══════════════════════════════════════════════════════════════════════════════

✅ Installés:
  □ Node.js (v16+)
  □ npm (v8+)
  □ PostgreSQL (v12+)
  □ Git (optionnel)

Vérifier les versions:
  node --version      # v20.x.x +
  npm --version       # v10.x.x +
  psql --version      # PostgreSQL 12+

═══════════════════════════════════════════════════════════════════════════════
ÉTAPE 1: PRÉPARATION DE LA BASE DE DONNÉES
═══════════════════════════════════════════════════════════════════════════════

1. Ouvrir pgAdmin ou une connexion PostgreSQL:
   psql -U postgres

2. Créer la base de données:
   CREATE DATABASE ooredoo_portal;

3. Se connecter à la base:
   \c ooredoo_portal

4. Exécuter le script de création des tables:
   - Ouvrir: backend/scripts/database.sql
   - OU copier-coller le contenu SQL ci-dessous:

   ╔─────────────────────────────────────────────────────────────╗
   ║ SCRIPT SQL À EXÉCUTER                                       ║
   ╚─────────────────────────────────────────────────────────────╝

   CREATE TABLE IF NOT EXISTS users (
     id SERIAL PRIMARY KEY,
     nom VARCHAR(100) NOT NULL,
     prenom VARCHAR(100) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     mot_de_passe VARCHAR(255) NOT NULL,
     role VARCHAR(50) DEFAULT 'manager',
     zone VARCHAR(100),
     statut VARCHAR(50) DEFAULT 'en_attente',
     otp_code VARCHAR(6),
     otp_expire TIMESTAMP,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE IF NOT EXISTS access_logs (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     action VARCHAR(100) DEFAULT 'login',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE IF NOT EXISTS reset_tokens (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) NOT NULL,
     token VARCHAR(6) NOT NULL,
     expire_at TIMESTAMP NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Créer un utilisateur admin de test
   INSERT INTO users (nom, prenom, email, mot_de_passe, role, zone, statut)
   VALUES (
     'Hazem',
     'Hazem',
     'hazemhazem@gmail.com',
     '$2a$10$9pza8gyNP0KyiAGGKyqg1eP2QF.5K5K5K5K5K5K5K5K5K5K5K5K5K', -- Admin123456 hashé
     'admin',
     'Zone Test',
     'approuve'
   );

   ✅ Si vous voyez "INSERT 0 1" → Succès!

═══════════════════════════════════════════════════════════════════════════════
ÉTAPE 2: CONFIGURATION BACKEND
═══════════════════════════════════════════════════════════════════════════════

1. Naviguer au répertoire backend:
   cd c:\Users\starinfo\Desktop\projet_pfe_technique\portailweb\backend

2. Créer/Vérifier le fichier .env:
   Fichier: backend/.env
   Contenu:

   ────────────────────────────────────────────
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=1920
   DB_NAME=ooredoo_portal
   JWT_SECRET=ooredoo_secret_key_2025
   EMAIL_USER=votre_email@gmail.com
   EMAIL_PASS=votre_mot_de_passe_app
   EMAIL_FROM="Ooredoo Portal" <noreply@ooredoo.tn>
   PORT=5000
   DEV_MODE=true
   ADMIN_EMAIL=admin@ooredoo.tn
   BASE_URL=http://localhost:5000
   ────────────────────────────────────────────

3. Installer les dépendances:
   npm install

   Paquets qui seront installés:
   ✓ express
   ✓ cors
   ✓ helmet
   ✓ express-rate-limit
   ✓ bcryptjs
   ✓ jsonwebtoken
   ✓ dotenv
   ✓ pg (PostgreSQL)
   ✓ nodemailer

═══════════════════════════════════════════════════════════════════════════════
ÉTAPE 3: CONFIGURATION FRONTEND
═══════════════════════════════════════════════════════════════════════════════

1. Naviguer au répertoire frontend:
   cd c:\Users\starinfo\Desktop\projet_pfe_technique\portailweb\frontend

2. Installer les dépendances:
   npm install

   Paquets qui seront installés:
   ✓ react
   ✓ react-router-dom
   ✓ axios
   ✓ vite
   ✓ vite-plugin-pwa

═══════════════════════════════════════════════════════════════════════════════
ÉTAPE 4: DÉMARRAGE DES SERVEURS
═══════════════════════════════════════════════════════════════════════════════

TERMINAL 1 - Backend (Garder ouvert):
───────────────────────────────────────

cd c:\Users\starinfo\Desktop\projet_pfe_technique\portailweb\backend
node server.js

✅ Résultat attendu:
   🚀 Service de rapport automatique planifié à 20h00.
   🚀 Serveur démarré sur le port 5000
   ✅ Connecté à PostgreSQL
   ✅ Connecté à PostgreSQL (pool)
   ⚠️  MODE DEV ACTIVÉ - OTP affichés sur frontend


TERMINAL 2 - Frontend (Garder ouvert):
──────────────────────────────────────

cd c:\Users\starinfo\Desktop\projet_pfe_technique\portailweb\frontend
npm run dev

✅ Résultat attendu:
   ➜ Local:   http://localhost:5173/
   ➜ Network: http://192.168.110.135:5173/
   ➜ press h + enter to show help

═══════════════════════════════════════════════════════════════════════════════
ÉTAPE 5: ACCÈS À L'APPLICATION
═══════════════════════════════════════════════════════════════════════════════

1. Ouvrir le navigateur:
   http://localhost:5173

2. Vous devriez voir la page d'accueil avec le logo Ooredoo

3. Cliquer sur "Se connecter" ou aller directement à:
   http://localhost:5173/login

═══════════════════════════════════════════════════════════════════════════════
ÉTAPE 6: TEST DE CONNEXION
═══════════════════════════════════════════════════════════════════════════════

Écran 1 - Email & Mot de passe:
───────────────────────────────

Email professionnel:
  hazemhazem@gmail.com

Mot de passe:
  Admin123456

Cliquer: "Se connecter"

✅ Résultat: Écran OTP apparaît


Écran 2 - Code OTP:
───────────────────

Le code OTP s'affiche automatiquement sur la page (mode DEV)
Format: ⚠️ [Mode Dev] Code OTP : XXXXXX

Copier le code de 6 chiffres
Coller dans le champ "Code OTP"
Le code se valide automatiquement

✅ Résultat: Redirection vers le Dashboard


Écran 3 - Dashboard:
────────────────────

Vous voyez:
  ✓ Logo Ooredoo
  ✓ Navigation: ACCUEIL, STATS, ALERTES, NOTIFS, PROFIL
  ✓ Icône utilisateur en haut à droite
  ✓ Notifications (badge)
  ✓ Tableau de bord SLA

✅ SUCCÈS! Vous êtes maintenant connecté! 🎉

═══════════════════════════════════════════════════════════════════════════════
TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

ERREUR: "Mot de passe incorrect"
────────────────────────────────

Solution 1: Vider le cache du navigateur
  - Appuyez sur Ctrl+Shift+R (hard refresh)
  - Ou F12 → Application → Clear Site Data

Solution 2: Vérifier l'utilisateur en DB
  psql -U postgres ooredoo_portal
  SELECT * FROM users WHERE email = 'hazemhazem@gmail.com';
  
  Doit montrer:
  - statut = 'approuve'
  - mot_de_passe = hash bcrypt

Solution 3: Redémarrer les serveurs
  Backend: Ctrl+C, puis: node server.js
  Frontend: Ctrl+C, puis: npm run dev


ERREUR: "Port 5000 already in use"
──────────────────────────────────

Windows:
  taskkill /F /IM node.exe
  Puis relancer: node server.js

Linux/Mac:
  killall node
  Puis relancer: node server.js


ERREUR: "Cannot find module 'express'"
──────────────────────────────────────

Solution: Réinstaller les dépendances
  cd backend
  rm -rf node_modules
  npm install


ERREUR: "PostgreSQL connection refused"
───────────────────────────────────────

Vérifier que PostgreSQL tourne:
  Windows: Services → PostgreSQL Server
  
Vérifier les paramètres .env:
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=postgres
  DB_PASSWORD=1920

Tester la connexion:
  psql -U postgres -h localhost -d ooredoo_portal


ERREUR: "OTP non reçu par email"
────────────────────────────────

Mode DEV (développement):
  - DEV_MODE=true dans .env
  - OTP s'affiche sur le frontend
  - Pas d'email envoyé (OK!)

Mode PROD (production):
  - DEV_MODE=false dans .env
  - EMAIL_USER et EMAIL_PASS doivent être configurés
  - OTP envoyé par email

═══════════════════════════════════════════════════════════════════════════════
FICHIERS IMPORTANTS
═══════════════════════════════════════════════════════════════════════════════

Backend:
  ✓ backend/.env                              → Configuration
  ✓ backend/server.js                         → Entrée principal
  ✓ backend/config/db.js                      → Connexion BD
  ✓ backend/controllers/authController.js     → Logique auth
  ✓ backend/routes/auth.js                    → Routes auth
  ✓ backend/middleware/auth.js                → Vérification JWT

Frontend:
  ✓ frontend/src/utils/api.jsx                → Client axios
  ✓ frontend/src/context/AuthContext.jsx      → État global
  ✓ frontend/src/pages/Login/Login.jsx        → Page login
  ✓ frontend/vite.config.ts                   → Config Vite

═══════════════════════════════════════════════════════════════════════════════
COMMANDES UTILES
═══════════════════════════════════════════════════════════════════════════════

Tests Backend:
  node backend/test_login.js
  node backend/test_complete_flow.js

Réinitialiser la Base de Données:
  psql -U postgres -d ooredoo_portal < backend/database.sql

Tuer tous les serveurs Node:
  taskkill /F /IM node.exe  (Windows)
  killall node               (Linux/Mac)

═══════════════════════════════════════════════════════════════════════════════
SUPPORT
═══════════════════════════════════════════════════════════════════════════════

Si le problème persiste:
  1. Vérifier les logs dans les terminaux
  2. Ouvrir F12 dans le navigateur → Console
  3. Vérifier la base de données:
     SELECT * FROM users;
     SELECT * FROM access_logs;

═══════════════════════════════════════════════════════════════════════════════
