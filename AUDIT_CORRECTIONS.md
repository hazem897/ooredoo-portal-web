/**
 * AUDIT ET RAPPORT DE CORRECTION - PORTAIL OOREDOO
 * Date: May 18, 2026
 * Statut: En cours de correction
 */

/*
═══════════════════════════════════════════════════════════════
ERREURS TROUVÉES ET CORRECTIONS À APPLIQUER
═══════════════════════════════════════════════════════════════
*/

/*
1. ❌ BACKEND/SERVER.JS (Ligne 83)
   PROBLÈME: db.query().catch() - mais query retourne Promise uniquement sans callback
   CORRECTION: Utiliser callback au lieu de Promise
   
2. ❌ BACKEND/ROUTES/USERS.JS (Ligne 51-53)
   PROBLÈME: router.put('/reset-password') AVANT router.put('/:id/...') crée conflit avec la route :id
   CORRECTION: Placer les routes spécifiques AVANT les génériques
   
3. ❌ BACKEND/CONTROLLERS/AUTHCONTROLLER.JS
   PROBLÈME: Pas de gestion d'erreur pour les callbacks
   CORRECTION: Ajouter des vérifications de null/undefined
   
4. ❌ FRONTEND/UTILS/API.JSX
   PROBLÈME: baseURL = '/api' mais les appels font /api/auth/login = double /api
   CORRECTION: Vérifier que les appels API n'ajoutent pas /api
   
5. ❌ FRONTEND/CONTEXT/AUTHCONTEXT.JSX
   PROBLÈME: fetch() hardcoded au lieu d'utiliser axios api instance
   CORRECTION: Utiliser api.post() pour cohérence
   
6. ❌ FRONTEND/PAGES/LOGIN/LOGIN.JSX
   PROBLÈME: Pas de gestion du timeLeft state dans le cleanup useEffect
   CORRECTION: Clarifier la logique du compteur OTP
*/

module.exports = {
  corrections: [
    {
      file: 'backend/server.js',
      line: 83,
      issue: 'db.query() avec .catch() sur une Promise non retournée',
      fix: 'Modifier pour utiliser async/await ou callback'
    },
    {
      file: 'backend/routes/users.js',
      line: 51,
      issue: 'Ordre des routes: route générique avant routes spécifiques',
      fix: 'Placer les routes spécifiques en premier'
    },
    {
      file: 'backend/controllers/authController.js',
      line: 'multiple',
      issue: 'Callbacks sans null check sur rows',
      fix: 'Vérifier rows !== null && rows.length > 0'
    },
    {
      file: 'frontend/src/utils/api.jsx',
      line: 5,
      issue: 'baseURL "/api" combiné avec appels "/auth/login"',
      fix: 'Vérifier que les appels sont cohérents'
    },
    {
      file: 'frontend/src/context/AuthContext.jsx',
      line: 'multiple',
      issue: 'fetch() hardcoded au lieu d\'axios',
      fix: 'Utiliser api.post() pour cohérence'
    }
  ]
};
