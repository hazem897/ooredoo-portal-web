-- ============================================================
-- MIGRATION: Alertes - Compatible MySQL 5.x / MariaDB / XAMPP
-- IMPORTANT: Sélectionnez d'abord "ooredoo_portal" dans
-- la liste à gauche de phpMyAdmin, puis exécutez ce script.
-- ============================================================

ALTER TABLE tickets ADD COLUMN date_prise_rdv DATETIME DEFAULT NULL;
ALTER TABLE tickets ADD COLUMN crm_case VARCHAR(100) DEFAULT NULL;
ALTER TABLE tickets ADD COLUMN statut_gel ENUM('non','oui') DEFAULT 'non';
ALTER TABLE tickets ADD COLUMN derniere_relance DATETIME DEFAULT NULL;
ALTER TABLE tickets ADD COLUMN nb_relances INT DEFAULT 0;
