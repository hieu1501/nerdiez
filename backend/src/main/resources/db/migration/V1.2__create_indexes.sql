CREATE INDEX idx_posts_active_created_id
ON `nerdiez`.`posts` (is_active, created_at DESC, id DESC);

CREATE INDEX idx_posts_updated_id
ON `nerdiez`.`posts` (updated_at DESC, id DESC);

CREATE INDEX idx_talks_active_created_id
ON `nerdiez`.`talks` (is_active, created_at DESC, id DESC);

CREATE INDEX idx_talks_updated_id
ON `nerdiez`.`talks` (updated_at DESC, id DESC);