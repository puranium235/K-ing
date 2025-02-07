package com.king.backend.search.service;

import com.king.backend.search.dto.response.RankingDto;
import com.king.backend.search.entity.SearchRanking;
import com.king.backend.search.repository.SearchRankingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class RankingService {
    private final RedisTemplate<String, String> redisTemplate;
    private final SearchRankingRepository searchRankingRepository;

    private final Map<String, AtomicInteger> keywordBatchCache = new ConcurrentHashMap<>();

    private static final String REALTIME_RANKING_KEY = "search:ranking:realtime";

    public RankingService(RedisTemplate<String, String> redisTemplate,
                          SearchRankingRepository searchRankingRepository) {
        this.redisTemplate = redisTemplate;
        this.searchRankingRepository = searchRankingRepository;
    }

    private String getDailyRankingKey() {
        return "search:ranking:daily:" + LocalDate.now().format(DateTimeFormatter.ISO_DATE);
    }

    private String getWeeklyRankingKey() {
        LocalDate now = LocalDate.now();
        int week = now.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = now.getYear();
        return "search:ranking:weekly:" + year + "-W" + week;
    }

    /**
     * 사용자가 검색할 때마다 해당 검색어의 증가분을 메모리 캐시에 누적합니다.
     *
     * @param keyword 검색어
     */
    public void incrementKeywordCount(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return;
        keyword = keyword.trim();

        // 메모리 캐시에 누적 (스레드 안전한 방식)
        keywordBatchCache.computeIfAbsent(keyword, k -> new AtomicInteger(0))
                .incrementAndGet();
    }

    /**
     * 메모리에 누적된 업데이트를 일정 주기마다 Redis에 파이프라인으로 반영합니다.
     * (배치 업데이트 + 파이프라인 적용)
     */
    @Scheduled(fixedRate = 60000)
    @Async("rankingTaskExecutor")
    public void flushBatchUpdates() {
        if (keywordBatchCache.isEmpty()) return;

        // 현재 캐시 복사 후 초기화
        Map<String, AtomicInteger> batchCopy = new ConcurrentHashMap<>(keywordBatchCache);
        keywordBatchCache.clear();

        String realtimeKey = REALTIME_RANKING_KEY;
        String dailyKey = getDailyRankingKey();
        String weeklyKey = getWeeklyRankingKey();

        // 파이프라인으로 일괄 업데이트
        redisTemplate.executePipelined(new SessionCallback<Object>() {
            @Override
            public Object execute(RedisOperations operations) throws DataAccessException {
                batchCopy.forEach((keyword, count) -> {
                    double increment = count.doubleValue();
                    operations.opsForZSet().incrementScore(realtimeKey, keyword, increment);
                    operations.opsForZSet().incrementScore(dailyKey, keyword, increment);
                    operations.opsForZSet().incrementScore(weeklyKey, keyword, increment);
                });
                operations.expire(dailyKey, Duration.ofDays(2));
                operations.expire(weeklyKey, Duration.ofDays(8));
                return null;
            }
        });
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
    @Async("rankingTaskExecutor")
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
        }
    }
}
