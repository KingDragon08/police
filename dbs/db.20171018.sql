-- MySQL dump 10.13  Distrib 5.7.18, for osx10.12 (x86_64)
--
-- Host: xiaofen809.com    Database: police
-- ------------------------------------------------------
-- Server version	5.7.19-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `action`
--

DROP TABLE IF EXISTS `action`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `action` (
  `action_id` int(32) NOT NULL AUTO_INCREMENT COMMENT '功能id',
  `action_name` varchar(32) NOT NULL COMMENT '功能名称',
  `addtime` varchar(32) DEFAULT NULL COMMENT '创建时间戳',
  PRIMARY KEY (`action_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `action`
--

LOCK TABLES `action` WRITE;
/*!40000 ALTER TABLE `action` DISABLE KEYS */;
/*!40000 ALTER TABLE `action` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `camera`
--

DROP TABLE IF EXISTS `camera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `camera` (
  `cam_id` int(32) NOT NULL AUTO_INCREMENT COMMENT '设备记录id',
  `cam_no` varchar(32) NOT NULL COMMENT '设备编号',
  `cam_name` varchar(16) DEFAULT NULL COMMENT '设备名称',
  `cam_sta` tinyint(2) unsigned NOT NULL DEFAULT '0' COMMENT '设备状态',
  `addtime` varchar(32) DEFAULT NULL COMMENT '创建时间',
  `uptime` varchar(32) DEFAULT NULL COMMENT '修改时间',
  `user_id` int(32) DEFAULT NULL,
  `cam_loc_lan` varchar(32) DEFAULT NULL,
  `cam_loc_lon` varchar(32) DEFAULT NULL,
  `cam_desc` text,
  `is_del` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `cam_addr` text,
  PRIMARY KEY (`cam_id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camera`
--

LOCK TABLES `camera` WRITE;
/*!40000 ALTER TABLE `camera` DISABLE KEYS */;
INSERT INTO `camera` VALUES (1,'cam_100','cam_100',0,'1506414499513','1506413991777',1,'305827.02166649466','499791.0914712376','cam_100_desc',1,'cam_100_addr'),(2,'cam_99','cam_99',2,'1506414499658','1506414499658',1,'305352.33888985787','500241.7567744438','cam_99_desc',0,'cam_99_addr'),(3,'cam_98','cam_98',0,'1506414499673','1506414499673',1,'306493.8044095913','499650.3555874614','cam_98_desc',0,'cam_98_addr'),(4,'cam_97','cam_97',0,'1506414499684',NULL,1,'306764.66419150436','500490.44594191056','cam_97_desc',0,'cam_97_addr'),(5,'cam_96','cam_96',2,'1506414499811',NULL,1,'306670.35334405827','500220.3199454246','cam_96_desc',0,'cam_96_addr'),(6,'cam_95','cam_95',1,'1506414499934','1506414499934',1,'306543.81041238486','500298.1790942219','cam_95_desc',0,'cam_95_addr'),(7,'cam_94','cam_94',1,'1506414499947','1506480001174',1,'305810.7032338379','499390.76349420805','cam_94_desc',1,'cam_94_addr'),(8,'cam_93','cam_93',2,'1506414499959','1506414499959',1,'305174.2923667771','500925.3075178952','cam_93_desc',0,'cam_93_addr'),(9,'cam_92','cam_92',2,'1506414499970','1506414499970',1,'306001.0718171409','500499.7615490883','cam_92_desc',0,'cam_92_addr'),(10,'cam_91','cam_91',0,'1506414500099','1506414500099',1,'306163.8591406848','499924.67979635485','cam_91_desc',0,'cam_91_addr'),(11,'cam_90','cam_90',1,'1506414500109','1506414500109',1,'306031.68438150047','500733.4338098044','cam_90_desc',0,'cam_90_addr'),(12,'cam_89','cam_89',0,'1506414500120','1506414500120',1,'305401.65477123007','500574.29478637886','cam_89_desc',0,'cam_89_addr'),(13,'cam_88','cam_88',0,'1506414500129','1506414500129',1,'305102.0251875257','500369.8664865397','cam_88_desc',0,'cam_88_addr'),(14,'cam_87','cam_87',1,'1506414500139','1506414500139',1,'306533.30370120273','499662.47937202384','cam_87_desc',0,'cam_87_addr'),(15,'cam_86','cam_86',2,'1506414500271','1506414500271',1,'305233.9052389273','501372.7033481677','cam_86_desc',0,'cam_86_addr'),(16,'cam_85','cam_85',1,'1506414500285','1506652989241',1,'306288.2226182915','500991.4596353451','cam_85_desc',1,'cam_85_addr'),(17,'cam_84','cam_84',0,'1506414500300','1506598093102',1,'306428.17961507424','499420.67898125073','cam_84_desc',1,'cam_84_addr'),(18,'cam_83','cam_83',1,'1506414500312','1506414500312',1,'305342.80303452624','500620.07382706663','cam_83_desc',0,'cam_83_addr'),(19,'cam_82','cam_82',1,'1506414500432','1506414500432',1,'306309.2111541338','500414.5190644958','cam_82_desc',0,'cam_82_addr'),(20,'cam_81','cam_81',1,'1506414500442',NULL,1,'305698.06527270965','501225.61312449496','cam_81_desc',0,'cam_81_addr'),(21,'cam_80','cam_80',2,'1506414500452','1506414500452',1,'306633.35082045593','499711.4394879037','cam_80_desc',0,'cam_80_addr'),(22,'cam_79','cam_79',2,'1506414500464',NULL,1,'305907.68456084596','501172.47196040326','cam_79_desc',0,'cam_79_addr'),(23,'cam_78','cam_78',2,'1506414500477','1506597309858',1,'305982.59564769384','500469.68208444526','cam_78_desc',1,'cam_78_addr'),(24,'cam_77','cam_77',0,'1506414500603','1506596287901',1,'306201.89630505507','501372.2996268468','cam_77_desc',1,'cam_77_addr'),(25,'cam_76','cam_76',2,'1506414500614','1506414500614',1,'305358.11741036084','499938.1538618653','cam_76_desc',0,'cam_76_addr'),(26,'cam_75','cam_75',2,'1506414500625','1506414500625',1,'305199.12633063056','501241.88294491766','cam_75_desc',0,'cam_75_addr'),(27,'cam_74','cam_74',0,'1506414500635','1506414500635',1,'305623.12570780044','501351.5238421549','cam_74_desc',0,'cam_74_addr'),(28,'cam_73','cam_73',1,'1506414500887',NULL,1,'306587.65306111996','500591.1789215641','cam_73_desc',0,'cam_73_addr'),(29,'cam_72','cam_72',0,'1506414500902','1506414500902',1,'305495.46914846986','499817.6223930091','cam_72_desc',0,'cam_72_addr'),(30,'cam_71','cam_71',1,'1506414500913','1506414500913',1,'305651.80060233077','500084.2605002931','cam_71_desc',0,'cam_71_addr'),(31,'cam_70','cam_70',0,'1506414500925','1506414500925',1,'305798.25817804533','499606.79402029054','cam_70_desc',0,'cam_70_addr'),(32,'cam_69','cam_69',0,'1506414501050','1506414501050',1,'305827.40476402844','499534.60998137324','cam_69_desc',0,'cam_69_addr'),(33,'cam_68','cam_68',1,'1506414501060',NULL,1,'306660.14364704763','500583.7607711543','cam_68_desc',0,'cam_68_addr'),(34,'cam_67','cam_67',1,'1506414501070','1506414501070',1,'306064.4846788977','500633.0501381051','cam_67_desc',0,'cam_67_addr'),(35,'cam_66','cam_66',1,'1506414501079','1506494093275',1,'306969.80129838525','500061.635256317','cam_66_desc',1,'cam_66_addr'),(36,'cam_65','cam_65',2,'1506414501089','1506414501089',1,'305033.9263933275','500780.96477759874','cam_65_desc',0,'cam_65_addr'),(37,'cam_64','cam_64',0,'1506414501214','1506414501214',1,'305288.65991902904','499552.3003140743','cam_64_desc',0,'cam_64_addr'),(38,'cam_63','cam_63',0,'1506414501224','1506598002706',1,'306517.834649304','501218.40174161457','cam_63_desc',1,'cam_63_addr'),(39,'cam_62','cam_62',2,'1506414501233','1506414501233',1,'306527.2963225886','500352.127463072','cam_62_desc',0,'cam_62_addr'),(40,'cam_61','cam_61',2,'1506414501242','1506414501242',1,'305120.14599060203','500787.60122808255','cam_61_desc',0,'cam_61_addr'),(41,'cam_60','cam_60',2,'1506414501252','1506414501252',1,'305240.2363927348','500014.2459377543','cam_60_desc',0,'cam_60_addr'),(42,'cam_59','cam_59',0,'1506414501379','1506414501379',1,'305783.4033988347','500568.34845172905','cam_59_desc',0,'cam_59_addr'),(43,'cam_58','cam_58',1,'1506414501390','1506414501390',1,'305447.835268116','499808.0016889879','cam_58_desc',0,'cam_58_addr'),(44,'cam_57','cam_57',0,'1506414501399','1506414501399',1,'306140.5618798759','499652.21026455227','cam_57_desc',0,'cam_57_addr'),(45,'cam_56','cam_56',1,'1506414501409','1506414501409',1,'305584.73104475334','501013.6667942426','cam_56_desc',0,'cam_56_addr'),(46,'cam_55','cam_55',0,'1506414501419','1506598876704',1,'306850.42340701265','500414.1307258867','cam_55_desc',1,'cam_55_addr'),(47,'cam_54','cam_54',0,'1506414501547','1506414501547',1,'306631.474430375','500293.6152280803','cam_54_desc',0,'cam_54_addr'),(48,'cam_53','cam_53',1,'1506414501557','1506414501557',1,'305321.80622158264','500717.15580847964','cam_53_desc',0,'cam_53_addr'),(49,'cam_52','cam_52',1,'1506414501566','1506414501566',1,'305207.79782417184','500755.8188065465','cam_52_desc',0,'cam_52_addr'),(50,'cam_51','cam_51',0,'1506414501575',NULL,1,'305473.3006578295','499610.75317899924','cam_51_desc',0,'cam_51_addr'),(51,'cam_50','cam_50',0,'1506414501585',NULL,1,'306464.4343237912','500573.85836676805','cam_50_desc',0,'cam_50_addr'),(52,'cam_49','cam_49',1,'1506414501710','1506598540133',1,'306318.82992859674','501377.3124855402','cam_49_desc',1,'cam_49_addr'),(53,'cam_48','cam_48',0,'1506414501830',NULL,1,'305886.6184837249','500765.6817788466','cam_48_desc',0,'cam_48_addr'),(54,'cam_47','cam_47',1,'1506414501840','1506597422021',1,'306860.81786971004','500886.4580034659','cam_47_desc',1,'cam_47_addr'),(55,'cam_46','cam_46',1,'1506414501851',NULL,1,'306690.3925120764','500355.95373302745','cam_46_desc',0,'cam_46_addr'),(56,'cam_45','cam_45',0,'1506414501862','1506598579051',1,'306316.5967112999','501224.85076232173','cam_45_desc',1,'cam_45_addr'),(57,'cam_44','cam_44',0,'1506414501875','1506597441984',1,'306967.18647324137','500876.4300548551','cam_44_desc',1,'cam_44_addr'),(58,'cam_43','cam_43',2,'1506414501906','1506598885898',1,'306306.612891523','501138.8833267869','cam_43_desc',1,'cam_43_addr'),(59,'cam_42','cam_42',0,'1506414501914','1506414501914',1,'304984.1081642116','500761.58308029006','cam_42_desc',0,'cam_42_addr'),(60,'cam_41','cam_41',0,'1506414501923','1506597409555',1,'306349.19518095034','500606.12666882924','cam_41_desc',1,'cam_41_addr'),(61,'cam_40','cam_40',2,'1506414501933','1506414501933',1,'305154.8968700253','501113.6356367918','cam_40_desc',0,'cam_40_addr'),(62,'cam_39','cam_39',0,'1506414501942','1506597275294',1,'306867.7339948254','501043.1630572809','cam_39_desc',1,'cam_39_addr'),(63,'cam_38','cam_38',2,'1506414501952','1506414501952',1,'305880.1733640756','501060.1187451425','cam_38_desc',0,'cam_38_addr'),(64,'cam_37','cam_37',0,'1506414501961','1506414501961',1,'305231.16727995157','499545.99639143725','cam_37_desc',0,'cam_37_addr'),(65,'cam_36','cam_36',0,'1506414501971','1506414501971',1,'306357.6408891466','500647.2460092865','cam_36_desc',0,'cam_36_addr'),(66,'cam_35','cam_35',1,'1506414501980','1506414501980',1,'305063.6369577758','501362.5510735495','cam_35_desc',0,'cam_35_addr'),(67,'cam_34','cam_34',0,'1506414501989','1506414501989',1,'306185.27506774536','500672.49046627065','cam_34_desc',0,'cam_34_addr'),(68,'cam_33','cam_33',0,'1506414501999',NULL,1,'305365.43735744944','499382.2472688934','cam_33_desc',0,'cam_33_addr'),(69,'cam_32','cam_32',1,'1506414502009','1506414502009',1,'305074.4738118985','501140.11317578424','cam_32_desc',0,'cam_32_addr'),(70,'cam_31','cam_31',1,'1506414502019','1506414502019',1,'305583.825273249','500280.7735178111','cam_31_desc',0,'cam_31_addr'),(71,'cam_30','cam_30',0,'1506414502028',NULL,1,'306460.36420796637','499979.9496595191','cam_30_desc',0,'cam_30_addr'),(72,'cam_29','cam_29',2,'1506414502038','1506678374269',1,'306477.1562112753','500879.82151309354','cam_29_desc',1,'cam_29_addr'),(73,'cam_28','cam_28',2,'1506414502048','1506414502048',1,'305204.51995546295','500302.5981885618','cam_28_desc',0,'cam_28_addr'),(74,'cam_27','cam_27',0,'1506414502057','1506414502057',1,'306095.2150237055','500652.1442715786','cam_27_desc',0,'cam_27_addr'),(75,'cam_26','cam_26',2,'1506414502079',NULL,1,'306084.4471060653','500291.0287017746','cam_26_desc',0,'cam_26_addr'),(76,'cam_25','cam_25',0,'1506414502088','1506597544178',1,'306788.24373551935','500763.556117553','cam_25_desc',1,'cam_25_addr'),(77,'cam_24','cam_24',0,'1506414502098',NULL,1,'305383.85249103163','500925.33547319996','cam_24_desc',0,'cam_24_addr'),(78,'cam_23','cam_23',0,'1506414502107',NULL,1,'305940.38867108105','499678.28270519053','cam_23_desc',0,'cam_23_addr'),(79,'cam_22','cam_22',2,'1506414502116','1506414502116',1,'305369.32660775876','500808.61907433684','cam_22_desc',0,'cam_22_addr'),(80,'cam_21','cam_21',2,'1506414502125','1506414502125',1,'305119.4130760879','501130.7634282716','cam_21_desc',0,'cam_21_addr'),(81,'cam_20','cam_20',1,'1506414502135','1506597397870',1,'306690.073236928','500344.7472403624','cam_20_desc',1,'cam_20_addr'),(82,'cam_19','cam_19',1,'1506414502145','1506414502145',1,'306066.88619290094','500136.38279571536','cam_19_desc',0,'cam_19_addr'),(83,'cam_18','cam_18',1,'1506414502153','1506414502153',1,'305128.81047823903','501320.77507712966','cam_18_desc',0,'cam_18_addr'),(84,'cam_17','cam_17',1,'1506414502163','1506414502163',1,'306285.9165219863','500134.4657211038','cam_17_desc',0,'cam_17_addr'),(85,'cam_16','cam_16',0,'1506414502172','1506654249574',1,'306393.5243807004','500863.20348332205','cam_16_desc',1,'cam_16_addr'),(86,'cam_15','cam_15',1,'1506414502181',NULL,1,'305244.17488389014','499389.9168008655','cam_15_desc',0,'cam_15_addr'),(87,'cam_14','cam_14',2,'1506414502190','1506414502190',1,'305965.48118825065','499794.47103419545','cam_14_desc',0,'cam_14_addr'),(88,'cam_13','cam_13',2,'1506414502203','1506414502203',1,'305789.4817204476','499805.78044531646','cam_13_desc',0,'cam_13_addr'),(89,'cam_12','cam_12',1,'1506414502212','1506414502212',1,'305244.79905077076','500942.15201516903','cam_12_desc',0,'cam_12_addr'),(90,'cam_11','cam_11',0,'1506414502220',NULL,1,'306739.6753378365','500553.7732989755','cam_11_desc',0,'cam_11_addr'),(91,'cam_10','cam_10',2,'1506414502230','1506414502230',1,'306255.13855129195','500724.7945298454','cam_10_desc',0,'cam_10_addr'),(92,'cam_9','cam_9',1,'1506414502239',NULL,1,'306549.31259452476','499774.72343091504','cam_9_desc',0,'cam_9_addr'),(93,'cam_8','cam_8',0,'1506414502248','1506414502248',1,'305287.5462825681','499762.8893194613','cam_8_desc',0,'cam_8_addr'),(94,'cam_7','cam_7',2,'1506414502257','1506414502257',1,'305921.34976766433','499989.12553858466','cam_7_desc',0,'cam_7_addr'),(95,'cam_6','cam_6',2,'1506414502267','1506414502267',1,'306128.7285074861','500077.2114094296','cam_6_desc',0,'cam_6_addr'),(96,'cam_5','cam_5',1,'1506414502277','1506596235121',1,'306747.6925533853','501064.0077853843','cam_5_desc',1,'cam_5_addr'),(97,'cam_4','cam_4',0,'1506414502286','1506414502286',1,'306175.79383336304','500245.297202814','cam_4_desc',0,'cam_4_addr'),(98,'cam_3','cam_3',1,'1506414502295','1506648876317',1,'306312.4993295746','500985.5586259819','cam_3_desc',1,'cam_3_addr'),(99,'cam_2','cam_2',1,'1506414502303','1506414502303',1,'305976.33619558986','499911.7672222366','cam_2_desc',0,'cam_2_addr'),(100,'cam_1','cam_1',0,'1506414502313','1506414502313',1,'305477.5628204661','499989.49356843496','cam_1_desc',0,'cam_1_addr'),(101,'cam_0','cam_0',0,'1506414502321','1506587567217',1,'305590.48178227164','500499.78706836805','cam_0_desc',1,'cam_0_addr'),(102,'111','',0,'1506414001548','1506672424092',6,'305971.1','500377.96','',0,'');
/*!40000 ALTER TABLE `camera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `camera_attr`
--

DROP TABLE IF EXISTS `camera_attr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `camera_attr` (
  `attr_name` varchar(255) NOT NULL COMMENT '属性名称',
  `tab_display` tinyint(2) NOT NULL DEFAULT '1' COMMENT 'tab是否显示,默认为1,1:不显示,2:显示',
  `rkey_display` tinyint(2) NOT NULL DEFAULT '1' COMMENT '右键是否显示,默认为1,1:不显示,2:显示',
  `search_display` tinyint(2) NOT NULL DEFAULT '1' COMMENT '搜索是否显示,默认为1,1:不显示,2:显示',
  `detail_display` tinyint(2) NOT NULL DEFAULT '1' COMMENT '详细信息是否显示,默认为1,1:不显示,2:显示',
  PRIMARY KEY (`attr_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camera_attr`
--

LOCK TABLES `camera_attr` WRITE;
/*!40000 ALTER TABLE `camera_attr` DISABLE KEYS */;
/*!40000 ALTER TABLE `camera_attr` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `camera_feedback`
--

DROP TABLE IF EXISTS `camera_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `camera_feedback` (
  `fb_id` int(32) NOT NULL AUTO_INCREMENT COMMENT '设备反馈id',
  `cam_id` int(32) DEFAULT NULL COMMENT '设备id',
  `content` text COMMENT '反馈内容',
  `addtime` varchar(32) DEFAULT NULL COMMENT '创建时间',
  `user_id` int(32) DEFAULT NULL,
  `fb_loc_lon` varchar(32) DEFAULT NULL,
  `fb_loc_lan` varchar(32) DEFAULT NULL,
  `fb_addr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`fb_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camera_feedback`
--

LOCK TABLES `camera_feedback` WRITE;
/*!40000 ALTER TABLE `camera_feedback` DISABLE KEYS */;
INSERT INTO `camera_feedback` VALUES (1,77,'feedback','1505896361748',10,'0','0',''),(2,77,'feedback','1505896458105',10,'0','0',''),(3,77,'feedback','1505896482898',10,'0','0',''),(4,77,'feedback','1505896514005',10,'0','0',''),(5,77,'feedback','1505896730864',10,'0','0',''),(6,2,'testtest','1506694000507',1,'0','1','address'),(7,95,'feedback','1506697308972',10,'0','0',''),(8,2,'testtest','1506735819883',10,'0','1','address'),(9,2,'testtest','1506735950214',10,'0','1','address'),(10,2,'testtest','1506736069554',10,'0','1','address');
/*!40000 ALTER TABLE `camera_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `camera_feedback_pics`
--

DROP TABLE IF EXISTS `camera_feedback_pics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `camera_feedback_pics` (
  `pic_id` int(32) NOT NULL AUTO_INCREMENT COMMENT '反馈图片id',
  `fb_id` int(32) DEFAULT NULL COMMENT '反馈id',
  `pic` varchar(255) DEFAULT NULL COMMENT '图片链接',
  `addtime` varchar(32) DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`pic_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camera_feedback_pics`
--

LOCK TABLES `camera_feedback_pics` WRITE;
/*!40000 ALTER TABLE `camera_feedback_pics` DISABLE KEYS */;
INSERT INTO `camera_feedback_pics` VALUES (1,5,'link1','1505896730864'),(2,5,'link2','1505896730864'),(3,6,'1','1506694000507'),(4,6,'3','1506694000507'),(5,6,'2','1506694000507'),(6,7,'link2','1506697308972'),(7,7,'link1','1506697308972'),(8,8,'1','1506735819883'),(9,8,'2','1506735819883'),(10,8,'3','1506735819883'),(11,9,'3','1506735950214'),(12,9,'1','1506735950214'),(13,9,'2','1506735950214'),(14,10,'1','1506736069554'),(15,10,'2','1506736069554'),(16,10,'3','1506736069554');
/*!40000 ALTER TABLE `camera_feedback_pics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `car`
--

DROP TABLE IF EXISTS `car`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `car` (
  `Id` int(32) NOT NULL AUTO_INCREMENT,
  `NO` varchar(20) NOT NULL,
  `type` int(8) NOT NULL DEFAULT '1',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `car`
--

LOCK TABLES `car` WRITE;
/*!40000 ALTER TABLE `car` DISABLE KEYS */;
INSERT INTO `car` VALUES (1,'京A00001',1),(3,'京A00003',2);
/*!40000 ALTER TABLE `car` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interestPoint`
--

DROP TABLE IF EXISTS `interestPoint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interestPoint` (
  `Id` int(32) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `longitude` varchar(255) NOT NULL,
  `latitude` varchar(255) NOT NULL,
  `desc` varchar(1000) NOT NULL,
  `status` int(2) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interestPoint`
--

LOCK TABLES `interestPoint` WRITE;
/*!40000 ALTER TABLE `interestPoint` DISABLE KEYS */;
INSERT INTO `interestPoint` VALUES (1,'first','654.321','123.456','description1',1),(2,'first','0.0001','123.456','description',1);
/*!40000 ALTER TABLE `interestPoint` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mobileUser`
--

DROP TABLE IF EXISTS `mobileUser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mobileUser` (
  `Id` int(32) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `plainPassword` varchar(255) NOT NULL,
  `sex` varchar(1) NOT NULL,
  `company` varchar(255) NOT NULL,
  `NO` varchar(50) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `createTime` varchar(20) NOT NULL,
  `lastLoginTime` varchar(20) NOT NULL,
  `lastLoginIP` varchar(50) DEFAULT NULL,
  `avatar` varchar(255) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  `status` int(8) NOT NULL DEFAULT '1',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mobileUser`
--

LOCK TABLES `mobileUser` WRITE;
/*!40000 ALTER TABLE `mobileUser` DISABLE KEYS */;
INSERT INTO `mobileUser` VALUES (1,'KingDragon','e10adc3949ba59abbe56e057f20f883e','123456','M','test','000001','13800000000','1505664801749','1505708350858','0.0.0.0','','ecfe1f0eda59907ed1e65b4cf86cee22',1),(2,'test','e10adc3949ba59abbe56e057f20f883e','123456','M','police','000002','13888888888','1505715150588','1505715150588',NULL,'',NULL,1),(3,'test','e10adc3949ba59abbe56e057f20f883e','123456','M','police','000002','13888888889','1505717245594','1505717245594',NULL,'',NULL,1),(4,'test','e10adc3949ba59abbe56e057f20f883e','123456','M','police','000002','13888888880','1505717373443','1505717373443',NULL,'',NULL,1),(5,'test','e10adc3949ba59abbe56e057f20f883e','123456','M','police','1234','13810332931','1505720910932','1505723335875','0.0.0.0','','3d9db3d7a0c3c4ef547422817d396a44',1),(6,'admin','e10adc3949ba59abbe56e057f20f883e','123456','M','西城公安局','123456','17610891519','1505721953057','1505788704545','0.0.0.0','','eba3375103e44b713f424f379befd1b8',1),(7,'UNKNOWN','25d55ad283aa400af464c76d713c07ad','12345678','M','west','000000','12345678901','1505725070597','1505725195366','0.0.0.0','','0a5f4ed005cd36223977e51742598a8c',1),(8,'first1','f1887d3f9e6ee7a32fe5e76f4ab80d63','123457','M','westPolice','000123','13810332932','1505800911215','1505810893519','0.0.0.0','http://www.baidu.com','KingDragon',1),(10,'17610891519','202cb962ac59075b964b07152d234b70','123','M','西城公安局','000133','18310054013','1505879410569','1507702633747','http://www.baidu.com','img/paishe1.png','4077271b4c924ab290ce76a800e031c5',1);
/*!40000 ALTER TABLE `mobileUser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `role_id` int(32) NOT NULL AUTO_INCREMENT COMMENT '角色id',
  `role_name` varchar(32) NOT NULL COMMENT '角色名称',
  `addtime` varchar(32) DEFAULT NULL COMMENT '创建时间戳',
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_action`
--

DROP TABLE IF EXISTS `role_action`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_action` (
  `id` int(32) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `role_id` int(32) DEFAULT NULL COMMENT '角色id',
  `action_id` int(32) DEFAULT NULL COMMENT '功能id',
  `addtime` varchar(32) DEFAULT NULL COMMENT '创建时间戳',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_action`
--

LOCK TABLES `role_action` WRITE;
/*!40000 ALTER TABLE `role_action` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_action` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `Id` int(32) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `plainPassword` varchar(255) NOT NULL,
  `sex` varchar(1) NOT NULL,
  `company` varchar(255) NOT NULL,
  `NO` varchar(50) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `createTime` varchar(20) NOT NULL,
  `lastLoginTime` varchar(20) NOT NULL,
  `lastLoginIP` varchar(50) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `status` int(8) NOT NULL DEFAULT '1',
  `permission` varchar(200) DEFAULT NULL,
  `role_id` int(32) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'KingDragon','e10adc3949ba59abbe56e057f20f883e','123456','M','test','000001','13800000000','1505664801749','1506325942093','0.0.0.0','fb80accc484e4e3774adeff697bdced3',1,'[\"getUserInfo\",\"editUserInfo\",\"getAppUserInfo\",\"editAppUserInfo\",\"getCameraInfo\",\"editCameraInfo\",\"getInterestPoint\",\"editInterestPoint\",\"getCarInfo\",\"editCarInfo\"]',NULL),(2,'test','e10adc3949ba59abbe56e057f20f883e','123456','M','police','000002','13888888888','1505715150588','1505715150588',NULL,NULL,1,'[\"getUserInfo\",\"editUserInfo\",\"getAppUserInfo\",\"editAppUserInfo\",\"getCameraInfo\",\"editCameraInfo\",\"getInterestPoint\",\"editInterestPoint\",\"getCarInfo\",\"editCarInfo\"]',NULL),(3,'test','e10adc3949ba59abbe56e057f20f883e','123456','M','police','000002','13888888889','1505717245594','1505717245594',NULL,NULL,1,'[\"getUserInfo\",\"editUserInfo\",\"getAppUserInfo\",\"editAppUserInfo\",\"getCameraInfo\",\"editCameraInfo\",\"getInterestPoint\",\"editInterestPoint\",\"getCarInfo\",\"editCarInfo\"]',NULL),(4,'test','e10adc3949ba59abbe56e057f20f883e','123456','M','police','000002','13888888880','1505717373443','1505717373443',NULL,NULL,1,'[\"getUserInfo\",\"editUserInfo\",\"getAppUserInfo\",\"editAppUserInfo\",\"getCameraInfo\",\"editCameraInfo\",\"getInterestPoint\",\"editInterestPoint\",\"getCarInfo\",\"editCarInfo\"]',NULL),(5,'test','e10adc3949ba59abbe56e057f20f883e','123456','M','police','1234','13810332931','1505720910932','1505723335875','0.0.0.0','3d9db3d7a0c3c4ef547422817d396a44',1,'[\"getUserInfo\",\"editUserInfo\",\"getAppUserInfo\",\"editAppUserInfo\",\"getCameraInfo\",\"editCameraInfo\",\"getInterestPoint\",\"editInterestPoint\",\"getCarInfo\",\"editCarInfo\"]',NULL),(6,'admin','e10adc3949ba59abbe56e057f20f883e','123456','M','西城公安局','123456','17610891519','','1507628945165','0.0.0.0','8a2347b865adbfbb5b27d7003102c9b9',1,'[\"getUserInfo\",\"editUserInfo\",\"getAppUserInfo\",\"editAppUserInfo\",\"getCameraInfo\",\"editCameraInfo\",\"getInterestPoint\",\"editInterestPoint\",\"getCarInfo\",\"editCarInfo\"]',NULL),(7,'UNKNOWN','25d55ad283aa400af464c76d713c07ad','12345678','M','west','000000','12345678901','1505725070597','1505725195366','0.0.0.0','0a5f4ed005cd36223977e51742598a8c',1,'[\"getUserInfo\",\"editUserInfo\",\"getAppUserInfo\",\"editAppUserInfo\",\"getCameraInfo\",\"editCameraInfo\",\"getInterestPoint\",\"editInterestPoint\",\"getCarInfo\",\"editCarInfo\"]',NULL),(8,'a','4124bc0a9335c27f086f24ba207a4912','aa','M','a','123456','13227259629','1505808504938','1505808526943','0.0.0.0','2c7990f53a1c5e1becd86063d3e6eac3',1,'[\"getUserInfo\",\"editUserInfo\",\"getAppUserInfo\",\"editAppUserInfo\",\"getCameraInfo\",\"editCameraInfo\",\"getInterestPoint\",\"editInterestPoint\",\"getCarInfo\",\"editCarInfo\"]',NULL),(9,'1','c4ca4238a0b923820dcc509a6f75849b','1','M','1','123456','1','1505915522121','1505915522121',NULL,NULL,1,'[\"getUserInfo\",\"editUserInfo\",\"getAppUserInfo\",\"editAppUserInfo\",\"getCameraInfo\",\"editCameraInfo\",\"getInterestPoint\",\"editInterestPoint\",\"getCarInfo\",\"editCarInfo\"]',NULL),(10,'UNKNOWN','d41d8cd98f00b204e9800998ecf8427e','','M','west','123456','00000000000','1505915542486','1505915542486',NULL,NULL,1,'[\"getUserInfo\",\"editUserInfo\",\"getAppUserInfo\",\"editAppUserInfo\",\"getCameraInfo\",\"editCameraInfo\",\"getInterestPoint\",\"editInterestPoint\",\"getCarInfo\",\"editCarInfo\"]',NULL),(11,'admin3','202cb962ac59075b964b07152d234b70','123','M','西城公安局分局','123456','17600166021','1506391003600','1506395517796','0.0.0.0','KingDragon',1,'[\"getUserInfo\",\"editUserInfo\",\"getAppUserInfo\",\"editAppUserInfo\",\"getCameraInfo\",\"editCameraInfo\",\"getInterestPoint\",\"editInterestPoint\",\"getCarInfo\",\"editCarInfo\"]',NULL),(12,'aa','202cb962ac59075b964b07152d234b70','123','M','text','000003','13300003333','1507199616780','1507199616780',NULL,NULL,1,NULL,NULL),(13,'text','202cb962ac59075b964b07152d234b70','123','M','text','000003','13300001111','1507199874908','1507199874908',NULL,NULL,1,NULL,NULL),(14,'aa','202cb962ac59075b964b07152d234b70','123','M','text','000003','13300006666','1507204572810','1507360888332','1.2.3.4','7e5273d88a7871bd0f43df0dca8bc8bc',1,NULL,NULL),(15,'text','202cb962ac59075b964b07152d234b70','123','M','text','000003','13322221111','1507256677426','1507513104714','1.2.3.4','63e3eb04fb578665f74c1acaa69634af',1,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-10-18 15:50:36
