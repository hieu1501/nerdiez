CREATE TABLE `nerdy`.`user_roles` (
  `role_id` integer PRIMARY KEY,
  `role_code` varchar(50) UNIQUE NOT NULL,
  `role_name` varchar(255)
);

CREATE TABLE `nerdy`.`users` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(50) UNIQUE NOT NULL,
  `password_hash` varchar(255) NULL,
  `is_active` bool NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `email` varchar(255) NULL UNIQUE,
  `subject` varchar(255) NULL UNIQUE,
  `role_id` integer
);

CREATE TABLE `nerdy`.`categories` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `slug_name` varchar(255) UNIQUE NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(512) NULL
);

CREATE TABLE `nerdy`.`posts` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) UNIQUE NOT NULL,
  `content` text,
  `author_id` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category_id` bigint,
  `is_active` bool DEFAULT true
);

CREATE TABLE `nerdy`.`posts_metadata` (
  `post_id` bigint PRIMARY KEY,
  `description` varchar(255),
  `featured_image` varchar(255)
);

CREATE TABLE `nerdy`.`posts_vote` (
  `post_id` bigint,
  `user_id` bigint,
  `vote` tinyint DEFAULT 0,
  `is_active` bool DEFAULT false,
  PRIMARY KEY (`post_id`, `user_id`)
);

CREATE TABLE `nerdy`.`topics` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `slug_name` varchar(255) UNIQUE NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(512) NULL,
  `category_id` bigint
);

CREATE TABLE `nerdy`.`posts_topics` (
  `post_id` bigint,
  `topic_id` bigint,
  PRIMARY KEY (`post_id`, `topic_id`)
);

CREATE TABLE `nerdy`.`images` (
  `path` varchar(45) PRIMARY KEY NOT NULL,
  `post_id` bigint,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `nerdy`.`refresh_tokens` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token_hash` char(64) UNIQUE NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` timestamp
);

ALTER TABLE `nerdy`.`users` ADD FOREIGN KEY (`role_id`) REFERENCES `nerdy`.`user_roles` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts` ADD FOREIGN KEY (`author_id`) REFERENCES `nerdy`.`users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts` ADD FOREIGN KEY (`category_id`) REFERENCES `nerdy`.`categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts_metadata` ADD FOREIGN KEY (`post_id`) REFERENCES `nerdy`.`posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts_vote` ADD FOREIGN KEY (`user_id`) REFERENCES `nerdy`.`users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts_vote` ADD FOREIGN KEY (`post_id`) REFERENCES `nerdy`.`posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts_topics` ADD FOREIGN KEY (`post_id`) REFERENCES `nerdy`.`posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts_topics` ADD FOREIGN KEY (`topic_id`) REFERENCES `nerdy`.`topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`images` ADD FOREIGN KEY (`post_id`) REFERENCES `nerdy`.`posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`refresh_tokens` ADD FOREIGN KEY (`user_id`) REFERENCES `nerdy`.`users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`topics` ADD FOREIGN KEY (`category_id`) REFERENCES `nerdy`.`categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;