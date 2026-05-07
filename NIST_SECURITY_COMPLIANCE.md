# Rapport de Conformité Sécurité NIST - Portail Ooredoo

Ce document détaille l'application des contrôles de sécurité basés sur le framework NIST pour le projet **Portail Web Intelligent Sécurisé**. Chaque domaine est associé aux mécanismes techniques implémentés dans le code.

---

## 🛡️ Tableau de Correspondance NIST

| Domaine NIST | Risque Traité | Mécanismes Implémentés | Localisation dans le Code |
| :--- | :--- | :--- | :--- |
| **1. Access Control (AC)** | Accès non autorisés | RBAC (Role-Based Access Control), Gardiens de routes React, Middleware d'autorisation. | `backend/middleware/authMiddleware.js`, `frontend/src/components/RouteAdmin.jsx` |
| **2. Configuration Management (CM)** | Mauvaise configuration | En-têtes de sécurité HTTP, Gestion centralisée des variables d'environnement. | `backend/server.js` (Helmet), `backend/.env` |
| **3. Supply Chain (SR)** | Dépendances vulnérables | Audit des packages NPM, Verrouillage des versions. | `package-lock.json`, `package.json` |
| **4. System & Comm. Protection (SC)** | Fuite de données | Hachage `bcrypt` (10 rounds), Tunnel sécurisé TLS via Ngrok. | `backend/controllers/authController.js` |
| **5. System Integrity (SI)** | Injections SQL / XSS | Requêtes préparées SQL, Sanitisation des entrées. | `backend/config/db.js`, `backend/controllers/userController.js` |
| **6. Risk Assessment (RA)** | Architecture vulnérable | Séparation Backend/Frontend, Validation multiniveaux. | Architecture globale du projet |
| **7. Identification & Auth (IA)** | Faiblesse d'authentification | **2FA (OTP via Email)**, Sessions par JSON Web Token (JWT). | `backend/services/emailService.js`, `backend/controllers/authController.js` |
| **8. Software & Data Integrity (SI)**| Altération du code | Validation des schémas de données, Contrôle d'intégrité avant écriture. | `backend/controllers/ticketController.js` |
| **9. Audit & Accountability (AU)** | Absence de logs | **Journalisation systématique** (Audit Trail) de toutes les actions critiques. | `frontend/src/pages/Journalisation/`, Table `logs` SQL |
| **10. Incident Response (IR)** | Gestion des erreurs | Gestionnaires d'erreurs globaux, Masquage des traces de pile (Stacktraces). | `backend/server.js`, `frontend/src/main.tsx` |

---

## 🔍 Détails des Implémentations (Démonstration Pratique)

### 1. Identification & Authentification (IA) - OTP 2FA
**Vulnérabilité évitée :** Vol de mot de passe simple (Brute force).
**Solution :** Même avec le bon mot de passe, l'attaquant est bloqué par la demande d'un code unique envoyé à l'adresse email professionnelle de l'utilisateur.

### 2. Audit & Accountability (AU) - Journalisation
**Vulnérabilité évitée :** Actions malveillantes non traçables.
**Solution :** Chaque création, modification ou suppression d'utilisateur est enregistrée avec l'ID de l'auteur, l'adresse IP et l'horodatage précis. Consultable via la page `/journalisation`.

### 3. System Integrity (SI) - Protection Injection SQL
**Vulnérabilité évitée :** Extraction de base de données via `' OR 1=1`.
**Solution :** Utilisation systématique de `mysql2` avec des placeholders `?`.
```javascript
// EXEMPLE SÉCURISÉ DANS LE PROJET
db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => { ... });
```

### 4. Access Control (AC) - Système d'Approbation
**Vulnérabilité évitée :** Inscription libre et accès immédiat aux données sensibles.
**Solution :** Un nouvel utilisateur est créé avec le statut `en_attente`. Il ne peut pas se connecter tant qu'un **Administrateur** n'a pas validé son compte manuellement.

### 5. Configuration Management (CM) - En-têtes Helmet
**Vulnérabilité évitée :** Clickjacking, XSS, MIME Sniffing.
**Solution :** Intégration de `helmet()` dans Express pour masquer les technologies utilisées et renforcer la politique de sécurité du navigateur.

---

*Note : Ce document sert de preuve de conformité pour l'audit de sécurité du projet Ooredoo.*
