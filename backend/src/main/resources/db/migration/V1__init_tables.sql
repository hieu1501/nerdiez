CREATE TABLE `nerdy`.`user_roles` (
  `role_id` integer PRIMARY KEY,
  `role_code` varchar(50) UNIQUE NOT NULL,
  `role_name` varchar(255)
);

CREATE TABLE `nerdy`.`users` (
  `id` integer PRIMARY KEY,
  `username` varchar(50) UNIQUE NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` bool NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `role_id` integer
);

CREATE TABLE `nerdy`.`categories` (
  `id` integer PRIMARY KEY,
  `slug_name` varchar(255) UNIQUE NOT NULL,
  `name` varchar(255) NOT NULL
);

CREATE TABLE `nerdy`.`posts` (
  `id` integer PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) UNIQUE NOT NULL,
  `content` text,
  `author_id` integer NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category_id` varchar(255),
  `is_active` bool DEFAULT true
);

CREATE TABLE `nerdy`.`posts_metadata` (
  `post_id` integer PRIMARY KEY,
  `description` varchar(255),
  `featured_image` varchar(255)
);

CREATE TABLE `nerdy`.`posts_vote` (
  `post_id` integer,
  `user_id` integer,
  `vote` tinyint DEFAULT 0,
  `is_active` bool DEFAULT false,
  PRIMARY KEY (`post_id`, `user_id`)
);

CREATE TABLE `nerdy`.`topics` (
  `id` integer PRIMARY KEY,
  `slug_name` varchar(255) UNIQUE NOT NULL,
  `name` varchar(255) NOT NULL
);

CREATE TABLE `nerdy`.`posts_topics` (
  `post_id` integer,
  `topic_id` varchar(255),
  PRIMARY KEY (`post_id`, `topic_id`)
);

ALTER TABLE `nerdy`.`users` ADD FOREIGN KEY (`role_id`) REFERENCES `nerdy`.`user_roles` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts` ADD FOREIGN KEY (`author_id`) REFERENCES `nerdy`.`users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts` ADD FOREIGN KEY (`category_id`) REFERENCES `nerdy`.`categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts_metadata` ADD FOREIGN KEY (`post_id`) REFERENCES `nerdy`.`posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts_vote` ADD FOREIGN KEY (`user_id`) REFERENCES `nerdy`.`users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts_vote` ADD FOREIGN KEY (`post_id`) REFERENCES `nerdy`.`posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts_topics` ADD FOREIGN KEY (`post_id`) REFERENCES `nerdy`.`posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nerdy`.`posts_topics` ADD FOREIGN KEY (`topic_id`) REFERENCES `nerdy`.`topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
