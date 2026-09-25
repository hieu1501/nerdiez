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
        UPDATE `nerdiez`.`posts_metadata`
        SET upvote_count   = upvote_count + p_up_delta,
            downvote_count = downvote_count + p_down_delta,
            vote_version = vote_version + 1
        WHERE post_id = p_post_id;
    END IF;
END $$

DROP FUNCTION IF EXISTS vote_up_delta $$
CREATE FUNCTION vote_up_delta(vote TINYINT)
RETURNS BIGINT
DETERMINISTIC
BEGIN
    IF vote = 1 THEN
        RETURN 1;
    END IF;
    RETURN 0;
END $$

DROP FUNCTION IF EXISTS vote_down_delta $$
CREATE FUNCTION vote_down_delta(vote TINYINT)
RETURNS BIGINT
DETERMINISTIC
BEGIN
    IF vote = -1 THEN
        RETURN 1;
    END IF;
    RETURN 0;
END $$

DROP TRIGGER IF EXISTS after_posts_vote_insert $$
CREATE TRIGGER after_posts_vote_insert
AFTER INSERT ON `nerdiez`.`posts_vote`
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
AFTER UPDATE ON `nerdiez`.`posts_vote`
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
AFTER DELETE ON `nerdiez`.`posts_vote`
FOR EACH ROW
BEGIN
    -- Subtract what the deleted row was contributing
    CALL apply_post_vote_count_delta(
        OLD.post_id,
        -vote_up_delta(OLD.vote),
        -vote_down_delta(OLD.vote)
    );
END $$

## TRIGGERS FOR TALKS' VOTES UPDATE
DROP PROCEDURE IF EXISTS apply_talk_vote_count_delta $$
CREATE PROCEDURE apply_talk_vote_count_delta(
    IN t_talk_id BIGINT,
    IN t_up_delta BIGINT,
    IN t_down_delta BIGINT
)
BEGIN
    IF t_up_delta <> 0 OR t_down_delta <> 0 THEN
        UPDATE `nerdiez`.`talks_metadata`
        SET upvote_count   = upvote_count + t_up_delta,
            downvote_count = downvote_count + t_down_delta,
            vote_version = vote_version + 1
        WHERE talk_id = t_talk_id;
    END IF;
END $$

DROP TRIGGER IF EXISTS after_talks_vote_insert $$
CREATE TRIGGER after_talks_vote_insert
    AFTER INSERT ON `nerdiez`.`talks_vote`
    FOR EACH ROW
BEGIN
    CALL apply_talk_vote_count_delta(
            NEW.talk_id,
            vote_up_delta(NEW.vote),
            vote_down_delta(NEW.vote)
         );
END $$

DROP TRIGGER IF EXISTS after_talks_vote_update $$
CREATE TRIGGER after_talks_vote_update
    AFTER UPDATE ON `nerdiez`.`talks_vote`
    FOR EACH ROW
BEGIN
    -- Remove OLD contribution, add NEW contribution
    CALL apply_talk_vote_count_delta(
            NEW.talk_id,
            vote_up_delta(NEW.vote) - vote_up_delta(OLD.vote),
            vote_down_delta(NEW.vote) - vote_down_delta(OLD.vote)
         );
END $$

DROP TRIGGER IF EXISTS after_talks_vote_delete $$
CREATE TRIGGER after_talks_vote_delete
    AFTER DELETE ON `nerdiez`.`talks_vote`
    FOR EACH ROW
BEGIN
    -- Subtract what the deleted row was contributing
    CALL apply_talk_vote_count_delta(
            OLD.talk_id,
            -vote_up_delta(OLD.vote),
            -vote_down_delta(OLD.vote)
         );
END $$

DELIMITER ;

