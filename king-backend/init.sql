DROP DATABASE IF EXISTS king;
CREATE DATABASE king;

USE king;

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
                        `content_alarm_on` BOOLEAN DEFAULT TRUE,
                        `language` VARCHAR(10) NULL, -- en, ja, zh, ko 등
                        `status` VARCHAR(50) NOT NULL, -- pending, registered, deleted
                        CHECK (`google_id` IS NOT NULL OR `line_id` IS NOT NULL),
                        CHECK (`status` = 'pending' OR `nickname` IS NOT NULL)
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
                        `birth_place` VARCHAR(200),
                        `participating_work` INT UNSIGNED,
                        `created_at` DATETIME DEFAULT NOW(),
                        `tmdb_id` INT UNSIGNED NOT NULL
);

-- 9.
CREATE TABLE `cast_ko` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `name` VARCHAR(100) NOT NULL,
                           `cast_id` INT UNSIGNED NOT NULL,
                           FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 10.
CREATE TABLE `cast_en` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `name` VARCHAR(100) NOT NULL,
                           `cast_id` INT UNSIGNED NOT NULL,
                           FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 11.
CREATE TABLE `cast_ja` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `name` VARCHAR(100) NOT NULL,
                           `cast_id` INT UNSIGNED NOT NULL,
                           FOREIGN KEY (`cast_id`) REFERENCES `cast`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 12.
