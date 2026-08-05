CREATE INDEX idx_posts_active_created_id
ON `nerdy`.`posts` (is_active, created_at DESC, id DESC)

CREATE INDEX idx_posts_updated_id
ON `nerdy`.`posts` (updated_at DESC, id DESC)