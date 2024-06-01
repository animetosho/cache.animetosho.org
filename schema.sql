USE arcscrape;

CREATE TABLE `nyaasi_torrents` (
  `id` int(10) unsigned NOT NULL,
  `info_hash` binary(20) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `torrent_name` varchar(511) NOT NULL DEFAULT '',
  `information` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `filesize` bigint(20) unsigned NOT NULL DEFAULT '0',
  `flags` tinyint(4) unsigned NOT NULL DEFAULT '0' COMMENT 'NONE = 0, ANONYMOUS = 1, HIDDEN = 2, TRUSTED = 4, REMAKE = 8, COMPLETE = 16, DELETED = 32, BANNED = 64, COMMENT_LOCKED = 128',
  `uploader_name` varchar(32) CHARACTER SET ascii DEFAULT NULL,
  `created_time` int(10) unsigned NOT NULL,
  `updated_time` int(10) unsigned NOT NULL,
  `main_category_id` tinyint(4) NOT NULL,
  `sub_category_id` tinyint(4) NOT NULL,
  `redirect` int(10) unsigned DEFAULT NULL COMMENT 'No found usage in code',
  `idx_class` tinyint(4) AS (if(flags & 34 > 0, -1, IF(flags&8>0, 0, if(flags&4>0, 2, 1)))) PERSISTENT COMMENT 'We can''t determine if an entry is both trusted and a remake (not shown in HTML), so just merge it',
  /*`idx_search` varchar(512) AS (
	if(flags & 34 > 0, "",
		CONCAT("__index_cat_", main_category_id, " __index_subcat_", sub_category_id, " ", IF(flags&8>0, "", "__index_notremake "), IF(flags&4>0, "", "__index_trusted "), display_name)
	)) PERSISTENT,*/
  PRIMARY KEY (`id`)
  -- ,
  -- KEY `sub_category_index` (`idx_class`,`main_category_id`,`sub_category_id`,`created_time`),
  -- KEY `main_index` (`idx_class`,`created_time`),
  -- KEY `category_index` (`idx_class`,`main_category_id`,`created_time`),
  -- KEY `uploader_index` (`idx_class`,`uploader_name`,`created_time`),
  -- KEY `info_hash` (`info_hash`) USING BTREE,
  -- FULLTEXT KEY `idx_search` (`idx_search`)
) ENGINE=Aria DEFAULT CHARSET=utf8mb4 PAGE_CHECKSUM=1;

CREATE TABLE `nyaasi_torrent_comments` (
  `id` int(10) unsigned NOT NULL,
  `torrent_id` int(10) unsigned NOT NULL,
  `created_time` int(10) unsigned NOT NULL DEFAULT '0',
  `edited_time` int(10) unsigned NOT NULL DEFAULT '0',
  `username` varchar(255) CHARACTER SET ascii NOT NULL,
  `text` text NOT NULL,
  -- deprecated field
  `md5` binary(20) DEFAULT NULL COMMENT 'Actually a user property; MD5 of user''s email',
  PRIMARY KEY (`id`),
  KEY `torrent_id` (`torrent_id`,`created_time`)
) ENGINE=Aria DEFAULT CHARSET=utf8mb4 PAGE_CHECKSUM=1;

CREATE TABLE `nyaasis_torrents` (
  `id` int(10) unsigned NOT NULL,
  `info_hash` binary(20) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `torrent_name` varchar(511) NOT NULL DEFAULT '',
  `information` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `filesize` bigint(20) unsigned NOT NULL DEFAULT '0',
  `flags` tinyint(4) unsigned NOT NULL DEFAULT '0' COMMENT 'NONE = 0, ANONYMOUS = 1, HIDDEN = 2, TRUSTED = 4, REMAKE = 8, COMPLETE = 16, DELETED = 32, BANNED = 64, COMMENT_LOCKED = 128',
  `uploader_name` varchar(32) CHARACTER SET ascii DEFAULT NULL,
  `created_time` int(10) unsigned NOT NULL,
  `updated_time` int(10) unsigned NOT NULL,
  `main_category_id` tinyint(4) NOT NULL,
  `sub_category_id` tinyint(4) NOT NULL,
  `redirect` int(10) unsigned DEFAULT NULL COMMENT 'No found usage in code',
  `idx_class` tinyint(4) AS (if(flags & 34 > 0, -1, IF(flags&8>0, 0, if(flags&4>0, 2, 1)))) PERSISTENT COMMENT 'We can''t determine if an entry is both trusted and a remake (not shown in HTML), so just merge it',
  /*`idx_search` varchar(512) AS (
	if(flags & 34 > 0, "",
		CONCAT("__index_cat_", main_category_id, " __index_subcat_", sub_category_id, " ", IF(flags&8>0, "", "__index_notremake "), IF(flags&4>0, "", "__index_trusted "), display_name)
	)) PERSISTENT,*/
  PRIMARY KEY (`id`)
  -- ,
  -- KEY `sub_category_index` (`idx_class`,`main_category_id`,`sub_category_id`,`created_time`),
  -- KEY `main_index` (`idx_class`,`created_time`),
  -- KEY `category_index` (`idx_class`,`main_category_id`,`created_time`),
  -- KEY `uploader_index` (`idx_class`,`uploader_name`,`created_time`),
  -- KEY `info_hash` (`info_hash`) USING BTREE,
  -- FULLTEXT KEY `idx_search` (`idx_search`)
) ENGINE=Aria DEFAULT CHARSET=utf8mb4 PAGE_CHECKSUM=1;

CREATE TABLE `nyaasis_torrent_comments` (
  `id` int(10) unsigned NOT NULL,
  `torrent_id` int(10) unsigned NOT NULL,
  `created_time` int(10) unsigned NOT NULL DEFAULT '0',
  `edited_time` int(10) unsigned NOT NULL DEFAULT '0',
  `username` varchar(255) CHARACTER SET ascii NOT NULL,
  `text` text NOT NULL,
  `md5` binary(20) DEFAULT NULL COMMENT 'Actually a user property; MD5 of user''s email',
  PRIMARY KEY (`id`),
  KEY `torrent_id` (`torrent_id`,`created_time`)
) ENGINE=Aria DEFAULT CHARSET=utf8mb4 PAGE_CHECKSUM=1;

CREATE TABLE `nyaasi_users` (
  `name` varchar(255) CHARACTER SET ascii NOT NULL,
  `level` tinyint(4) NOT NULL DEFAULT 0 COMMENT '0=REGULAR, 1=TRUSTED, 2=MODERATOR, 3=SUPERADMIN, -1=BANNED',
  --`md5` binary(20) DEFAULT NULL COMMENT 'MD5 of user''s email; not updated, so historical info only',
  `ava_stamp` int(10) unsigned NULL DEFAULT NULL COMMENT 'Interpreted by base64url decoding the slug and interpreting as big-endian 32b integer; appears to be some sort of timestamp',
  `updated_time` int(10) unsigned NOT NULL,
  PRIMARY KEY (`username`),
  KEY `updated_time` (`updated_time`)
) ENGINE=Aria DEFAULT CHARSET=utf8mb4 PAGE_CHECKSUM=1;