CREATE TABLE `cast_zh` (
                           `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                           `name` VARCHAR(100) NOT NULL,
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

-- 더미데이터
-- 1. user 테이블
INSERT INTO `user` (`email`, `nickname`, `image_url`, `google_id`, `line_id`, `created_at`, `description`, `content_alarm_on`, `language`, `status`)
VALUES
    ('user1@example.com', 'user1', 'http://example.com/user1.jpg', 'google1', NULL, NOW(), 'Travel enthusiast.', TRUE, 'en', 'registered1'),
    ('user2@example.com', 'user2', 'http://example.com/user2.jpg', NULL, 'line1', NOW(), 'Loves movies and coffee.', FALSE, 'ko', 'registered'),
    ('user3@example.com', 'user3', 'http://example.com/user3.jpg', 'google3', NULL, NOW(), 'Passionate about art.', TRUE, 'zh', 'registered'),
    ('user4@example.com', 'user4', 'http://example.com/user4.jpg', NULL, 'line2', NOW(), 'Tech geek and foodie.', FALSE, 'ja', TRUE),
    ('user5@example.com', 'user5', 'http://example.com/user5.jpg', 'google5', NULL, NOW(), 'History buff.', TRUE, 'en', FALSE);

-- 2. place 테이블
INSERT INTO `place` (`name`, `type`, `description`, `open_hour`, `break_time`, `closed_day`, `address`, `lat`, `lng`, `phone`, `image_url`, `view`)
VALUES
    ('커피파머', 'cafe', '커피파머입니다.', '09:00 - 21:00', '정보없음', '연중무휴', '경기도 고양시 일산서구 대화로 61', 37.667523, 126.72817, '031-1899-8903', 'http://example.com/cafefarmer.jpg', 450),
    ('셀렉토커피 남양주호평점', 'cafe', '셀렉토커피 남양주호평점입니다.', '08:00 - 22:00', '정보없음', '연중무휴', '경기도 남양주시 천마산로 21', 37.663558, 127.24748, '031-511-6362', 'http://example.com/selectcoffee.jpg', 300),
    ('연희네 슈퍼', 'playground', '연희네 슈퍼입니다.', '00:00 - 24:00', '정보없음', '연중무휴', '전라남도 목포시 해안로127번길 14-2', 34.78168, 126.377325, '061-270-8432', 'http://example.com/vintageshop.jpg', 200),
    ('청남대', 'playground', '청남대입니다.', '09:00 - 18:00', '정보없음', '월요일', '충청북도 청주시 상당구 문의면 청남대길 646', 36.46255, 127.4906, '043-257-5080', 'http://example.com/cheongnamdae.jpg', 500);

-- 3. content 테이블
INSERT INTO `content` (`type`, `broadcast`, `created_at`, `image_url`, `tmdb_id`)
VALUES
    ('DRAMA', 'KBS', NOW(), 'http://example.com/drama.jpg', 101),
    ('MOVIE', 'CJ Entertainment', NOW(), 'http://example.com/movie.jpg', 102),
    ('SHOW', 'SBS', NOW(), 'http://example.com/show.jpg', 103);

-- 4. content_ko 테이블
INSERT INTO `content_ko` (`title`, `description`, `content_id`)
VALUES
    ('(아는 건 별로 없지만) 가족입니다', '가족의 관계를 다시 조명하는 감동적인 드라마.', 1),
    ('1987', '역사적 사건을 바탕으로 한 강렬한 영화.', 2),
    ('1박2일', '한국의 아름다움을 보여주는 예능 프로그램.', 3);

-- 5. content_en 테이블
INSERT INTO `content_en` (`title`, `description`, `content_id`)
VALUES
    ('(My Unfamiliar Family)', 'A touching drama about family relationships.', 1),
    ('1987', 'A powerful film based on historical events.', 2),
    ('2 Days 1 Night', 'A show highlighting Koreas beauty.', 3);

-- 8. cast 테이블
INSERT INTO `cast` (`image_url`, `birth_date`, `birth_place`, `participating_work`, `created_at`, `tmdb_id`)
VALUES
    ('http://example.com/hanyeri.jpg', '1990-01-01', 'Seoul, South Korea', 5, NOW(), 201),
    ('http://example.com/kimtaeho.jpg', '1985-05-12', 'Busan, South Korea', 3, NOW(), 202),
    ('http://example.com/joinseong.jpg', '1981-07-28', 'Seoul, South Korea', 10, NOW(), 203);

-- 9. cast_ko 테이블
INSERT INTO `cast_ko` (`name`, `cast_id`)
VALUES
    ('한예리', 1),
    ('김태호', 2),
    ('조인성', 3);

-- 13. place_content 테이블
INSERT INTO `place_content` (`place_id`, `content_id`, `description`)
VALUES
    (1, 1, '6회에서 김은희(한예리)와 안효석(이종원)이 윤태형(김태호)의 은신처에서 서울로 돌아갈 때 이 카페에 들린다.'),
    (2, 1, '10회에서 하라(배윤경)는 은희(한예리)에게 이 커피숍에서 만나자고 메시지를 보낸다. 그녀는 은희에게 곧 미국으로 돌아간다고 알리고 건주(신동욱)에 대한 이야기를 이어간다.'),
    (3, 2, '영화 1987에서 연희네 슈퍼로 나온 가게.'),
    (4, 3, '청남대는 1박2일에서 촬영한 아름다운 장소이다.');

-- 14. content_cast 테이블
INSERT INTO `content_cast` (`content_id`, `cast_id`)
VALUES
    (1, 1),
    (1, 2),
    (3, 3);

-- 15. place_cast 테이블
INSERT INTO `place_cast` (`place_id`, `cast_id`, `description`)
VALUES
    (1, 1, '한예리가 이 카페를 촬영 장소로 방문했습니다.'),
    (2, 2, '김태호가 이곳에서 인상적인 장면을 연출했습니다.'),
    (4, 3, '조인성이 청남대의 아름다운 풍경을 즐겼습니다.');

-- 16. post 테이블
INSERT INTO `post` (`content`, `created_at`, `updated_at`, `user_id`, `place_id`)
VALUES
    ('아름다운 분위기와 훌륭한 커피!', NOW(), NOW(), 1, 1),
    ('휴식과 작업하기에 완벽한 장소.', NOW(), NOW(), 2, 2),
    ('추억을 떠올리게 하는 장소.', NOW(), NOW(), 1, 3);

-- 17. post_image 테이블
INSERT INTO `post_image` (`image_url`, `post_id`)
VALUES
    ('http://example.com/post1.jpg', 1),
    ('http://example.com/post2.jpg', 2),
    ('http://example.com/post3.jpg', 3);

-- 18. comment 테이블
INSERT INTO `comment` (`content`, `created_at`, `post_id`, `user_id`)
VALUES
    ('저도 이곳을 방문해보고 싶어요!', NOW(), 1, 2),
    ('정말 멋져 보이네요!', NOW(), 2, 1),
    ('이곳은 많은 추억을 떠올리게 하네요!', NOW(), 3, 1);

-- 19. like 테이블
INSERT INTO `like` (`post_id`, `user_id`, `created_at`)
VALUES
    (1, 2, NOW()),
    (2, 1, NOW()),
    (3, 2, NOW());

-- 20. curation_list 테이블
INSERT INTO `curation_list` (`user_id`, `title`, `is_public`, `created_at`, `updated_at`, `description`, `image_url`)
VALUES
    (1, '좋아하는 카페', TRUE, NOW(), NOW(), '내가 좋아하는 카페 목록입니다.', 'http://example.com/favoritecafes.jpg'),
    (2, '꼭 가봐야 할 장소', TRUE, NOW(), NOW(), '꼭 가봐야 할 장소를 정리한 목록입니다.', 'http://example.com/mustvisit.jpg');

-- 21. curation_list_item 테이블
INSERT INTO `curation_list_item` (`curation_list_id`, `place_id`)
VALUES
    (1, 1),
    (1, 2),
    (2, 3);

-- 22. curation_list_bookmark 테이블
INSERT INTO `curation_list_bookmark` (`user_id`, `curation_list_id`, `created_at`)
VALUES
    (2, 1, NOW()),
    (1, 2, NOW());

-- 23. content_favorite 테이블
INSERT INTO `content_favorite` (`user_id`, `content_id`, `created_at`)
VALUES
    (1, 1, NOW()),
    (2, 2, NOW()),
    (1, 3, NOW());

-- 24. cast_favorite 테이블
INSERT INTO `cast_favorite` (`user_id`, `cast_id`, `created_at`)
VALUES
    (1, 1, NOW()),
    (2, 2, NOW()),
    (1, 3, NOW());

-- 25. notification 테이블
INSERT INTO `notification` (`user_id`, `type`, `message`, `is_read`, `created_at`, `target_type`, `target_id`)
VALUES
    (1, 'INFO', '귀하의 큐레이션 리스트가 업데이트되었습니다.', FALSE, NOW(), 'curation_list', 1),
    (2, 'ALERT', '새로운 장소가 즐겨찾기 리스트에 추가되었습니다.', FALSE, NOW(), 'place', 2);

-- 26. search_ranking 테이블
INSERT INTO `search_ranking` (`keyword`, `period`, `rank`, `search_count`, `date`)
VALUES
    ('서울의 카페', '2025-01', 1, 500, NOW()),
    ('최고의 놀이터', '2025-01', 2, 300, NOW()),
    ('인기 있는 한국 드라마', '2025-01', 3, 250, NOW());