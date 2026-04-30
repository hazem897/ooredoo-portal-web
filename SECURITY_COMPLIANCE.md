# OWASP Top 10 Security Compliance Report - Ooredoo Portal

Ce document récapitule les mesures de sécurité mises en œuvre pour protéger le portail de gestion Ooredoo contre les vulnérabilités courantes.

## 🛡️ Mesures de Sécurité Implémentées

### A01:2021 - Contrôle d'Accès Défaillant (Broken Access Control)
- **Authentification JWT** : Toutes les routes sensibles (`/api/users`, `/api/dashboard`, `/api/tickets`, etc.) sont protégées par un middleware `verifierToken`.
- **Contrôle par Rôle (RBAC)** : Les actions critiques (import de tickets, approbation d'utilisateurs, accès aux logs) sont restreintes au rôle `admin` via `verifierRole('admin')`.
- **Prévention IDOR** : Les routes de profil utilisateur vérifient que l'utilisateur connecté ne peut modifier ou voir que son propre profil (`req.user.id === req.params.id`).
- **Logout Sécurisé** : Le log de déconnexion utilise l'ID utilisateur extrait du token sécurisé plutôt que des données fournies par le client.

### A03:2021 - Injections
- **Requêtes Paramétrées** : Utilisation systématique de `mysql2` avec des placeholders (`?`) pour toutes les requêtes SQL, empêchant les injections SQL.
- **Validation des Entrées** : Les paramètres d'URL (`:id`, `:type`) et les corps de requêtes sont filtrés et validés avant traitement.

### A05:2021 - Configuration de Sécurité Défaillante
- **Helmet.js** : Protection des en-têtes HTTP (XSS Protection, HSTS, Clickjacking protection).
- **CSP (Content Security Policy)** : Mise en place d'une politique stricte restreignant l'exécution de scripts et le chargement de ressources externes non autorisées.
- **Masquage d'Erreurs** : Les erreurs serveur sont capturées globalement pour éviter d'exposer des stack traces ou des informations sensibles sur l'infrastructure.

### A07:2021 - Échecs d'Identification et d'Authentification
- **MFA (Multi-Factor Authentication)** : Authentification à deux facteurs via code OTP envoyé par email pour chaque connexion.
- **Politique de Mot de Passe Forte** : Validation par Regex à l'inscription et à la réinitialisation (min 8 car, Maj, Min, Chiffre, Caractère spécial).
- **Rate Limiting** : Limitation du nombre de tentatives de connexion (`express-rate-limit`) pour contrer les attaques par force brute.
- **Email Enumeration Prevention** : Les messages d'erreur lors de la récupération de mot de passe sont génériques pour ne pas révéler l'existence d'un compte.

### A08:2021 - Échecs d'Intégrité des Logiciels et des Données
- **Validation des Uploads** : Filtrage strict par extension (`.xlsx`, `.xls`, `.csv`) et par type MIME pour les imports de fichiers.
- **Limites de Taille** : Restriction de la taille des fichiers téléchargés pour prévenir les attaques par déni de service (DoS).

### A09:2021 - Manque de Journalisation et de Surveillance
- **Logger d'Activités Avancé** : Chaque action de modification (POST, PUT, DELETE) est enregistrée avec l'ID utilisateur, l'action effectuée, l'URL et l'adresse IP de l'utilisateur.
- **Logs de Connexion/Déconnexion** : Suivi précis des sessions utilisateurs.

---
*Dernière mise à jour : 27 Avril 2026*
