package com.king.backend.search.service;

import com.king.backend.search.dto.response.RankingDto;
import com.king.backend.search.entity.SearchRanking;
import com.king.backend.search.repository.SearchRankingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class RankingService {
    private final RedisTemplate<String, String> redisTemplate;
    private final SearchRankingRepository searchRankingRepository;

    // Redis에서 실시간 랭킹을 저장할 key
    private static final String REALTIME_RANKING_KEY = "search:ranking:realtime";

    // 일별, 주간 key는 날짜/주 번호를 포함하여 구분합니다.
    private String getDailyRankingKey() {
        return "search:ranking:daily:" + LocalDate.now().format(DateTimeFormatter.ISO_DATE);
    }

    private String getWeeklyRankingKey() {
        // 예: "2025-W05" 형식
        LocalDate now = LocalDate.now();
        int week = now.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = now.getYear();
        return "search:ranking:weekly:" + year + "-W" + week;
    }

    /**
     * 사용자가 검색할 때마다 해당 검색어의 점수를 1 증가시킵니다.
     * 실시간, 일별, 주간 세 키 모두 업데이트하며,
     * 일별/주간 키는 TTL을 설정하여 일정 시간이 지나면 자동 리셋되도록 합니다.
     *
     * @param keyword 검색어
     */
    public void incrementKeywordCount(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return;
        keyword = keyword.trim();

        // 실시간 랭킹 업데이트
        redisTemplate.opsForZSet().incrementScore(REALTIME_RANKING_KEY, keyword, 1);
        // 일별 랭킹 업데이트
        String dailyKey = getDailyRankingKey();
        redisTemplate.opsForZSet().incrementScore(dailyKey, keyword, 1);
        // 주간 랭킹 업데이트
        String weeklyKey = getWeeklyRankingKey();
        redisTemplate.opsForZSet().incrementScore(weeklyKey, keyword, 1);

        // TTL 설정: 예) 일별 키는 2일, 주간 키는 8일 후 만료 (상황에 맞게 조정)
        redisTemplate.expire(dailyKey, java.time.Duration.ofDays(2));
        redisTemplate.expire(weeklyKey, java.time.Duration.ofDays(8));
    }

    /**
     * 지정한 기간(period)의 랭킹 데이터를 Redis에서 조회합니다.
     * @param period "realtime", "daily", "weekly"
     * @return 상위 10건의 랭킹 목록
     */
    public List<RankingDto> getRanking(String period) {
        String key;
        switch (period.toLowerCase()) {
            case "daily":
                key = getDailyRankingKey();
                break;
            case "weekly":
                key = getWeeklyRankingKey();
                break;
            case "realtime":
            default:
                key = REALTIME_RANKING_KEY;
                break;
        }

        // Redis에서 내림차순(점수가 높은 순)으로 상위 10개 조회
        Set<ZSetOperations.TypedTuple<String>> rankingSet =
                redisTemplate.opsForZSet().reverseRangeWithScores(key, 0, 7);
        List<RankingDto> rankingList = new ArrayList<>();
        if (rankingSet != null) {
            int rank = 1;
            for (ZSetOperations.TypedTuple<String> tuple : rankingSet) {
                String keyword = tuple.getValue();
                rankingList.add(new RankingDto(keyword, rank));
                rank++;
            }
        }
        return rankingList;
    }

    /**
     * 매일 자정에 Redis의 일별 랭킹 데이터를 MySQL에 저장합니다.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void persistDailyRanking() {
        String dailyKey = getDailyRankingKey();
        Set<ZSetOperations.TypedTuple<String>> rankingSet =
                redisTemplate.opsForZSet().reverseRangeWithScores(dailyKey, 0, -1);
        if (rankingSet != null) {
            int rank = 1;
            LocalDateTime now = LocalDateTime.now();
            List<SearchRanking> rankings = new ArrayList<>();
            for (ZSetOperations.TypedTuple<String> tuple : rankingSet) {
                String keyword = tuple.getValue();
                int count = tuple.getScore() != null ? tuple.getScore().intValue() : 0;
                SearchRanking ranking = SearchRanking.builder()
                        .keyword(keyword)
                        .period("daily")
                        .rank(rank)
                        .searchCount(count)
                        .date(now)
                        .build();
                rankings.add(ranking);
                rank++;
            }
            searchRankingRepository.saveAll(rankings);
            log.info("일별 검색어 랭킹 MySQL 저장 완료: {}건", rankings.size());
        }
    }

    /**
     * 매주 월요일 00:10분에 Redis의 주간 랭킹 데이터를 MySQL에 저장합니다.
     */
    @Scheduled(cron = "0 10 0 * * MON")
    public void persistWeeklyRanking() {
        String weeklyKey = getWeeklyRankingKey();
        Set<ZSetOperations.TypedTuple<String>> rankingSet =
                redisTemplate.opsForZSet().reverseRangeWithScores(weeklyKey, 0, -1);
        if (rankingSet != null) {
            int rank = 1;
            LocalDateTime now = LocalDateTime.now();
            List<SearchRanking> rankings = new ArrayList<>();
            for (ZSetOperations.TypedTuple<String> tuple : rankingSet) {
                String keyword = tuple.getValue();
                int count = tuple.getScore() != null ? tuple.getScore().intValue() : 0;
                SearchRanking ranking = SearchRanking.builder()
                        .keyword(keyword)
                        .period("weekly")
                        .rank(rank)
                        .searchCount(count)
                        .date(now)
                        .build();
                rankings.add(ranking);
                rank++;
            }
            searchRankingRepository.saveAll(rankings);
            log.info("주간 검색어 랭킹 MySQL 저장 완료: {}건", rankings.size());
        }
    }
}
