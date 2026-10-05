-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: halo_smakmal
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendances`
--

DROP TABLE IF EXISTS `attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendances` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `company_id` bigint unsigned NOT NULL,
  `date` date NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `check_in_lat` decimal(10,8) DEFAULT NULL,
  `check_in_long` decimal(11,8) DEFAULT NULL,
  `check_out_lat` decimal(10,8) DEFAULT NULL,
  `check_out_long` decimal(11,8) DEFAULT NULL,
  `selfie_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('hadir','terlambat','izin','sakit','alpa') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hadir',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attendances_user_id_foreign` (`user_id`),
  KEY `attendances_company_id_foreign` (`company_id`),
  CONSTRAINT `attendances_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendances_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendances`
--

LOCK TABLES `attendances` WRITE;
/*!40000 ALTER TABLE `attendances` DISABLE KEYS */;
INSERT INTO `attendances` VALUES (1,5,2,'2026-10-03','07:45:00','16:35:00',-6.59714500,106.80603500,-6.59714500,106.80603500,'attendances/sample_selfie_1.jpg','hadir','2026-10-05 04:27:50','2026-10-05 04:27:50'),(2,5,2,'2026-10-04','07:45:00','16:35:00',-6.59714500,106.80603500,-6.59714500,106.80603500,'attendances/sample_selfie_1.jpg','hadir','2026-10-05 04:27:50','2026-10-05 04:27:50'),(3,5,2,'2026-10-05','07:45:00','16:35:00',-6.59714500,106.80603500,-6.59714500,106.80603500,'attendances/sample_selfie_1.jpg','hadir','2026-10-05 04:27:50','2026-10-05 04:27:50'),(4,6,2,'2026-10-03','07:50:00','16:40:00',-6.59714500,106.80603500,-6.59714500,106.80603500,'attendances/sample_selfie_2.jpg','hadir','2026-10-05 04:27:50','2026-10-05 04:27:50'),(5,6,2,'2026-10-04','07:50:00','16:40:00',-6.59714500,106.80603500,-6.59714500,106.80603500,'attendances/sample_selfie_2.jpg','hadir','2026-10-05 04:27:50','2026-10-05 04:27:50'),(6,6,2,'2026-10-05','07:50:00','16:40:00',-6.59714500,106.80603500,-6.59714500,106.80603500,'attendances/sample_selfie_2.jpg','hadir','2026-10-05 04:27:50','2026-10-05 04:27:50');
/*!40000 ALTER TABLE `attendances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `radius_meters` int NOT NULL DEFAULT '100',
  `check_in_start` time NOT NULL,
  `check_in_end` time NOT NULL,
  `check_out_start` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'PT Amaliah Digital Media','Jl. Tol Ciawi No. 1, Bogor, Jawa Barat',-6.65432100,106.87654321,100,'07:00:00','08:00:00','16:00:00','2026-10-05 04:27:49','2026-10-05 04:27:49'),(2,'PT Telekomunikasi Seluler (Telkomsel) Bogor','Jl. Pajajaran No. 37, Babakan, Bogor Tengah, Kota Bogor, Jawa Barat',-6.59714700,106.80603900,100,'07:00:00','08:30:00','16:30:00','2026-10-05 04:27:50','2026-10-05 04:27:50'),(3,'PT Amaliah Digital Inovasi','Jl. Raya Tol Ciawi No. 1, Ciawi, Bogor, Jawa Barat',-6.65432100,106.87654321,120,'07:30:00','08:30:00','17:00:00','2026-10-05 04:27:50','2026-10-05 04:27:50');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_journals`
--

DROP TABLE IF EXISTS `daily_journals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_journals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `attendance_id` bigint unsigned NOT NULL,
  `date` date NOT NULL,
  `work_summary` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `obstacles` text COLLATE utf8mb4_unicode_ci,
  `work_photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','revision') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `mentor_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `daily_journals_attendance_id_unique` (`attendance_id`),
  KEY `daily_journals_user_id_foreign` (`user_id`),
  CONSTRAINT `daily_journals_attendance_id_foreign` FOREIGN KEY (`attendance_id`) REFERENCES `attendances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `daily_journals_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_journals`
--

LOCK TABLES `daily_journals` WRITE;
/*!40000 ALTER TABLE `daily_journals` DISABLE KEYS */;
INSERT INTO `daily_journals` VALUES (1,5,1,'2026-10-03','Hari ke-1: Melakukan instalasi kabel jaringan LAN dan konfigurasi IP address router gateway kantor.','Beberapa konektor RJ45 rusak dan perlu diganti.',NULL,'approved','Pekerjaan rapi dan sesuai SOP.','2026-10-05 04:27:50','2026-10-05 04:27:50'),(2,5,2,'2026-10-04','Hari ke-2: Melakukan instalasi kabel jaringan LAN dan konfigurasi IP address router gateway kantor.','Beberapa konektor RJ45 rusak dan perlu diganti.',NULL,'approved','Pekerjaan rapi dan sesuai SOP.','2026-10-05 04:27:50','2026-10-05 04:27:50'),(3,5,3,'2026-10-05','Hari ke-3: Melakukan instalasi kabel jaringan LAN dan konfigurasi IP address router gateway kantor.','Beberapa konektor RJ45 rusak dan perlu diganti.',NULL,'pending',NULL,'2026-10-05 04:27:50','2026-10-05 04:27:50'),(4,6,4,'2026-10-03','Hari ke-1: Membantu tim administrasi merekap data laporan inventaris server dan perangkat IT.','Tidak ada kendala',NULL,'approved','Laporan sangat detail dan terstruktur.','2026-10-05 04:27:50','2026-10-05 04:27:50'),(5,6,5,'2026-10-04','Hari ke-2: Membantu tim administrasi merekap data laporan inventaris server dan perangkat IT.','Tidak ada kendala',NULL,'approved','Laporan sangat detail dan terstruktur.','2026-10-05 04:27:50','2026-10-05 04:27:50'),(6,6,6,'2026-10-05','Hari ke-3: Membantu tim administrasi merekap data laporan inventaris server dan perangkat IT.','Tidak ada kendala',NULL,'approved','Laporan sangat detail dan terstruktur.','2026-10-05 04:27:50','2026-10-05 04:27:50');
/*!40000 ALTER TABLE `daily_journals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_00_000000_create_companies_table',1),(2,'0001_01_01_000000_create_users_table',1),(3,'0001_01_01_000001_create_cache_table',1),(4,'0001_01_01_000002_create_jobs_table',1),(5,'2024_01_01_000000_create_passkeys_table',1),(6,'2025_08_14_170933_add_two_factor_columns_to_users_table',1),(7,'2026_01_01_000001_create_attendances_table',1),(8,'2026_01_01_000002_create_daily_journals_table',1),(9,'2026_01_01_000003_create_prayer_logs_table',1),(10,'2026_10_05_105822_create_personal_access_tokens_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passkeys`
--

DROP TABLE IF EXISTS `passkeys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passkeys` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `credential_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `credential` json NOT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `passkeys_credential_id_unique` (`credential_id`),
  KEY `passkeys_user_id_index` (`user_id`),
  CONSTRAINT `passkeys_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passkeys`
--

LOCK TABLES `passkeys` WRITE;
/*!40000 ALTER TABLE `passkeys` DISABLE KEYS */;
/*!40000 ALTER TABLE `passkeys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prayer_logs`
--

DROP TABLE IF EXISTS `prayer_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prayer_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `daily_journal_id` bigint unsigned NOT NULL,
  `prayer_type` enum('dzuhur','ashar') COLLATE utf8mb4_unicode_ci NOT NULL,
  `prayer_time` time DEFAULT NULL,
  `location_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('berjamaah','munfarid','udzur') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prayer_logs_daily_journal_id_foreign` (`daily_journal_id`),
  CONSTRAINT `prayer_logs_daily_journal_id_foreign` FOREIGN KEY (`daily_journal_id`) REFERENCES `daily_journals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prayer_logs`
--

LOCK TABLES `prayer_logs` WRITE;
/*!40000 ALTER TABLE `prayer_logs` DISABLE KEYS */;
INSERT INTO `prayer_logs` VALUES (1,1,'dzuhur','12:15:00','Masjid Raya Bogor','berjamaah','2026-10-05 04:27:50','2026-10-05 04:27:50'),(2,1,'ashar','15:30:00','Musala Telkomsel','munfarid','2026-10-05 04:27:50','2026-10-05 04:27:50'),(3,2,'dzuhur','12:15:00','Masjid Raya Bogor','berjamaah','2026-10-05 04:27:50','2026-10-05 04:27:50'),(4,2,'ashar','15:30:00','Musala Telkomsel','munfarid','2026-10-05 04:27:50','2026-10-05 04:27:50'),(5,3,'dzuhur','12:15:00','Masjid Raya Bogor','berjamaah','2026-10-05 04:27:50','2026-10-05 04:27:50'),(6,3,'ashar','15:30:00','Musala Telkomsel','munfarid','2026-10-05 04:27:50','2026-10-05 04:27:50'),(7,4,'dzuhur',NULL,NULL,'udzur','2026-10-05 04:27:50','2026-10-05 04:27:50'),(8,4,'ashar',NULL,NULL,'udzur','2026-10-05 04:27:50','2026-10-05 04:27:50'),(9,5,'dzuhur',NULL,NULL,'udzur','2026-10-05 04:27:50','2026-10-05 04:27:50'),(10,5,'ashar',NULL,NULL,'udzur','2026-10-05 04:27:50','2026-10-05 04:27:50'),(11,6,'dzuhur',NULL,NULL,'udzur','2026-10-05 04:27:50','2026-10-05 04:27:50'),(12,6,'ashar',NULL,NULL,'udzur','2026-10-05 04:27:50','2026-10-05 04:27:50');
/*!40000 ALTER TABLE `prayer_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `two_factor_secret` text COLLATE utf8mb4_unicode_ci,
  `two_factor_recovery_codes` text COLLATE utf8mb4_unicode_ci,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `role` enum('admin','guru_pembimbing','pembimbing_dudi','siswa') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'siswa',
  `nis_nip` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_id` bigint unsigned DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_company_id_foreign` (`company_id`),
  CONSTRAINT `users_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Administrator Sekolah','admin@smkamaliah.sch.id','2026-10-05 04:27:49','$2y$12$FSxIRERUHXu/obvAvf6ZFOMGhi1Zn0R8GpofRfJ9EQFHFAJr27/k2',NULL,NULL,NULL,'admin','198501012010011001',NULL,'081211112222',NULL,NULL,'2026-10-05 04:27:49','2026-10-05 04:27:49'),(2,'Bpk. Guru Pembimbing','guru@smkamaliah.sch.id','2026-10-05 04:27:49','$2y$12$FSxIRERUHXu/obvAvf6ZFOMGhi1Zn0R8GpofRfJ9EQFHFAJr27/k2',NULL,NULL,NULL,'guru_pembimbing','198703152015021002',NULL,'081233334444',NULL,NULL,'2026-10-05 04:27:49','2026-10-05 04:27:49'),(3,'Pembimbing DUDI','dudi@company.com','2026-10-05 04:27:49','$2y$12$FSxIRERUHXu/obvAvf6ZFOMGhi1Zn0R8GpofRfJ9EQFHFAJr27/k2',NULL,NULL,NULL,'pembimbing_dudi',NULL,2,'081255556666',NULL,NULL,'2026-10-05 04:27:49','2026-10-05 04:27:50'),(4,'Siswa Magang Amaliah','siswa@smkamaliah.sch.id','2026-10-05 04:27:49','$2y$12$FSxIRERUHXu/obvAvf6ZFOMGhi1Zn0R8GpofRfJ9EQFHFAJr27/k2',NULL,NULL,NULL,'siswa','12345678',1,'081277778888',NULL,NULL,'2026-10-05 04:27:49','2026-10-05 04:27:49'),(5,'Budi Santoso','siswa1@smkamaliah.sch.id','2026-10-05 04:27:50','$2y$12$y.NDNzzPaDGmA7l5bkzTmOBWQBZ7XieDfKo2IDnN4f7s8fYwNhGXC',NULL,NULL,NULL,'siswa','2122001',2,'081290000001',NULL,NULL,'2026-10-05 04:27:50','2026-10-05 04:27:50'),(6,'Siti Nurhaliza','siswa2@smkamaliah.sch.id','2026-10-05 04:27:50','$2y$12$y.NDNzzPaDGmA7l5bkzTmOBWQBZ7XieDfKo2IDnN4f7s8fYwNhGXC',NULL,NULL,NULL,'siswa','2122002',2,'081290000002',NULL,NULL,'2026-10-05 04:27:50','2026-10-05 04:27:50'),(7,'Rizky Ramadhan','siswa3@smkamaliah.sch.id','2026-10-05 04:27:50','$2y$12$y.NDNzzPaDGmA7l5bkzTmOBWQBZ7XieDfKo2IDnN4f7s8fYwNhGXC',NULL,NULL,NULL,'siswa','2122003',3,'081290000003',NULL,NULL,'2026-10-05 04:27:50','2026-10-05 04:27:50'),(8,'Dewi Sartika','siswa4@smkamaliah.sch.id','2026-10-05 04:27:50','$2y$12$y.NDNzzPaDGmA7l5bkzTmOBWQBZ7XieDfKo2IDnN4f7s8fYwNhGXC',NULL,NULL,NULL,'siswa','2122004',NULL,'081290000004',NULL,NULL,'2026-10-05 04:27:50','2026-10-05 04:27:50');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-05 18:27:50
