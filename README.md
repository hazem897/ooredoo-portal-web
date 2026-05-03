# 📱 Ooredoo Management Portal

Bienvenue dans le dépôt du portail de gestion Ooredoo. Il s'agit d'une application de gestion d'entreprise complète et moderne, construite avec React, Node.js, et Express, offrant une interface performante, sécurisée et installable comme application native (PWA).

---

## ✨ Fonctionnalités Principales

Le portail a été conçu avec de nombreuses fonctionnalités avancées :

1. **🔒 Authentification Sécurisée & Contrôle d'Accès**
   - **Chiffrement des Mots de Passe** : Utilisation de `bcryptjs` pour le hachage sécurisé (Salt & Hash) des mots de passe en base de données.
   - **Authentification sans État (Stateless)** : Jetons `JWT` (JSON Web Tokens) avec expiration définie pour maintenir les sessions de manière sécurisée.
   - **MFA / Validation OTP** : Système de code à usage unique (OTP) envoyé par e-mail via `Nodemailer` requis pour les connexions et récupérations de compte.
   - **Validation des Entrées** : Exigence de mots de passe forts (Regex combinant majuscules, minuscules, chiffres, caractères spéciaux et longueur > 8).
   - **Protection contre les Injections SQL** : L'API repose sur `mysql2` avec des requêtes paramétrées automatiques (`?`) empêchant les entrées malveillantes.
   - **Routage et Intercepteurs** : Côté client, Axios injecte automatiquement le token Bearer, et des "Protected Routes" (HOC React) bloquent l'accès aux pages non autorisées.
   - **Validation Humaine** : L'inscription d'un nouvel utilisateur impose l'approbation manuelle par un administrateur (Statut "en_attente") avant de s'y connecter.
   - **Déconnexion Automatique** : (Session Timeout) en cas d'inactivité détectée.

2. **🌍 Interface Multilingue (i18n)**
   - Support complet du Français, de l'Anglais et de l'Arabe.
   - Changement de langue dynamique persistant dans toute l'application.

3. **📲 Application Web Progressive (PWA)**
   - Le portail est installable sur appareils mobiles et ordinateurs (bouton "Install App" dédié dans le menu).
   - Offre une expérience native et fluide sans passage par l'App Store/Play Store.

4. **🧑‍💻 Gestion des Profils & Utilisateurs**
   - Mise à jour des mots de passe avec indicateurs visuels de force de sécurité.
   - Téléchargement et gestion de photos de profil (avec avatar par défaut de haute qualité).
   - Interface d'administration pour gérer les statuts des comptes et les demandes d'accès.

5. **📊 Tableau de Bord & Cartographie Interactive**
   - Statistiques et graphiques dynamiques pour le suivi des activités.
   - Intégration d'une carte interactive Leaflet.js offrant une vue animée et cinématique du siège social d'Ooredoo (Charguia II).

6. **✉️ Notifications & Emails Automatisés**
   - Envoi de mails transactionnels dotés du branding officiel d'Ooredoo (validation de compte, OTP).
   - Système centralisé `emailService` gérant tous les templates d'e-mails.
   - Badges et alertes in-app animés, avec compatibilité Mode Sombre (Dark Mode).

7. **📝 Journalisation (Logs) & Reporting**
   - Historique d'accès et d'activité techniques enregistré en base de données.
   - Génération et envoi automatique (tâche Cron) de rapports au format PDF, CSV, et Excel.

8. **📱 Compatibilité Mobile & UX Native**
   - Responsivité complète : grilles fluides, Navbar dynamique et Hamburger Menu (SVG) visible sur tout écran.
   - Menu latéral (Sidebar) en surimpression (Overlay) intelligente sur mobile, se refermant automatiquement pour laisser la vue dégagée.
   - PWA optimisée avec un bouton "Installer" dédié pour les tablettes et les smartphones.

9. **📊 Intégration Power BI Publique & Privée**
   - Intégration sécurisée du Dashboard interactif Power BI dans l'espace protégé.
   - Route publique `/powerbi` pour visualiser des rapports dynamiques (si publiés sur le Web) sans nécessiter de connexion au portail.

---

## 📂 Architecture et Structure du Projet

Le projet suit un modèle modulaire, séparant clairement les responsabilités (Backend API et Frontend React).

### 🛠️ BACKEND (Node.js/Express)
Le backend est factorisé en suivant une architecture de type MVC pour faciliter sa maintenance et son évolution.

