-- ============================================
-- OOREDOO PORTAL - SCHÉMA BASE DE DONNÉES
-- ============================================

CREATE DATABASE IF NOT EXISTS ooredoo_portal;
USE ooredoo_portal;

-- TABLE UTILISATEURS
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,       -- haché avec bcrypt
  role ENUM('admin','zone_manager','manager') NOT NULL,
  zone VARCHAR(100),                         -- ex: Tunis Nord, Sfax...
  statut ENUM('en_attente','approuve','refuse') DEFAULT 'en_attente',
  otp_code VARCHAR(6),                       -- code OTP temporaire
  otp_expire DATETIME,                       -- expiration OTP
  cree_le DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABLE PRINCIPALE : TICKETS (activation + plainte + résiliation)
-- Les 3 types sont fusionnés dans UNE seule table
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- TYPE DE TICKET
  type_ticket ENUM('activation','plainte','resiliation') NOT NULL,

  -- INFOS CLIENT
  client_nom VARCHAR(150),
  client_tel VARCHAR(20),
  client_zone VARCHAR(100),

  -- PRODUIT FIX JDID OOREDOO
  produit ENUM('outdoor','indoor','pro') NOT NULL,
  debit VARCHAR(50),           -- ex: 10Mbps, 20Mbps, 50Mbps, 100Mbps...

  -- SLA (délais en heures)
  sla_cible INT,               -- délai cible selon contrat (ex: 48h)
  sla_reel INT,                -- délai réel de résolution

  -- STATUT
  statut ENUM('ouvert','en_cours','resolu','ferme') DEFAULT 'ouvert',

  -- DATES
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_resolution DATETIME,

  -- RESPONSABLES
  zone VARCHAR(100),
  cree_par INT,
  FOREIGN KEY (cree_par) REFERENCES users(id)
);

-- INDEX pour performances des requêtes dashboard
CREATE INDEX idx_type ON tickets(type_ticket);
CREATE INDEX idx_zone ON tickets(zone);
CREATE INDEX idx_produit ON tickets(produit);
CREATE INDEX idx_statut ON tickets(statut);
CREATE INDEX idx_date ON tickets(date_creation);

-- ============================================
-- DONNÉES DE TEST
-- ============================================

-- Admin par défaut (mot de passe: Admin123!)
INSERT INTO users (nom, prenom, email, mot_de_passe, role, statut)
VALUES ('Admin', 'Ooredoo', 'yessingsm4@gmail.com',
  '$2a$10$n4/69G7w8U1il2oVUdEm..Z1r00HZUU9dHEH3.ek3fhsgt3xwTzQS',
  'admin', 'approuve');

-- Tickets de test variés
INSERT INTO tickets (type_ticket, client_nom, client_tel, client_zone, produit, debit, sla_cible, sla_reel, statut, zone, date_creation, date_resolution) VALUES
('activation','Ben Ali Mohamed','22334455','Tunis','outdoor','20Mbps',48,36,'resolu','Tunis Nord','2025-01-05','2025-01-07'),
('activation','Trabelsi Sami','55443322','Sfax','indoor','50Mbps',48,72,'resolu','Sfax','2025-01-08','2025-01-11'),
('plainte','Chaabane Rim','66778899','Sousse','pro','100Mbps',24,20,'resolu','Sousse','2025-01-10','2025-01-11'),
('plainte','Mzoughi Karim','77889900','Tunis','outdoor','10Mbps',24,30,'resolu','Tunis Sud','2025-01-12','2025-01-13'),
('resiliation','Gharbi Nour','88990011','Bizerte','indoor','20Mbps',72,48,'resolu','Bizerte','2025-01-15','2025-01-18'),
('activation','Jlassi Ahmed','99001122','Nabeul','pro','200Mbps',48,44,'resolu','Nabeul','2025-01-20','2025-01-22'),
('plainte','Boughanmi Ines','11223344','Tunis','outdoor','50Mbps',24,18,'resolu','Tunis Nord','2025-02-01','2025-02-02'),
('resiliation','Hamdi Youssef','22334456','Sfax','pro','100Mbps',72,96,'resolu','Sfax','2025-02-05','2025-02-09'),
('activation','Riahi Salma','33445567','Sousse','indoor','20Mbps',48,52,'en_cours','Sousse','2025-02-10',NULL),
('plainte','Khelil Omar','44556678','Tunis','outdoor','10Mbps',24,22,'resolu','Tunis Sud','2025-02-14','2025-02-15'),
('activation','Tlili Mariem','55667789','Gafsa','pro','50Mbps',48,40,'resolu','Gafsa','2025-03-01','2025-03-03'),
('plainte','Dridi Zied','66778890','Tunis','indoor','100Mbps',24,26,'ouvert','Tunis Nord','2025-03-05',NULL),
('resiliation','Ferchichi Leila','77889901','Monastir','outdoor','20Mbps',72,65,'resolu','Monastir','2025-03-08','2025-03-11'),
('activation','Ayadi Tarek','88990012','Tunis','pro','200Mbps',48,48,'resolu','Tunis Sud','2025-03-12','2025-03-14'),
('plainte','Belhaj Sara','99001123','Sfax','outdoor','10Mbps',24,15,'resolu','Sfax','2025-03-18','2025-03-19');