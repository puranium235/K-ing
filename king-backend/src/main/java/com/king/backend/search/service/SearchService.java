package com.king.backend.search.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MatchPhrasePrefixQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TermQuery;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.king.backend.search.dto.request.AutocompleteRequestDto;
import com.king.backend.search.dto.response.AutocompleteResponseDto;
import com.king.backend.search.entity.SearchDocument;
import com.king.backend.search.repository.SearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
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
}