```text
backend/
├── assets/                 # Ressources statiques (ex: logo Ooredoo pour les emails)
├── config/                 # Configurations centrales (db.js, nodemailer.js)
├── controllers/            # Contrôleurs : Logique métier (authController.js)
├── middleware/             # Intergiciels (ex: logger.js pour enregistrer les actions)
├── routes/                 # Définition des endpoints API (auth, users, dashboard, logs)
├── services/               # Services métier spécialisés (emailService.js, reportService.js)
├── utils/                  # Fonctions utilitaires (générateur OTP, etc.)
├── scripts/                # Outils de requêtes manuelles et tests
├── cronScheduler.js        # Planificateur de tâches pour les opérations automatisées
├── server.js               # Point d'entrée principal de l'API Serveur
└── .env                    # Fichier des variables d'environnement (Mots de passe, Ports)
```

### 🎨 FRONTEND (React + Vite)
Le client est structuré par composants et pages, garantissant un code propre et un routage aisé.

```text
frontend/
├── public/                 # Images et icônes statiques (manifeste PWA)
├── src/
│   ├── api/                # Configuration Axios avec intercepteurs de requêtes/Tokens
│   ├── components/         # Composants d'interface (Layout, Protected Routes)
│   ├── context/            # Gestion des variables globales (AuthContext, LanguageContext)
│   ├── layouts/            # Gabarits de design (Ex: Sidebar + Header persistent)
│   ├── pages/              # Vues de l'application (Dashboard, Login, Admin, Profil...)
│   ├── services/           # Logique spécifique côté front (appels API abstraits)
│   ├── App.jsx             # Fichier de routage de base
│   ├── index.css           # Feuille de styles globale variables de couleurs (Dark Mode)
│   └── main.tsx            # Point d'entrée de React
├── vite.config.ts          # Options de compilation Vite et PWA
└── package.json            # Dépendances applicatives
```

---

## 🛡️ Architecture d'Hébergement & Sécurité Réseau (Intranet)

Ce portail est optimisé pour être déployé dans un environnement hautement sécurisé, typiquement en mode **« Host-Only » (Réseau Local / Intranet)**. Cette méthode d'hébergement est idéale pour confiner les données d'entreprise et protéger les utilisateurs.

### 1. Le Serveur Multi-résident (Dual-homed / Gateway)
Le système est conçu pour tourner sur un serveur centralisé (ou machine virtuelle) qui possède deux interfaces :
- **Réseau Local (LAN)** : Interface utilisée par les employés pour accéder à la plateforme (via une adresse IP locale, ex: `http://192.168.1.50`).
- **Réseau Public (WAN)** : Interface strictement réservée au backend Node.js pour atteindre l'extérieur (ex: envoyer des e-mails sécurisés `smtp.gmail.com` ou des requêtes API externes).

### 2. Isolation Stratégique des Utilisateurs (Règles Firewall)
Pour une sécurité "Zero Trust" (Zéro Confiance) sans perte de fonctionnalité, il est recommandé d'appliquer ces règles sur le pare-feu de l'entreprise :
- **Bloquer :** L'accès Internet pour tous les appareils des employés connectés à ce réseau. Ils ne peuvent voir que le portail local. Cela élimine les risques de fuites de données (DLP) ou d'infections par malware.
- **Autoriser :** L'accès Internet **uniquement** pour l'IP du serveur hébergeant le Portail Ooredoo (pour les mises à jour système et l'envoi des OTP).

### 3. Authentification par "Out-of-Band" (2FA Hors-Bande)
Étant donné que les ordinateurs locaux de l'Intranet n'ont plus Internet, les utilisateurs ne peuvent pas ouvrir Gmail sur la machine. **Ils reçoivent donc leur code OTP par e-mail directement sur leur smartphone personnel (via le réseau mobile 4G)**. Ce mécanisme agit comme une double authentification matérielle (2FA) infranchissable, protégeant ainsi l'accès même si un terminal interne venait à être compromis.

---

## 🚀 Guide de Démarrage

### Pré-requis
- Node.js installé (et npm).
- Base de données locale MySQL configurée.

### Backend

1. Ouvrez un terminal dans le dossier racine ou `backend/`.
2. Installez les dépendances : `npm install`
3. Vérifiez vos variables d'environnement dans le `.env` (Identifiants Base de Données, Configurations Email).
4. Démarrez le serveur serveur Node :
   ```bash
   node server.js
   # ou utilisez nodemon pour le développement
   nodemon server.js
   ```

### Frontend

1. Ouvrez un terminal dans le dossier frontend (`frontend`).
2. Installez les dépendances : `npm install`
3. Démarrez l'environnement de développement :
   ```bash
   npm run dev
   ```

> **Note :** La couche réseau du Frontend (`src/api/axios.js`) injecte de manière sécurisée les jetons d'autorisation dans chaque requête. Si l'API renvoie des réponses nulles, vérifiez que le backend tourne sur le bon port, et que le tunnel d'interception CORS est adéquat.