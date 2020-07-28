CREATE TABLE IF NOT EXISTS `user` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(255) DEFAULT NULL,
    `sex` tinyint(1) DEFAULT NULL,
    `avatar_url` varchar(255) DEFAULT NULL,
    `create_time` int(13) DEFAULT NULL,
    `modify_time` int(13) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8