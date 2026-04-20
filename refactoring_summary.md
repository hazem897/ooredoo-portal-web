# 📊 Structure Finale du Projet Ooredoo Portal

Voici l'organisation complète et optimisée du projet après la restructuration. Cette architecture suit les meilleures pratiques de développement (Modularité, Séparation des responsabilités).

---

## 📂 1. BACKEND (Node.js/Express)
Le backend est désormais divisé en modules spécialisés pour faciliter la maintenance.

```text
backend/
├── assets/                 # Ressources statiques
│   └── logo.png            # Logo Ooredoo utilisé dans les emails (local)
├── config/                 # Configurations centrales
│   ├── db.js               # Connexion MySQL (Pool)
│   └── nodemailer.js       # Configuration du transporteur d'emails
├── controllers/            # Logique métier (Le "C" de MVC)
│   └── authController.js   # Logique d'inscription, connexion, OTP, etc.
├── middleware/             # Fonctions intermédiaires
│   └── logger.js           # Enregistrement des activités dans la DB
├── routes/                 # Définition des APIs (Endpoints)
│   ├── auth.js             # Routes /api/auth (Login, Register...)
│   ├── users.js            # Routes /api/users
│   ├── dashboard.js        # Routes /api/dashboard
│   └── logs.js             # Routes /api/logs
├── services/               # Services autonomes
│   ├── emailService.js     # Gestion de TOUS les templates d'emails (OTP, Rapports)
│   └── reportService.js    # Logique de génération PDF, Excel et CSV
├── utils/                  # Fonctions utilitaires
│   └── otp.js              # Générateur de code OTP
├── scripts/                # Outils de maintenance et tests
│   ├── test_report.js      # Script pour forcer l'envoi du rapport quotidien
│   ├── test_mail.js        # Test rapide d'envoi d'un simple email
│   └── cronReport.js       # (Archive) Ancien fichier de rapport
├── cronScheduler.js        # Planificateur de tâches (Script 20h00)
├── server.js               # Fichier principal (Démarrage du serveur)
└── .env                    # Variables secrètes (Ports, Emails, Password DB)
```

---

## 📂 2. FRONTEND (React + Vite)
L'interface est organisée par composants et services pour éviter les fichiers trop volumineux.

```text
ooredoo-portal-vite/
├── public/                 # Images et icônes statiques
├── src/
│   ├── api/                # Configuration des requêtes
│   │   └── axios.js        # Instance Axios centrale avec intercepteur de Token
│   ├── components/         # Composants réutilisables
│   │   ├── layout/         # Navbar.jsx, Sidebar.jsx
│   │   ├── RouteProtegee.js# Protection des pages privées
│   │   └── RouteAdmin.js   # Restriction aux administrateurs
│   ├── context/            # Gestion d'état global
│   │   ├── AuthContext.js  # État de l'utilisateur connecté
│   │   └── LanguageContext.js # Gestion de la langue (FR/AR)
│   ├── layouts/            # Gabarits de pages
│   │   └── MainLayout.jsx  # Structure commune (Header + Sidebar + Contenu)
│   ├── pages/              # Un dossier par vue (JSX + CSS)
│   │   ├── Dashboard/      # Statistiques et graphiques
│   │   ├── Login/          # Page de connexion
│   │   ├── Register/       # Inscription
│   │   ├── Journalisation/ # Logs d'accès Technique
│   │   ├── Utilisateurs/   # Gestion des comptes (Admin)
│   │   └── Profil/         # Paramètres utilisateur
│   ├── services/           # Logique d'appel API par module
│   │   └── dashboardService.js # Fonctions pour récupérer les stats
│   ├── App.jsx             # Routeur principal (Propre et lisible)
│   ├── index.css           # Styles globaux et variables de couleurs
│   └── main.tsx            # Point d'entrée React
├── vite.config.ts          # Configuration Vite
└── package.json            # Dépendances du projet
```

---

## 💡 Notes sur les changements majeurs

1.  **Indépendance des Emails** : Pour modifier le design d'un mail (ex: ajouter une phrase), vous n'avez qu'un seul fichier à ouvrir : `backend/services/emailService.js`.
2.  **Sécurité** : Le token d'authentification est automatiquement ajouté à toutes vos requêtes API grâce à l'intercepteur dans `api/axios.js`.
3.  **Propreté de la Racine** : Tous les scripts qui "encombraient" votre dossier principal sont maintenant rangés dans `scripts/` (Backend) ou `services/` (Frontend).

> [!TIP]
> **Rappel de commande :**
> - Lancer le backend : `node server.js`
> - Lancer le frontend : `npm run dev`
