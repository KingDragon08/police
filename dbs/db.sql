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
  `NO` varchar(50) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `createTime` varchar(20) NOT NULL,
  `lastLoginTime` varchar(20) NOT NULL,
  `lastLoginIP` varchar(50) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `status` int(8) NOT NULL DEFAULT '1',
  `role_id` int(32) NOT NULL comment '用户角色id',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'KingDragon','e10adc3949ba59abbe56e057f20f883e','123456','M','000001','13800000000','1505459053939','1505459053939',NULL,NULL,1);
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

-- Dump completed on 2017-09-16 17:20:13


--
-- Table structure for table `camera_attr`
--

DROP TABLE IF EXISTS `camera_attr`;
CREATE TABLE `camera_attr` (
  `attr_name` varchar(255) NOT NULL comment '属性名称',
  `tab_display` tinyint(2) NOT NULL DEFAULT 1 comment 'tab是否显示,默认为1,1:不显示,2:显示',
  `rkey_display` tinyint(2) NOT NULL DEFAULT 1 comment '右键是否显示,默认为1,1:不显示,2:显示',
  `search_display` tinyint(2) NOT NULL DEFAULT 1 comment '搜索是否显示,默认为1,1:不显示,2:显示',
  `detail_display` tinyint(2) NOT NULL DEFAULT 1 comment '详细信息是否显示,默认为1,1:不显示,2:显示',
  PRIMARY KEY (`attr_name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `role_id` int(32) NOT NULL AUTO_INCREMENT comment '角色id',
  `role_name` varchar(32) NOT NULL comment '角色名称',
  `addtime` varchar(32) comment '创建时间戳',

  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

--
-- Table structure for table `action`
--

DROP TABLE IF EXISTS `action`;
CREATE TABLE `action` (
  `action_id` int(32) NOT NULL AUTO_INCREMENT comment '功能id',
  `action_name` varchar(32) NOT NULL comment '功能名称',
  `addtime` varchar(32) comment '创建时间戳',

  PRIMARY KEY (`action_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

--
-- Table structure for table `role_action`
--

DROP TABLE IF EXISTS `role_action`;
CREATE TABLE `role_action` (
  `id` int(32) NOT NULL AUTO_INCREMENT comment 'id',
  `role_id` int(32) comment '角色id',
  `action_id` int(32) comment '功能id',
  `addtime` varchar(32) comment '创建时间戳',

  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;


-- Table structure for table `task`
--
CREATE TABLE `task` (
  `Id` int(32) NOT NULL AUTO_INCREMENT,
  `cameraName` varchar(255) NOT NULL,
  `cameraLocation` varchar(255) NOT NULL,
  `taskDescription` text,
  `userId` int(32) NOT NULL,
  `taskNO` varchar(50) NOT NULL,
  `taskStatus` int(8) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
