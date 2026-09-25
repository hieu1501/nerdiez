CREATE TABLE `nerdiez`.`user_roles` (
  `role_id` integer PRIMARY KEY,
  `role_code` varchar(50) UNIQUE NOT NULL,
  `role_name` varchar(255)
);

CREATE TABLE `nerdiez`.`users` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(50) UNIQUE NOT NULL,
  `password_hash` varchar(255) NULL,
  `is_active` bool NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `email` varchar(255) NULL UNIQUE,
  `subject` varchar(255) NULL UNIQUE,
  `avatar_url` varchar(1024) NULL,
  `role_id` integer NOT NULL
);

CREATE TABLE `nerdiez`.`categories` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `slug_name` varchar(255) UNIQUE NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(512) NULL,
  `is_active` bool DEFAULT FALSE
);

CREATE TABLE `nerdiez`.`posts` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `public_uri` varchar(300) UNIQUE NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` text,
  `description` varchar(255),
  `featured_image` varchar(255),
  `author_id` bigint NOT NULL,
  `category_id` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` bool DEFAULT FALSE
);

CREATE TABLE `nerdiez`.`posts_metadata` (
  `post_id` bigint PRIMARY KEY,
  `upvote_count` bigint NOT NULL DEFAULT 0,
  `downvote_count` bigint NOT NULL DEFAULT 0,
  `vote_version` bigint NOT NULL DEFAULT 1,
  CONSTRAINT post_check_upvote_non_negative CHECK (upvote_count >= 0),
  CONSTRAINT post_check_downvote_non_negative CHECK (downvote_count >= 0)
);

CREATE TABLE `nerdiez`.`posts_vote` (
  `post_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `vote` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`post_id`, `user_id`),
  CONSTRAINT post_check_vote_number CHECK (vote IN (-1, 0, 1))
);

CREATE TABLE `nerdiez`.`talks` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `public_uri` varchar(300) UNIQUE NOT NULL,
  `content` text,
  `author_id` bigint NOT NULL,
  `topic_id` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` bool DEFAULT FALSE,
  CONSTRAINT talk_content_length_check CHECK (CHAR_LENGTH(content) <= 10000)
);

CREATE TABLE `nerdiez`.`talks_metadata` (
  `talk_id` bigint PRIMARY KEY,
  `upvote_count` bigint NOT NULL DEFAULT 0,
  `downvote_count` bigint NOT NULL DEFAULT 0,
  `vote_version` bigint NOT NULL DEFAULT 1,
  CONSTRAINT talk_check_upvote_non_negative CHECK (upvote_count >= 0),
  CONSTRAINT talk_check_downvote_non_negative CHECK (downvote_count >= 0)
);

CREATE TABLE `nerdiez`.`talks_vote` (
  `talk_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `vote` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`talk_id`, `user_id`),
  CONSTRAINT talk_check_vote_number CHECK (vote IN (-1, 0, 1))
);

CREATE TABLE `nerdiez`.`tags` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `slug` varchar(255) UNIQUE NOT NULL,
  `is_active` bool NOT NULL DEFAULT FALSE
);

CREATE TABLE `nerdiez`.`topics` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `public_uri` varchar(300) UNIQUE NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `author_id` bigint NOT NULL,
  `category_id` bigint NOT NULL,
  `description` varchar(2000) NOT NULL,
  `is_active` bool DEFAULT FALSE
);

CREATE TABLE `nerdiez`.`posts_tags` (
  `post_id` bigint,
  `tag_id` bigint,
  PRIMARY KEY (`post_id`, `tag_id`)
);

CREATE TABLE `nerdiez`.`topics_tags` (
  `topic_id` bigint,
  `tag_id` bigint,
  PRIMARY KEY (`topic_id`, `tag_id`)
);

CREATE TABLE `nerdiez`.`comments` (
 `id` bigint PRIMARY KEY AUTO_INCREMENT,
 `name` varchar(1000) NOT NULL,
 `author_id` bigint NOT NULL,
 `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `is_active` bool DEFAULT TRUE,
 `post_id` bigint NOT NULL
);

CREATE TABLE `nerdiez`.`images` (
  `path` varchar(45) PRIMARY KEY NOT NULL,
  `use_count` bigint NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT image_use_count_check_non_negative CHECK (use_count >= 0)
);

CREATE TABLE `nerdiez`.`refresh_tokens` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token_hash` char(64) UNIQUE NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` timestamp
);

ALTER TABLE `nerdiez`.`users` ADD FOREIGN KEY (`role_id`) REFERENCES `nerdiez`.`user_roles` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`posts` ADD FOREIGN KEY (`author_id`) REFERENCES `nerdiez`.`users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`posts` ADD FOREIGN KEY (`category_id`) REFERENCES `nerdiez`.`categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`posts_metadata` ADD FOREIGN KEY (`post_id`) REFERENCES `nerdiez`.`posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`posts_vote` ADD FOREIGN KEY (`user_id`) REFERENCES `nerdiez`.`users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`posts_vote` ADD FOREIGN KEY (`post_id`) REFERENCES `nerdiez`.`posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`posts_tags` ADD FOREIGN KEY (`post_id`) REFERENCES `nerdiez`.`posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`posts_tags` ADD FOREIGN KEY (`tag_id`) REFERENCES `nerdiez`.`tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`talks` ADD FOREIGN KEY (`topic_id`) REFERENCES `nerdiez`.`topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`talks` ADD FOREIGN KEY (`author_id`) REFERENCES `nerdiez`.`users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`talks_metadata` ADD FOREIGN KEY (`talk_id`) REFERENCES `nerdiez`.`talks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`talks_vote` ADD FOREIGN KEY (`user_id`) REFERENCES `nerdiez`.`users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`talks_vote` ADD FOREIGN KEY (`talk_id`) REFERENCES `nerdiez`.`talks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`topics` ADD FOREIGN KEY (`category_id`) REFERENCES `nerdiez`.`categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`topics` ADD FOREIGN KEY (`author_id`) REFERENCES `nerdiez`.`users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`topics_tags` ADD FOREIGN KEY (`topic_id`) REFERENCES `nerdiez`.`topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`topics_tags` ADD FOREIGN KEY (`tag_id`) REFERENCES `nerdiez`.`tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`comments` ADD FOREIGN KEY (`author_id`) REFERENCES `nerdiez`.`users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`comments` ADD FOREIGN KEY (`post_id`) REFERENCES `nerdiez`.`posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdiez`.`refresh_tokens` ADD FOREIGN KEY (`user_id`) REFERENCES `nerdiez`.`users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

