DELIMITER $$

## TRIGGERS FOR POSTS' VOTES UPDATE
DROP PROCEDURE IF EXISTS apply_post_vote_count_delta $$
CREATE PROCEDURE apply_post_vote_count_delta(
    IN p_post_id BIGINT,
    IN p_up_delta BIGINT,
    IN p_down_delta BIGINT
)
BEGIN
    IF p_up_delta <> 0 OR p_down_delta <> 0 THEN
        UPDATE `nerdy`.`posts_metadata`
        SET upvote_count   = upvote_count + p_up_delta,
            downvote_count = downvote_count + p_down_delta,
            vote_version = vote_version + 1
        WHERE post_id = p_post_id;
    END IF;
END $$

DROP FUNCTION IF EXISTS vote_up_delta $$
CREATE FUNCTION vote_up_delta(p_vote TINYINT)
RETURNS BIGINT
DETERMINISTIC
BEGIN
    IF p_vote = 1 THEN
        RETURN 1;
    END IF;
    RETURN 0;
END $$

DROP FUNCTION IF EXISTS vote_down_delta $$
CREATE FUNCTION vote_down_delta(p_vote TINYINT)
RETURNS BIGINT
DETERMINISTIC
BEGIN
    IF p_vote = -1 THEN
        RETURN 1;
    END IF;
    RETURN 0;
END $$

DROP TRIGGER IF EXISTS after_posts_vote_insert $$
CREATE TRIGGER after_posts_vote_insert
AFTER INSERT ON `nerdy`.`posts_vote`
FOR EACH ROW
BEGIN
    CALL apply_post_vote_count_delta(
        NEW.post_id,
        vote_up_delta(NEW.vote),
        vote_down_delta(NEW.vote)
    );
END $$

DROP TRIGGER IF EXISTS after_posts_vote_update $$
CREATE TRIGGER after_posts_vote_update
AFTER UPDATE ON `nerdy`.`posts_vote`
FOR EACH ROW
BEGIN
    -- Remove OLD contribution, add NEW contribution
    CALL apply_post_vote_count_delta(
        NEW.post_id,
        vote_up_delta(NEW.vote) - vote_up_delta(OLD.vote),
        vote_down_delta(NEW.vote) - vote_down_delta(OLD.vote)
    );
END $$

DROP TRIGGER IF EXISTS after_posts_vote_delete $$
CREATE TRIGGER after_posts_vote_delete
AFTER DELETE ON `nerdy`.`posts_vote`
FOR EACH ROW
BEGIN
    -- Subtract what the deleted row was contributing
    CALL apply_post_vote_count_delta(
        OLD.post_id,
        -vote_up_delta(OLD.vote),
        -vote_down_delta(OLD.vote)
    );
END $$

DELIMITER ;

