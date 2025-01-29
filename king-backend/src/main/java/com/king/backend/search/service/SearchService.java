package com.king.backend.search.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOptions;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MatchPhrasePrefixQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TermQuery;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.king.backend.search.dto.request.AutocompleteRequestDto;
import com.king.backend.search.dto.request.SearchRequestDto;
import com.king.backend.search.dto.response.AutocompleteResponseDto;
import com.king.backend.search.dto.response.SearchResponseDto;
import com.king.backend.search.entity.SearchDocument;
import com.king.backend.search.repository.SearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final SearchRepository searchRepository;
    private final ElasticsearchClient elasticsearchClient;

    /**
     * 자동완성 제안 가져오기
     */
    public AutocompleteResponseDto getAutocompleteSuggestions(AutocompleteRequestDto requestDto) {
        try{
            String query = requestDto.getQuery();
            String category = requestDto.getCategory();

            MatchPhrasePrefixQuery matchPhrasePrefixQuery = MatchPhrasePrefixQuery.of(builder -> builder
                    .field("name")
                    .query(query)
                    .maxExpansions(10)
            );

            // BoolQuery 생성
            BoolQuery boolQuery = BoolQuery.of(boolBuilder -> {
                // must 쿼리 추가
                boolBuilder.must(Query.of(q -> q.matchPhrasePrefix(matchPhrasePrefixQuery)));

                // filter 쿼리 추가 (category가 비어있지 않은 경우)
                if (category != null && !category.isEmpty()) {
                    boolBuilder.filter(Query.of(q -> q.term(TermQuery.of(term -> term
                            .field("category")
                            .value(category)
                    ))));
                }
                return boolBuilder;
            });

            // SearchRequest 구성
            SearchRequest searchRequest = SearchRequest.of(request -> request
                    .index("search-index") // Elasticsearch 인덱스 이름
                    .query(boolQuery._toQuery()) // BoolQuery를 Query로 변환
                    .size(10) // 최대 검색 결과 수
                    .from(0)  // 검색 시작 위치
                    .source(source -> source
                            .filter(f -> f.excludes("_class")))
            );

            // Elasticsearch 검색 요청 실행
            SearchResponse<SearchDocument> searchResponse = elasticsearchClient.search(searchRequest, SearchDocument.class);

            // 검색 결과 매핑
            List<AutocompleteResponseDto.AutocompleteResult> results = searchResponse.hits().hits().stream()
                    .map(Hit::source)
                    .map(doc -> new AutocompleteResponseDto.AutocompleteResult(
                            doc.getCategory(),
                            doc.getName(),
                            generateDetails(doc)
                    ))
                    .collect(Collectors.toList());

            return new AutocompleteResponseDto(results);
        }catch (IOException e){
            e.printStackTrace();
            return new AutocompleteResponseDto(null);
        }

    }

    /**
     * 도큐먼트의 상세 정보 생성 (카테고리에 따라 다르게 처리)
     */
    private String generateDetails(SearchDocument doc) {
        switch (doc.getCategory().toUpperCase()) {
            case "CAST":
                return "인물"; // 예시
            case "DRAMA":
            case "SHOW":
            case "MOVIE":
                return "작품"; // 예시
            case "PLACE":
                return "장소"; // 예시, 실제로는 더 구체적으로
            default:
                return "";
        }
    }

    /**
     * 검색 기능 구현
     */
    public SearchResponseDto search(SearchRequestDto requestDto) {
        try{
            String query = requestDto.getQuery();
            String category = requestDto.getCategory();
            int page = requestDto.getPage();
            int size = requestDto.getSize();
            String sortBy = requestDto.getSortBy();
            String sortOrder = requestDto.getSortOrder();
            String placeType = requestDto.getPlaceType();
            String region = requestDto.getRegion();

            // BoolQuery 생성
            BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();

            // 검색어 처리
            if (query != null && !query.isEmpty()) {
                boolQueryBuilder.must(q -> q.match(m -> m
                        .query(query)
                        .field("name")
                ));
            }

            // 카테고리 필터링
            if (category != null && !category.isEmpty()) {
                boolQueryBuilder.filter(q -> q.term(t -> t.field("category").value(category)));
            }

            // 장소 필터링
            if ("PLACE".equalsIgnoreCase(category)) {
                if (placeType != null && !placeType.isEmpty()) {
                    boolQueryBuilder.filter(q -> q.term(t -> t.field("details.placeType").value(placeType)));
                }
                if (region != null && !region.isEmpty()) {
                    boolQueryBuilder.filter(q -> q.match(m -> m.field("details.region").query(region)));
                }
            }

            // 정렬 설정
            List<SortOptions> sortOptions = new ArrayList<>();
            if (sortBy != null && !sortBy.isEmpty()) {
                SortOrder order = "desc".equalsIgnoreCase(sortOrder) ? SortOrder.Desc : SortOrder.Asc;
                sortOptions.add(SortOptions.of(s -> s.field(f -> f.field(sortBy).order(order))));
            }

            // SearchRequest 구성
            SearchRequest searchRequest = SearchRequest.of(request -> {
                request.index("search-index")
                        .query(boolQueryBuilder.build()._toQuery())
                        .from(page * size) // 페이지네이션 적용
                        .size(size)
                        .source(source -> source.filter(f -> f.excludes("_class")));

                if (!sortOptions.isEmpty()) { // 정렬 옵션이 있을 경우에만 추가
                    request.sort(sortOptions);
                }

                return request;
            });

            // 🔥 검색 요청 로그 출력
            System.out.println("🔍 Elasticsearch Search Request: " + searchRequest.toString());

            // Elasticsearch 검색 실행
            SearchResponse<SearchDocument> searchResponse = elasticsearchClient.search(searchRequest, SearchDocument.class);

            // 검색 결과 매핑
            List<SearchResponseDto.SearchResult> results = searchResponse.hits().hits().stream()
                    .map(Hit::source)
                    .map(doc -> new SearchResponseDto.SearchResult(
                            doc.getCategory(),
                            doc.getOriginalId(),
                            doc.getName(),
                            generateDetails(doc),
                            doc.getImageUrl()
                    ))
                    .collect(Collectors.toList());

            // 총 문서 개수 조회
            long total = searchResponse.hits().total().value();

            return new SearchResponseDto(results, total, page, size);
        }catch (IOException e) {
            e.printStackTrace();
            return new SearchResponseDto(
                    null,
                    0,
                    0,
                    0
            );
        }
    }
}
