package com.king.backend.ai.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TextQueryType;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import com.king.backend.ai.dto.CurationSearchResponseDto;
import com.king.backend.ai.dto.PlaceSearchResponseDto;
import com.king.backend.ai.dto.RagSearchRequestDto;
import com.king.backend.search.config.ElasticsearchConstants;
import com.king.backend.search.entity.SearchDocument;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RagSearchService {
    private final ElasticsearchClient elasticsearchClient;

    public RagSearchService(ElasticsearchClient elasticsearchClient) {
        this.elasticsearchClient = elasticsearchClient;
    }

    /**
     * 장소 검색
     * - 기존 "search-index"에서 category가 "PLACE"인 도큐먼트만 대상으로 검색
     * - name, details, address, associatedContentNames 필드를 대상으로 multi_match 쿼리 적용
     */
    public PlaceSearchResponseDto search(RagSearchRequestDto requestDto) {
        try {
            // Bool 쿼리 빌드
            BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();

            // 1) category 필터: 장소만 검색 (SearchDocumentBuilder.fromPlace에서 category를 "PLACE"로 설정함)
            boolQueryBuilder.filter(f -> f
                    .term(t -> t.field(ElasticsearchConstants.FIELD_CATEGORY).value("PLACE"))
            );

            // 2) 키워드가 있을 경우, 여러 필드에 대해 검색: name, details, address, associatedContentNames
            if (requestDto.getKeywords() != null && !requestDto.getKeywords().trim().isEmpty()) {
                Query phraseMatchQuery = Query.of(q -> q.multiMatch(m -> m
                        .query(requestDto.getKeywords())
                        .fields(List.of("name", "details", "associatedCastNames", "associatedContentNames"))
                        // 입력한 구문이 해당 필드에 연속된 문자열로 반드시 존재해야 함
                        .type(TextQueryType.Phrase)
                ));
                boolQueryBuilder.must(phraseMatchQuery);
            } else {
                // 키워드가 없으면 match_all
                boolQueryBuilder.must(q -> q.matchAll(ma -> ma));
            }

            // 3) 검색 요청 생성 (필요한 필드만 포함하여 조회)
            SearchRequest searchRequest = SearchRequest.of(s -> s
                    .index(ElasticsearchConstants.SEARCH_INDEX)
                    .query(q -> q.bool(boolQueryBuilder.build()))
                    .size(50)  // 반환할 최대 도큐먼트 수 (요구사항에 맞게 조정)
                    .source(src -> src.filter(f -> f.includes(
                            "originalId", "name", "type", "address", "details", "lat", "lng", "imageUrl"
                    )))
            );

            // 4) 검색 실행
            SearchResponse<SearchDocument> searchResponse = elasticsearchClient.search(searchRequest, SearchDocument.class);

            // 5) 결과 매핑: SearchDocument -> PlaceSearchResponseDto.PlaceResult
            List<PlaceSearchResponseDto.PlaceResult> results = searchResponse.hits().hits().stream()
                    .map(hit -> {
                        SearchDocument doc = hit.source();
                        return new PlaceSearchResponseDto.PlaceResult(
                                doc.getOriginalId(),  // DB의 placeId로 사용한 값
                                doc.getName(),
                                doc.getType(),
                                doc.getAddress(),
                                doc.getDetails(),     // description 역할
                                doc.getLat(),
                                doc.getLng(),
                                doc.getImageUrl()
                        );
                    })
                    .collect(Collectors.toList());

            return new PlaceSearchResponseDto(results);
        } catch (IOException e) {
            throw new RuntimeException("Elasticsearch 검색 실패", e);
        }
    }

    public CurationSearchResponseDto searchCurations(RagSearchRequestDto requestDto) {
        return null;
    }
}
