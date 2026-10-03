-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Oct 03, 2026 at 07:08 AM
-- Server version: 8.0.46
-- PHP Version: 8.3.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `skills_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` bigint UNSIGNED NOT NULL,
  `period_id` bigint UNSIGNED NOT NULL,
  `evaluator_id` bigint UNSIGNED NOT NULL,
  `evaluatee_id` bigint UNSIGNED NOT NULL,
  `evaluator_role` enum('chairman','joint') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'joint' COMMENT 'บทบาทกรรมการ: chairman = ประธาน, joint = กรรมการร่วม',
  `dept_id` int DEFAULT NULL,
  `evaluator_status` enum('pending','evaluating','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'สถานะการประเมินของกรรมการ',
  `evaluator_signature` text COLLATE utf8mb4_unicode_ci COMMENT 'ลายเซ็น Base64 ของกรรมการ',
  `evaluator_signed_at` datetime DEFAULT NULL COMMENT 'เวลาที่กรรมการเซ็น',
  `acknowledge_signature` text COLLATE utf8mb4_unicode_ci COMMENT 'ลายเซ็น Base64 ของผู้รับทราบผล',
  `acknowledge_signed_at` datetime DEFAULT NULL COMMENT 'เวลาที่เซ็นรับทราบผล',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `id` bigint UNSIGNED NOT NULL,
  `period_id` bigint UNSIGNED NOT NULL,
  `evaluatee_id` bigint UNSIGNED NOT NULL,
  `indicator_id` bigint UNSIGNED NOT NULL,
  `evidence_type_id` int NOT NULL,
  `attachment_type` enum('file','link') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'file' COMMENT 'ประเภทหลักฐาน: file หรือ link',
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ชื่อไฟล์ หรือ ชื่อลิงก์',
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mime type ของไฟล์ (เป็น NULL ถ้าเป็นลิงก์)',
  `size_bytes` int UNSIGNED DEFAULT NULL COMMENT 'ขนาดไฟล์ (เป็น NULL ถ้าเป็นลิงก์)',
  `storage_path` varchar(1024) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_th` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int NOT NULL,
  `org_group_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `code`, `name_th`, `category_id`, `org_group_id`) VALUES
