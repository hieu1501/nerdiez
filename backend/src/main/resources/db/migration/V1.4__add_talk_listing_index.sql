CREATE INDEX idx_talks_topic_active_created_id
ON `nerdiez`.`talks` (topic_id, is_active, created_at DESC, id DESC);
