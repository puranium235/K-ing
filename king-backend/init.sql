DROP DATABASE IF EXISTS king;
CREATE DATABASE king;

USE king;

CREATE TABLE chat_history (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          user_id BIGINT NOT NULL,
                          role VARCHAR(255) NOT NULL,
                          content TEXT NOT NULL,
                          type VARCHAR(255),
                          created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          created DATETIME DEFAULT NOW(),
                          content VARCHAR(255) NOT NULL
);
-- 1. user 테이블
CREATE TABLE `user` (
                        `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        `email` VARCHAR(255) NOT NULL,
                        `nickname` VARCHAR(255) UNIQUE,
                        `image_url` VARCHAR(500) NOT NULL,
                        `google_id` VARCHAR(255),
                        `line_id` VARCHAR(255),
                        `created_at` DATETIME DEFAULT NOW(),
                        `description` TEXT NULL,
                        `content_alarm_on` BOOLEAN NULL,
                        `language` VARCHAR(10) NULL, -- en, ja, zh, ko 등
                        `status` VARCHAR(50) NOT NULL, -- ROLE_PENDING, ROLE_REGISTERED, ROLE_DELETED
                        CHECK (`google_id` IS NOT NULL OR `line_id` IS NOT NULL),
                        CHECK (`status` = 'ROLE_PENDING' OR `nickname` IS NOT NULL)
);

-- 2. place 테이블
CREATE TABLE `place` (
                         `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                         `name` VARCHAR(255) NOT NULL,
                         `type` VARCHAR(50) NOT NULL, -- cafe, playground, restaurant, shop, station, stay, store
                         `description` VARCHAR(255) NOT NULL,
                         `open_hour` VARCHAR(255),
                         `break_time` VARCHAR(255),
                         `closed_day` VARCHAR(255),
                         `address` VARCHAR(50),
                         `lat` FLOAT NOT NULL,
                         `lng` FLOAT NOT NULL,
                         `phone` VARCHAR(50),
                         `image_url` VARCHAR(500),
                         `created_at` DATETIME DEFAULT NOW(),
                         `view` INT UNSIGNED NOT NULL
);

-- 3. content 테이블
CREATE TABLE `content` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `type` VARCHAR(50) NOT NULL, -- drama, movie, show
                           `broadcast` VARCHAR(255),
                           `created_at` DATETIME DEFAULT NOW(),
                           `image_url` VARCHAR(500),
                           `tmdb_id` INT UNSIGNED NOT NULL
);