(1, 'IT', 'แผนกวิชาเทคโนโลยีสารสนเทศ', 8, 1),
(2, 'ME', 'แผนกวิชาเครื่องกล', 1, 1),
(3, 'EL', 'แผนกวิชาอิเล็กทรอนิกส์', 1, 1),
(4, 'ACC', 'แผนกวิชาการบัญชี', 2, 1),
(5, 'MKT', 'แผนกวิชาการตลาด', 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `dept_fields`
--

CREATE TABLE `dept_fields` (
  `dept_id` int NOT NULL,
  `field_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dept_fields`
--

INSERT INTO `dept_fields` (`dept_id`, `field_code`) VALUES
(2, '20101'),
(3, '20105'),
(4, '20201'),
(5, '20202'),
(1, '21901'),
(1, '21903');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_periods`
--

CREATE TABLE `evaluation_periods` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_th` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buddhist_year` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_periods`
--

INSERT INTO `evaluation_periods` (`id`, `code`, `name_th`, `buddhist_year`, `start_date`, `end_date`, `is_active`, `created_at`) VALUES
(5, 'Y2569', 'การประเมินครูประจำปี 2569', 2569, '2026-09-29', '2027-09-29', 1, '2026-09-29 07:38:35');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_results`
--

CREATE TABLE `evaluation_results` (
  `id` bigint UNSIGNED NOT NULL,
  `period_id` bigint UNSIGNED NOT NULL,
  `evaluatee_id` bigint UNSIGNED NOT NULL,
  `evaluator_id` bigint UNSIGNED NOT NULL,
  `topic_id` bigint UNSIGNED NOT NULL,
  `indicator_id` bigint UNSIGNED NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `value_yes_no` tinyint(1) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','submitted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_topics`
--

CREATE TABLE `evaluation_topics` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_th` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `weight` decimal(5,2) NOT NULL DEFAULT '0.00',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_topics`
--

INSERT INTO `evaluation_topics` (`id`, `code`, `title_th`, `description`, `weight`, `active`, `created_at`) VALUES
(1, 'TOP1', 'การจัดการเรียนการสอน', 'คุณภาพการวางแผนการสอน สื่อการสอน การวัดผล และผลสัมฤทธิ์ของผู้เรียน', 0.30, 1, '2026-05-20 04:02:17'),
(2, 'TOP2', 'การบริหารจัดการชั้นเรียน', 'การจัดบรรยากาศ กฎระเบียบ การดูแล/ให้คำปรึกษา และกิจกรรมส่งเสริม', 0.20, 1, '2026-05-20 04:02:17'),
(3, 'TOP3', 'การพัฒนาตนเองและพัฒนาวิชาชีพ', 'การอบรม/สัมมนา งานวิจัย แผนพัฒนาตนเอง และการประเมินตนเอง', 0.30, 1, '2026-05-20 04:02:17'),
(4, 'TOP4', 'ด้านอื่นๆ (PA/ผลงาน/จรรยาบรรณ)', 'ผลงานตามหน้าที่ จรรยาบรรณ และแบบประเมิน PA', 0.20, 1, '2026-05-20 04:02:17');

-- --------------------------------------------------------

--
-- Table structure for table `evidence_types`
--

CREATE TABLE `evidence_types` (
  `id` int NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_th` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evidence_types`
--

INSERT INTO `evidence_types` (`id`, `code`, `name_th`, `description`) VALUES
(1, 'E-PLAN', 'แผนการจัดการเรียนรู้', 'แผนการสอนตามมาตรฐาน/ตัวชี้วัด'),
(2, 'E-MEDIA', 'สื่อการเรียนรู้', 'ใบงาน/แบบฝึก/มัลติมีเดีย'),
(3, 'E-ASSESS', 'หลักฐานการวัดและประเมินผล', 'ข้อสอบ/รูบริก/บันทึกคะแนน'),
(4, 'E-REFLECT', 'บันทึกหลังการสอน', 'สรุปผล-ข้อเสนอแนะ-ปรับปรุง'),
(5, 'E-STUWORK', 'ผลงานนักเรียน', 'ชิ้นงาน/แฟ้มสะสมผลงาน'),
(6, 'E-CHART', 'แผนภูมิ/กฎ/ตารางเวร', 'เอกสารการจัดชั้นเรียน'),
(7, 'E-HOMEVISIT', 'บันทึกการเยี่ยมบ้าน', 'หลักฐานการเยี่ยมบ้าน/ประสานผู้ปกครอง'),
(8, 'E-COUNSEL', 'บันทึกการให้คำปรึกษา', 'แบบบันทึก/รายงานกรณี'),
(9, 'E-ACT', 'โครงการ/กิจกรรม', 'เอกสาร/ภาพกิจกรรม/รายงานผล'),
(10, 'E-CERT', 'เกียรติบัตร/วุฒิบัตร', 'เอกสารการอบรม/สัมมนา'),
(11, 'E-RESEARCH', 'งานวิจัย/บทความ', 'เอกสารวิชาการ/นำเสนอผลงาน'),
(12, 'E-IDP', 'แผนพัฒนาตนเอง', 'เอกสารเป้าหมาย/แผนพัฒนา'),
(13, 'E-SELFASSESS', 'ผลการประเมินตนเอง', 'แบบฟอร์มประเมินตนเอง'),
(14, 'E-PA', 'แบบประเมิน PA', 'เอกสารข้อตกลงฯ'),
(15, 'E-WORK', 'ผลงานตามหน้าที่', 'หลักฐานผลงาน/รายงาน'),
(16, 'E-ETHICS', 'จรรยาบรรณวิชาชีพ', 'หลักฐานการปฏิบัติตามจรรยาบรรณ');

-- --------------------------------------------------------

--
-- Table structure for table `indicators`
--

CREATE TABLE `indicators` (
  `id` bigint UNSIGNED NOT NULL,
  `topic_id` bigint UNSIGNED NOT NULL,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_th` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('score_1_4','yes_no','file_url') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'score_1_4',
  `weight` decimal(5,2) NOT NULL DEFAULT '1.00',
  `min_score` tinyint NOT NULL DEFAULT '1',
  `max_score` tinyint NOT NULL DEFAULT '4',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `indicators`
--

INSERT INTO `indicators` (`id`, `topic_id`, `code`, `name_th`, `description`, `type`, `weight`, `min_score`, `max_score`, `active`, `created_at`) VALUES
(1, 1, 'T1-PLAN', 'แผนการจัดการเรียนรู้', 'แผนการสอนสอดคล้องมาตรฐานและตัวชี้วัด', 'score_1_4', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(2, 1, 'T1-MEDIA', 'สื่อการเรียนรู้', 'ใบงาน/แบบฝึก/มัลติมีเดียเหมาะสมกับผู้เรียน', 'score_1_4', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(3, 1, 'T1-ASSESS', 'หลักฐานการวัดและประเมินผล', 'ข้อสอบ/รูบริก/ชิ้นงาน/บันทึกคะแนน', 'score_1_4', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(4, 1, 'T1-REFLECT', 'บันทึกหลังการสอน', 'สะท้อนผลและการปรับปรุงแผนการสอน', 'yes_no', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(5, 1, 'T1-STUWORK', 'ผลงานนักเรียน', 'ชิ้นงานแสดงความรู้/ทักษะ/คุณลักษณะ', 'score_1_4', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(6, 2, 'T2-CHART', 'แผนภูมิ/ตาราง', 'แผนผังที่นั่ง กฎห้องเรียน ตารางเวร', 'yes_no', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(7, 2, 'T2-HOMEVISIT', 'บันทึกการเยี่ยมบ้าน', 'ร่วมมือผู้ปกครอง/ประสานเครือข่าย', 'yes_no', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(8, 2, 'T2-COUNSEL', 'บันทึกการให้คำปรึกษา', 'ช่วยเหลือนักเรียนเป็นรายบุคคล/กลุ่ม', 'yes_no', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(9, 2, 'T2-ACT', 'โครงการ/กิจกรรม', 'กิจกรรมส่งเสริมการเรียนรู้และคุณลักษณะ', 'score_1_4', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(10, 3, 'T3-CERT', 'เกียรติบัตร/วุฒิบัตร', 'การอบรม/สัมมนา/ศึกษาดูงาน', 'yes_no', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(11, 3, 'T3-RESEARCH', 'เอกสาร/งานวิจัย', 'วิจัยในชั้นเรียน/ตีพิมพ์/นำเสนอวิชาการ', 'score_1_4', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(12, 3, 'T3-IDP', 'แผนพัฒนาตนเอง', 'เป้าหมาย/แนวทางพัฒนาตามสายงาน', 'yes_no', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(13, 3, 'T3-SELFASSESS', 'ผลการประเมินตนเอง', 'แบบประเมินตนเองตามแบบของสถานศึกษา', 'yes_no', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(14, 3, 'T3-SCHOOLPART', 'มีส่วนร่วมกิจกรรมโรงเรียน', 'เข้าร่วมประชุม/กิจกรรมวันสำคัญ/โครงการ', 'score_1_4', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(15, 4, 'T4-PA', 'แบบประเมิน PA', 'แบบข้อตกลงในการพัฒนางาน (PA)', 'yes_no', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(16, 4, 'T4-WORK', 'ผลงานที่เกิดจากหน้าที่', 'ผลงานตามภาระงานที่ได้รับมอบหมาย', 'score_1_4', 1.00, 1, 4, 1, '2026-05-20 04:02:17'),
(17, 4, 'T4-ETHICS', 'จรรยาบรรณวิชาชีพ', 'หลักฐานการปฏิบัติตามจรรยาบรรณครู', 'yes_no', 1.00, 1, 4, 1, '2026-05-20 04:02:17');

-- --------------------------------------------------------

--
-- Table structure for table `indicator_evidence`
--

CREATE TABLE `indicator_evidence` (
  `indicator_id` bigint UNSIGNED NOT NULL,
  `evidence_type_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `indicator_evidence`
--

INSERT INTO `indicator_evidence` (`indicator_id`, `evidence_type_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(14, 9),
(10, 10),
(11, 11),
(12, 12),
(13, 13),
(15, 14),
(16, 15),
(17, 16);

-- --------------------------------------------------------

--
-- Table structure for table `login_logs`
--

CREATE TABLE `login_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `login_logs`
--

INSERT INTO `login_logs` (`id`, `user_id`, `username`, `role`, `ip_address`, `status`, `created_at`) VALUES
(1, 3, 'กรรมการประเมินไอที', 'evaluator', '::ffff:127.0.0.1', 'success', '2026-07-19 04:44:20'),
(2, NULL, 'teedada', 'evaluatee', '::1', 'success', '2026-07-19 04:50:25'),
(3, 1, 'ผู้ดูแลระบบ', 'admin', '::1', 'success', '2026-08-26 02:46:54'),
(4, 1, 'ผู้ดูแลระบบ', 'admin', '::1', 'success', '2026-08-26 07:04:51'),
(5, 3, 'กรรมการประเมินไอที', 'evaluator', '::ffff:127.0.0.1', 'success', '2026-08-26 07:06:07'),
(6, NULL, 'ครูธารา', 'evaluatee', '::1', 'success', '2026-08-26 07:07:13'),
(7, 1, 'ผู้ดูแลระบบ', 'admin', '::1', 'success', '2026-08-26 07:11:35'),
(8, 1, 'ผู้ดูแลระบบ', 'admin', '::1', 'success', '2026-08-26 07:20:48'),
(9, 1, 'ผู้ดูแลระบบ', 'admin', '::1', 'success', '2026-09-16 12:35:17'),
(10, 6, 'ครูบัญชี 01', 'evaluatee', '::1', 'success', '2026-09-29 07:21:20'),
(11, 1, 'ผู้ดูแลระบบ', 'admin', '::1', 'success', '2026-09-29 07:34:17'),
(12, NULL, 'ครูธารา', 'evaluatee', '::1', 'success', '2026-09-29 07:34:59'),
(13, 1, 'ผู้ดูแลระบบ', 'admin', '::1', 'success', '2026-09-29 07:36:53'),
(14, NULL, 'ครูธารา', 'evaluatee', '::ffff:127.0.0.1', 'success', '2026-09-29 07:39:33'),
(15, 4, 'ครูไอที 01', 'evaluatee', '::ffff:127.0.0.1', 'success', '2026-09-29 08:11:09');

-- --------------------------------------------------------

--
-- Table structure for table `org_groups`
--

CREATE TABLE `org_groups` (
  `id` int NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_th` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `org_groups`
--

INSERT INTO `org_groups` (`id`, `code`, `name_th`) VALUES
(1, 'ACD', 'ฝ่ายวิชาการ'),
(2, 'STD', 'ฝ่ายพัฒนากิจการนักเรียนนักศึกษา'),
(3, 'FIN', 'ฝ่ายบริหารทรัพยากร'),
(4, 'PLA', 'ฝ่ายแผนงานและความร่วมมือ');

-- --------------------------------------------------------

--
-- Table structure for table `self_evaluation_results`
--

CREATE TABLE `self_evaluation_results` (
  `id` bigint UNSIGNED NOT NULL,
  `period_id` bigint UNSIGNED NOT NULL,
  `evaluatee_id` bigint UNSIGNED NOT NULL,
  `topic_id` bigint UNSIGNED NOT NULL,
  `indicator_id` bigint UNSIGNED NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `value_yes_no` tinyint(1) DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','submitted') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `self_eval_submissions`
--

CREATE TABLE `self_eval_submissions` (
  `id` bigint UNSIGNED NOT NULL,
  `period_id` bigint UNSIGNED NOT NULL COMMENT 'รอบการประเมิน',
  `evaluatee_id` bigint UNSIGNED NOT NULL COMMENT 'ครูผู้ถูกประเมิน (ผู้ประเมินตนเอง)',
  `status` enum('pending','draft','submitted') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'สถานะภาพรวมการประเมินตนเอง',
  `signature` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'ลายเซ็น Base64 ของครูผู้ส่ง',
  `signed_at` datetime DEFAULT NULL COMMENT 'เวลาที่เซ็นส่งประเมินตนเอง',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_th` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','evaluator','evaluatee') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','disabled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `department_id` int DEFAULT NULL,
  `position` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_active_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `name_th`, `role`, `status`, `department_id`, `position`, `avatar`, `created_at`, `updated_at`, `last_active_at`) VALUES
(1, 'admin@ccollege.ac.th', '$2b$10$f6g9QMzpdIjzUyckEbFLIeuSRKEGJdNSu.TZ3tmegQ5ioSop02og6', 'ผู้ดูแลระบบ', 'admin', 'active', 1, NULL, 'avatar-1-1782361838697.png', '2026-05-20 04:02:17', '2026-09-29 09:00:10', '2026-09-29 09:00:10'),
(2, 'eva.me@ccollege.ac.th', '$2b$10$ycxCewoT/qjuiZiDb7hfP.aGEnWZu8rMF3UzRO6QgxgIO7lKLsRSm', 'กรรมการประเมินเครื่องกล', 'evaluator', 'active', 2, NULL, 'avatar-2-1782725479425.jpg', '2026-05-20 04:02:17', '2026-06-29 09:31:19', NULL),
(3, 'eva.it@ccollege.ac.th', '$2b$10$rCg8BVUQSVs51Hb/fwctneQcBfIE0RL5dVRm1bcX5CPyGKyRAxFoe', 'กรรมการประเมินไอที', 'evaluator', 'active', 1, NULL, NULL, '2026-05-20 04:02:17', '2026-08-26 09:05:42', '2026-08-26 09:05:42'),
(4, 't.it01@ccollege.ac.th', '$2b$10$V0GTPQ/2Ap5r0nzE49FjfOW7xmXuSPQ8m7P81jwKrFFltwCvBXTsy', 'ครูไอที 01', 'evaluatee', 'active', 1, NULL, NULL, '2026-05-20 04:02:17', '2026-09-29 09:10:22', '2026-09-29 09:10:22'),
(5, 't.me01@ccollege.ac.th', '$2b$10$gkmAZQmS5GjA3cgHAzZgN.HZzaH4gKeuTkeJnNoAEFT2OyczRibuC', 'ครูเครื่องกล 01', 'evaluatee', 'active', 2, NULL, NULL, '2026-05-20 04:02:17', '2026-05-20 04:02:17', NULL),
(6, 't.acc01@ccollege.ac.th', '$2b$10$5FALWHRfgaBZC0Az5BAVdeelVK4LgRGyKOmSC0hNI3yU6.PRbCxnW', 'ครูบัญชี 01', 'evaluatee', 'active', 4, NULL, NULL, '2026-05-20 04:02:17', '2026-09-29 07:33:56', '2026-09-29 07:33:56');

-- --------------------------------------------------------

--
-- Table structure for table `vocational_categories`
--

CREATE TABLE `vocational_categories` (
  `id` int NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_th` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vocational_categories`
--

INSERT INTO `vocational_categories` (`id`, `code`, `name_th`, `created_at`) VALUES
(1, 'CAT01', 'อุตสาหกรรม', '2026-05-20 04:02:17'),
(2, 'CAT02', 'บริหารธุรกิจ', '2026-05-20 04:02:17'),
(3, 'CAT03', 'ศิลปกรรมและเศรษฐกิจสร้างสรรค์', '2026-05-20 04:02:17'),
(4, 'CAT04', 'คหกรรม', '2026-05-20 04:02:17'),
(5, 'CAT05', 'เกษตรกรรมและประมง', '2026-05-20 04:02:17'),
(6, 'CAT06', 'อุตสาหกรรมท่องเที่ยว', '2026-05-20 04:02:17'),
(7, 'CAT07', 'อุตสาหกรรมแฟชั่นและสิ่งทอ', '2026-05-20 04:02:17'),
(8, 'CAT08', 'อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ', '2026-05-20 04:02:17'),
(9, 'CAT09', 'โลจิสติกส์', '2026-05-20 04:02:17'),
(10, 'CAT10', 'อุตสาหกรรมสุขภาพและความงาม', '2026-05-20 04:02:17'),
(11, 'CAT11', 'อุตสาหกรรมบันเทิง', '2026-05-20 04:02:17');

-- --------------------------------------------------------

--
-- Table structure for table `vocational_fields`
--

CREATE TABLE `vocational_fields` (
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_th` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vocational_fields`
--

INSERT INTO `vocational_fields` (`code`, `name_th`, `category_id`) VALUES
('20101', 'ช่างยนต์', 1),
('20102', 'ช่างกลโรงงาน', 1),
('20103', 'ช่างเชื่อมโลหะ', 1),
('20104', 'ช่างไฟฟ้ากำลัง', 1),
('20105', 'อิเล็กทรอนิกส์', 1),
('20127', 'เมคคาทรอนิกส์และหุ่นยนต์', 1),
('20201', 'การบัญชี', 2),
('20202', 'การตลาด', 2),
('20216', 'การจัดการสำนักงานดิจิทัล', 2),
('20406', 'คหกรรมศาสตร์', 4),
('20701', 'การโรงแรม', 6),
('20702', 'การท่องเที่ยว', 6),
('21302', 'การจัดการงานบริการสถานพยาบาล', 10),
('21303', 'ธุรกิจการกีฬา', 10),
('21305', 'ธุรกิจเสริมสวย', 10),
('21401', 'โลจิสติกส์', 9),
('21504', 'อาหารและโภชนาการ', 4),
('21602', 'การออกแบบ', 3),
('21606', 'การถ่ายภาพและมัลติมีเดีย', 3),
('21619', 'ออกแบบนิเทศศิลป์', 3),
('21701', 'เกษตรศาสตร์', 5),
('21709', 'นวัตกรรมเกษตร', 5),
('21715', 'ประมง', 5),
('21801', 'เทคโนโลยีสิ่งทอ', 7),
('21802', 'เคมีสิ่งทอ', 7),
('21803', 'เทคโนโลยีเครื่องนุ่งห่ม', 7),
('21804', 'แฟชั่นและสิ่งทอ', 4),
('21901', 'เทคโนโลยีสารสนเทศ', 8),
('21903', 'คอมพิวเตอร์โปรแกรมเมอร์', 8),
('21906', 'เทคโนโลยีปัญญาประดิษฐ์', 8),
('21907', 'เทคโนโลยีโลกเสมือนจริง', 8),
('21910', 'เทคโนโลยีธุรกิจดิจิทัล', 2),
('22001', 'อุตสาหกรรมแสงและเสียง', 11),
('22002', 'อุตสาหกรรมดนตรี', 11);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_evidence_progress`
-- (See below for the actual view)
--
CREATE TABLE `v_evidence_progress` (
`buddhist_year` int
,`dept_name` varchar(255)
,`evaluatee_name` varchar(255)
,`files_uploaded` bigint
,`indicator_code` varchar(40)
,`indicator_name` varchar(255)
,`topic_title` varchar(255)
);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_asg` (`period_id`,`evaluator_id`,`evaluatee_id`),
  ADD KEY `fk_asg_dept` (`dept_id`),
  ADD KEY `idx_asg_evalr` (`evaluator_id`,`period_id`),
  ADD KEY `idx_asg_evale` (`evaluatee_id`,`period_id`);

--
-- Indexes for table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_att_period` (`period_id`),
  ADD KEY `fk_att_ind` (`indicator_id`),
  ADD KEY `fk_att_evtype` (`evidence_type_id`),
  ADD KEY `idx_attach_evale` (`evaluatee_id`,`period_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `fk_dept_cat` (`category_id`),
  ADD KEY `fk_dept_org` (`org_group_id`);

--
-- Indexes for table `dept_fields`
--
ALTER TABLE `dept_fields`
  ADD PRIMARY KEY (`dept_id`,`field_code`),
  ADD KEY `fk_df_field` (`field_code`);

--
-- Indexes for table `evaluation_periods`
--
ALTER TABLE `evaluation_periods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `evaluation_results`
--
ALTER TABLE `evaluation_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_res_period` (`period_id`),
  ADD KEY `fk_res_evalr` (`evaluator_id`),
  ADD KEY `fk_res_topic` (`topic_id`),
  ADD KEY `idx_results_evale` (`evaluatee_id`,`period_id`),
  ADD KEY `idx_results_indicator` (`indicator_id`);

--
-- Indexes for table `evaluation_topics`
--
ALTER TABLE `evaluation_topics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `evidence_types`
--
ALTER TABLE `evidence_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `indicators`
--
ALTER TABLE `indicators`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_ind_topic` (`topic_id`);

--
-- Indexes for table `indicator_evidence`
--
ALTER TABLE `indicator_evidence`
  ADD PRIMARY KEY (`indicator_id`,`evidence_type_id`),
  ADD KEY `fk_ie_ev` (`evidence_type_id`);

--
-- Indexes for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `org_groups`
--
ALTER TABLE `org_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `self_evaluation_results`
--
ALTER TABLE `self_evaluation_results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_self_eval` (`period_id`,`evaluatee_id`,`indicator_id`),
  ADD KEY `fk_self_res_period` (`period_id`),
  ADD KEY `fk_self_res_evale` (`evaluatee_id`),
  ADD KEY `fk_self_res_ind` (`indicator_id`);

--
-- Indexes for table `self_eval_submissions`
--
ALTER TABLE `self_eval_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_self_sub` (`period_id`,`evaluatee_id`),
  ADD KEY `fk_self_sub_user` (`evaluatee_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_dept` (`department_id`);

--
-- Indexes for table `vocational_categories`
--
ALTER TABLE `vocational_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `vocational_fields`
--
ALTER TABLE `vocational_fields`
  ADD PRIMARY KEY (`code`),
  ADD KEY `fk_vf_cat` (`category_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `evaluation_periods`
--
ALTER TABLE `evaluation_periods`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `evaluation_results`
--
ALTER TABLE `evaluation_results`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `evaluation_topics`
--
ALTER TABLE `evaluation_topics`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `evidence_types`
--
ALTER TABLE `evidence_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `indicators`
--
ALTER TABLE `indicators`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `org_groups`
--
ALTER TABLE `org_groups`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `self_evaluation_results`
--
ALTER TABLE `self_evaluation_results`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=381;

--
-- AUTO_INCREMENT for table `self_eval_submissions`
--
ALTER TABLE `self_eval_submissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `vocational_categories`
--
ALTER TABLE `vocational_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

-- --------------------------------------------------------

--
-- Structure for view `v_evidence_progress`
--
DROP TABLE IF EXISTS `v_evidence_progress`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_evidence_progress`  AS SELECT `u`.`name_th` AS `evaluatee_name`, `d`.`name_th` AS `dept_name`, `p`.`buddhist_year` AS `buddhist_year`, `t`.`title_th` AS `topic_title`, `i`.`code` AS `indicator_code`, `i`.`name_th` AS `indicator_name`, count(`a`.`id`) AS `files_uploaded` FROM ((((((`users` `u` join `departments` `d` on((`d`.`id` = `u`.`department_id`))) join `assignments` `s` on((`s`.`evaluatee_id` = `u`.`id`))) join `evaluation_periods` `p` on(((`p`.`id` = `s`.`period_id`) and (`p`.`is_active` = 1)))) join `indicators` `i` on((1 = 1))) join `evaluation_topics` `t` on((`t`.`id` = `i`.`topic_id`))) left join `attachments` `a` on(((`a`.`indicator_id` = `i`.`id`) and (`a`.`evaluatee_id` = `u`.`id`) and (`a`.`period_id` = `p`.`id`)))) WHERE (`u`.`role` = 'evaluatee') GROUP BY `u`.`name_th`, `d`.`name_th`, `p`.`buddhist_year`, `t`.`title_th`, `i`.`code`, `i`.`name_th` ORDER BY `u`.`name_th` ASC, `t`.`title_th` ASC, `i`.`code` ASC ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `fk_asg_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asg_evale` FOREIGN KEY (`evaluatee_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asg_evalr` FOREIGN KEY (`evaluator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asg_period` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `fk_att_evale` FOREIGN KEY (`evaluatee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_att_evtype` FOREIGN KEY (`evidence_type_id`) REFERENCES `evidence_types` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_att_ind` FOREIGN KEY (`indicator_id`) REFERENCES `indicators` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_att_period` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `fk_dept_cat` FOREIGN KEY (`category_id`) REFERENCES `vocational_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_dept_org` FOREIGN KEY (`org_group_id`) REFERENCES `org_groups` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `dept_fields`
--
ALTER TABLE `dept_fields`
  ADD CONSTRAINT `fk_df_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_df_field` FOREIGN KEY (`field_code`) REFERENCES `vocational_fields` (`code`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `evaluation_results`
--
ALTER TABLE `evaluation_results`
  ADD CONSTRAINT `fk_res_evale` FOREIGN KEY (`evaluatee_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_res_evalr` FOREIGN KEY (`evaluator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_res_ind` FOREIGN KEY (`indicator_id`) REFERENCES `indicators` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_res_period` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_res_topic` FOREIGN KEY (`topic_id`) REFERENCES `evaluation_topics` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `indicators`
--
ALTER TABLE `indicators`
  ADD CONSTRAINT `fk_ind_topic` FOREIGN KEY (`topic_id`) REFERENCES `evaluation_topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `indicator_evidence`
--
ALTER TABLE `indicator_evidence`
  ADD CONSTRAINT `fk_ie_ev` FOREIGN KEY (`evidence_type_id`) REFERENCES `evidence_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ie_ind` FOREIGN KEY (`indicator_id`) REFERENCES `indicators` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD CONSTRAINT `login_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `self_eval_submissions`
--
ALTER TABLE `self_eval_submissions`
  ADD CONSTRAINT `fk_self_sub_period` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_self_sub_user` FOREIGN KEY (`evaluatee_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `vocational_fields`
--
ALTER TABLE `vocational_fields`
  ADD CONSTRAINT `fk_vf_cat` FOREIGN KEY (`category_id`) REFERENCES `vocational_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
