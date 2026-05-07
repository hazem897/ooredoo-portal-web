# Rapport de Conformité Sécurité NIST - Portail Ooredoo

Ce document récapitule les mesures de sécurité mises en œuvre pour protéger le portail de gestion Ooredoo, conformément aux domaines de contrôle du framework NIST SP 800-171.

---

## 🛡️ Mesures de Sécurité Implémentées (Version NIST)

### 1. Access Control (AC)
- **Authentification JWT** : Toutes les routes sensibles (`/api/users`, `/api/dashboard`, `/api/tickets`, etc.) sont protégées par un middleware `verifierToken`.
- **Contrôle par Rôle (RBAC)** : Les actions critiques (import de tickets, approbation d'utilisateurs, accès aux logs) sont restreintes au rôle `admin` via `verifierRole('admin')`.
- **Prévention IDOR** : Les routes de profil utilisateur vérifient que l'utilisateur connecté ne peut modifier ou voir que son propre profil (`req.user.id === req.params.id`).
- **Validation manuelle** : Les nouveaux comptes sont créés avec un statut "en attente" et nécessitent une approbation administrative avant tout accès.

### 2. Identification and Authentication (IA)
- **Double Authentification (2FA)** : Système de code OTP envoyé par email à chaque tentative de connexion.
- **Gestion des sessions** : Utilisation de tokens JWT avec expiration courte pour limiter la durée de validité des sessions.
- **Hachage sécurisé** : Utilisation de `bcrypt` avec un sel de 10 rounds pour le stockage des mots de passe.

### 3. System Integrity (SI)
- **Prévention des Injections SQL** : Utilisation systématique de requêtes préparées avec des "placeholders" via la bibliothèque `mysql2`.
- **Validation des entrées** : Filtrage et validation des données reçues du client avant tout traitement en base de données.
- **Protection XSS** : Nettoyage des données affichées dans l'interface React pour prévenir l'exécution de scripts malveillants.

### 4. Audit and Accountability (AU)
- **Journalisation en temps réel** : Chaque action (Connexion, Déconnexion, Modification de compte, Suppression) est enregistrée dans une table `logs`.
- **Traçabilité complète** : Les logs incluent l'ID de l'utilisateur, l'action effectuée, l'adresse IP et l'horodatage précis.
- **Interface de supervision** : Une page "Journalisation" permet aux administrateurs de surveiller l'activité du système.

### 5. Configuration Management (CM)
- **En-têtes Helmet** : Utilisation du middleware `helmet` pour sécuriser les en-têtes HTTP (XSS Protection, Content Security Policy, etc.).
- **Variables d'environnement** : Isolation des secrets (clés JWT, accès DB) dans un fichier `.env` non accessible publiquement.

### 6. System and Communications Protection (SC)
- **Chiffrement TLS** : Les communications sont sécurisées via le protocole HTTPS/TLS.
- **Masquage d'erreurs** : Les erreurs serveur ne renvoient jamais de "stack trace" ou d'informations techniques sensibles au client.

---

## 🔍 Justifications Visuelles (Captures d'écran)

#### Preuve NIST IA (Authentification)
![Badge NIST IA sur le site](file:///C:/Users/hp/.gemini/antigravity/brain/b7a2f699-7331-49b1-8069-3239eb1786cc/nist_badge_login_1778150081655.png)

#### Preuve NIST AU (Audit & Logs)
Le système de journalisation enregistre chaque événement critique pour garantir la redevabilité.
![Détails NIST IA Modal](file:///C:/Users/hp/.gemini/antigravity/brain/b7a2f699-7331-49b1-8069-3239eb1786cc/nist_modal_login_1778150149251.png)

---
*Mesures de sécurité inspirées du framework NIST.*

