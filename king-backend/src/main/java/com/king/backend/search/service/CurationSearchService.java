package com.king.backend.search.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOptions;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.king.backend.search.dto.request.CurationListSearchRequestDto;
import com.king.backend.search.dto.response.CurationListSearchResponseDto;
import com.king.backend.search.entity.CurationDocument;
import com.king.backend.search.util.CursorUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CurationSearchService {

    private final CursorUtil cursorUtil;
    private static final String INDEX_NAME = "curation-index";
    private final ElasticsearchClient elasticsearchClient;

    /**
     * 큐레이션 리스트 제목 검색 및 전체 조회 (커서 기반 페이지네이션)
     *
     * @param requestDto 검색 요청 DTO (검색어, size, cursor 포함)
     * @return 검색 결과 DTO
     */
    public CurationListSearchResponseDto searchCurationLists(CurationListSearchRequestDto requestDto) {
        try {
            // 검색어가 있으면 title 필드에 match 쿼리, 없으면 match_all 쿼리 사용
            BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
            if (requestDto.getQuery() != null && !requestDto.getQuery().trim().isEmpty()) {
                boolQueryBuilder.must(m -> m.match(match -> match.field("title").query(requestDto.getQuery())));
            } else {
                boolQueryBuilder.must(m -> m.matchAll(ma -> ma));
            }

            // 최신순 정렬: createdAt 내림차순 → id 오름차순 (커서 생성용)
            List<SortOptions> sortOptions = new ArrayList<>();
            sortOptions.add(SortOptions.of(s -> s.field(f -> f.field("createdAt").order(SortOrder.Desc))));
            sortOptions.add(SortOptions.of(s -> s.field(f -> f.field("id").order(SortOrder.Asc))));

            // 검색 요청 구성
            SearchRequest.Builder searchRequestBuilder = new SearchRequest.Builder()
                    .index(INDEX_NAME)
                    .query(q -> q.bool(boolQueryBuilder.build()))
                    .size(10)
                    .sort(sortOptions);

            // 커서(search_after) 값이 존재하면 적용
            if (requestDto.getCursor() != null && !requestDto.getCursor().isEmpty()) {
                List<Object> searchAfterValues = cursorUtil.decodeCursor(requestDto.getCursor());
                List<FieldValue> fieldValues = searchAfterValues.stream().map(o -> {
                    if (o instanceof String) {
                        return FieldValue.of(f -> f.stringValue((String) o));
                    } else if (o instanceof Number) {
                        return FieldValue.of(f -> f.longValue(((Number) o).longValue()));
                    }
                    return FieldValue.of(f -> f.stringValue(o.toString()));
                }).collect(Collectors.toList());
                searchRequestBuilder.searchAfter(fieldValues);
            }

            SearchRequest searchRequest = searchRequestBuilder.build();
            SearchResponse<CurationDocument> searchResponse = elasticsearchClient.search(searchRequest, CurationDocument.class);

            List<Hit<CurationDocument>> hits = searchResponse.hits().hits();
            List<CurationListSearchResponseDto.CurationListItemDto> items = hits.stream()
                    .map(hit -> {
                        CurationDocument doc = hit.source();
                        return new CurationListSearchResponseDto.CurationListItemDto(
                                doc.getOriginalId(),
                                doc.getTitle(),
                                doc.getImageUrl(),
                                doc.getWriterNickname()
                        );
                    })
                    .collect(Collectors.toList());

            // 다음 커서 생성 (마지막 결과의 정렬 값을 이용)
            String nextCursor = null;
            if (!hits.isEmpty()) {
                Hit<CurationDocument> lastHit = hits.get(hits.size() - 1);
                List<Object> lastSortValues = lastHit.sort().stream().map(fieldValue -> {
                    if (fieldValue.isString()) {
                        return fieldValue.stringValue();
                    } else if (fieldValue.isLong()) {
                        return fieldValue.longValue();
                    } else if (fieldValue.isDouble()) {
                        return fieldValue.doubleValue();
                    } else if (fieldValue.isBoolean()) {
                        return fieldValue.booleanValue();
                    }
                    return fieldValue.anyValue();
                }).collect(Collectors.toList());
                nextCursor = cursorUtil.encodeCursor(lastSortValues);
            }

            return new CurationListSearchResponseDto(items, nextCursor);

        } catch (IOException e) {
            log.error("큐레이션 리스트 검색 실패: {}", e.getMessage(), e);
            return new CurationListSearchResponseDto(new ArrayList<>(), null);
        }
    }
}