-- 4. content 번역 테이블
CREATE TABLE `content_ko` (
                              `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              `title` VARCHAR(255) NOT NULL,
                              `description` TEXT,
                              `content_id` INT UNSIGNED NOT NULL,
                              FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5.
CREATE TABLE `content_en` (
                              `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              `title` VARCHAR(255) NOT NULL,
                              `description` TEXT,
                              `content_id` INT UNSIGNED NOT NULL,
                              FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6.
CREATE TABLE `content_ja` (
                              `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              `title` VARCHAR(255) NOT NULL,
                              `description` TEXT,
                              `content_id` INT UNSIGNED NOT NULL,
                              FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7.
CREATE TABLE `content_zh` (
                              `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              `title` VARCHAR(255) NOT NULL,
                              `description` TEXT,
                              `content_id` INT UNSIGNED NOT NULL,
                              FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 8. cast 테이블
CREATE TABLE `cast` (
                        `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        `image_url` VARCHAR(500),
                        `birth_date` VARCHAR(100),
                        `participating_work` INT UNSIGNED,
                        `created_at` DATETIME DEFAULT NOW(),
                        `tmdb_id` INT UNSIGNED NOT NULL
);

-- 9.
CREATE TABLE `cast_ko` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `name` VARCHAR(100) NOT NULL,
                           `birth_place` VARCHAR(200),
                           `cast_id` INT UNSIGNED NOT NULL,
                           FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 10.
CREATE TABLE `cast_en` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `name` VARCHAR(100) NOT NULL,
                           `birth_place` VARCHAR(200),
                           `cast_id` INT UNSIGNED NOT NULL,
                           FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 11.
CREATE TABLE `cast_ja` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `name` VARCHAR(100) NOT NULL,
                           `birth_place` VARCHAR(200),
                           `cast_id` INT UNSIGNED NOT NULL,
                           FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 12.
CREATE TABLE `cast_zh` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `name` VARCHAR(100) NOT NULL,
                           `birth_place` VARCHAR(200),
                           `cast_id` INT UNSIGNED NOT NULL,
                           FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 13. place_content (장소_콘텐츠 연결)
CREATE TABLE `place_content` (
                                 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                 `place_id` INT UNSIGNED NOT NULL,
                                 `content_id` INT UNSIGNED NOT NULL,
                                 `description` TEXT NOT NULL, -- 장소와 컨텐츠 관련 설며
                                 FOREIGN KEY (`place_id`) REFERENCES `place`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                 FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 14. content_cast (콘텐츠_연예인 연결)
CREATE TABLE `content_cast` (
                                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                `content_id` INT UNSIGNED NOT NULL,
                                `cast_id` INT UNSIGNED NOT NULL,
                                FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 15. place_cast (장소_연예인 연결)
CREATE TABLE `place_cast` (
                              `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              `place_id` INT UNSIGNED NOT NULL,
                              `cast_id` INT UNSIGNED NOT NULL,
                              `description` TEXT NULL, -- 장소와 연예인 관계 설명
                              FOREIGN KEY (`place_id`) REFERENCES `place`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                              FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 16. post 테이블
CREATE TABLE `post` (
                        `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        `content` TEXT,
                        `created_at` DATETIME DEFAULT NOW(),
                        `updated_at` DATETIME DEFAULT NOW(),
                        `user_id` INT UNSIGNED NOT NULL,
                        `place_id` INT UNSIGNED NOT NULL,
                        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                        FOREIGN KEY (`place_id`) REFERENCES `place`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE -- no action
);

-- 17. post_image 테이블
CREATE TABLE `post_image` (
                              `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                              `image_url` VARCHAR(500) NOT NULL,
                              `post_id` INT UNSIGNED NOT NULL,
                              FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 18. comment 테이블
CREATE TABLE `comment` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `content` TEXT NOT NULL,
                           `created_at` DATETIME DEFAULT NOW(),
                           `post_id` INT UNSIGNED NOT NULL,
                           `user_id` INT UNSIGNED NOT NULL,
                           FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                           FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 19. like 테이블
CREATE TABLE `like` (
                        `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        `post_id` INT UNSIGNED NOT NULL,
                        `user_id` INT UNSIGNED NOT NULL,
                        `created_at` DATETIME DEFAULT NOW(),
                        FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 20. curation_list 테이블
CREATE TABLE `curation_list` (
                                 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                 `user_id` INT UNSIGNED NOT NULL,
                                 `title` VARCHAR(255) NOT NULL,
                                 `is_public` BOOLEAN NOT NULL,
                                 `created_at` DATETIME DEFAULT NOW(),
                                 `updated_at` DATETIME DEFAULT NOW(),
                                 `description` TEXT,
                                 `image_url` VARCHAR(500) NOT NULL,
                                 FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 21. curation_list_item (큐레이션 리스트_장소 연결)
CREATE TABLE `curation_list_item` (
                                      `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                      `curation_list_id` INT UNSIGNED NOT NULL,
                                      `place_id` INT UNSIGNED NOT NULL,
                                      FOREIGN KEY (`curation_list_id`) REFERENCES `curation_list`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                      FOREIGN KEY (`place_id`) REFERENCES `place`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 22. curation_list_bookmark 테이블
CREATE TABLE `curation_list_bookmark` (
                                          `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                          `user_id` INT UNSIGNED NOT NULL,
                                          `curation_list_id` INT UNSIGNED NOT NULL,
                                          `created_at` DATETIME DEFAULT NOW(),
                                          FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                          FOREIGN KEY (`curation_list_id`) REFERENCES `curation_list`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 23. content_favorite 테이블 (콘텐츠 즐겨찾기)
CREATE TABLE `content_favorite` (
                                    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                    `user_id` INT UNSIGNED NOT NULL,
                                    `content_id` INT UNSIGNED NOT NULL,
                                    `created_at` DATETIME DEFAULT NOW(),
                                    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                    FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 24. cast_favorite 테이블 (연예인 즐겨찾기)
CREATE TABLE `cast_favorite` (
                                 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                 `user_id` INT UNSIGNED NOT NULL,
                                 `cast_id` INT UNSIGNED NOT NULL,
                                 `created_at` DATETIME DEFAULT NOW(),
                                 FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 25. notification 테이블
CREATE TABLE `notification` (
                                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                `user_id` INT UNSIGNED NOT NULL,
                                `type` VARCHAR(50) NOT NULL,
                                `message` VARCHAR(500) NOT NULL,
                                `is_read` BOOLEAN NOT NULL,
                                `created_at` DATETIME DEFAULT NOW(),
                                `target_type` VARCHAR(50) NOT NULL,
                                `target_id` INT UNSIGNED NOT NULL,
                                FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 26. search_ranking 테이블
CREATE TABLE `search_ranking` (
                                  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                  `keyword` VARCHAR(255) NOT NULL,
                                  `period` VARCHAR(50) NOT NULL,
                                  `rank` INT NOT NULL,
                                  `search_count` INT UNSIGNED NOT NULL,
                                  `date` DATETIME DEFAULT NOW()
);

INSERT INTO `user` (`email`, `nickname`, `image_url`, `google_id`, `line_id`, `created_at`, `description`, `content_alarm_on`, `language`, `status`)
VALUES
    ('user1@example.com', 'user1', 'http://example.com/user1.jpg', 'google1', NULL, NOW(), 'Travel enthusiast.', TRUE, 'en', 'ROLE_REGISTERED'),
    ('user2@example.com', 'user2', 'http://example.com/user2.jpg', 'google2', 'line1', NOW(), 'Loves movies and coffee.', FALSE, 'ko', 'ROLE_REGISTERED');
