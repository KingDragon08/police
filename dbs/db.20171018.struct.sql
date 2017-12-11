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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-10-18 16:00:15
