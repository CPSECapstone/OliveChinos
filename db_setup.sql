CREATE TABLE `Captures` (
  `db` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `rds` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`name`);

CREATE TABLE `Replays` (
  `replay` varchar(255) NOT NULL DEFAULT '',
  `capture` varchar(255) NOT NULL DEFAULT '',
  `db` varchar(255) DEFAULT NULL,
  `mode` varchar(16) DEFAULT NULL,
  `rds` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`replay`,`capture`);
