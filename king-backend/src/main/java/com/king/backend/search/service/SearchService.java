package com.king.backend.search.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOptions;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MatchPhrasePrefixQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TermQuery;
import co.elastic.clients.elasticsearch.core.*;
import co.elastic.clients.elasticsearch.core.msearch.MultiSearchResponseItem;
import co.elastic.clients.elasticsearch.core.msearch.RequestItem;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.king.backend.global.exception.CustomException;
import com.king.backend.search.config.ElasticsearchConstants;
import com.king.backend.search.dto.request.AutocompleteRequestDto;
import com.king.backend.search.dto.request.MapViewRequestDto;
import com.king.backend.search.dto.request.SearchRequestDto;
import com.king.backend.search.dto.response.AutocompleteResponseDto;
import com.king.backend.search.dto.response.MapViewResponseDto;
import com.king.backend.search.dto.response.SearchResponseDto;
import com.king.backend.search.entity.SearchDocument;
import com.king.backend.search.errorcode.SearchErrorCode;
import com.king.backend.search.repository.SearchRepository;
import com.king.backend.search.util.CursorUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final ElasticsearchClient elasticsearchClient;
    private final CursorUtil cursorUtil;
    private final RankingService rankingService;

    @Value("${spring.aws.s3-bucket}")
    private String awsBucketName;

    @Value("${spring.aws.region}")
    private String awsRegion;

    /**
     * 자동완성 제안 가져오기
     */
    public AutocompleteResponseDto getAutocompleteSuggestions(AutocompleteRequestDto requestDto) {
        try{
            String query = requestDto.getQuery();

            if (query != null && !query.trim().isEmpty()) {
                rankingService.incrementKeywordCount(query.trim());
            }

            String category = requestDto.getCategory();
            Query fuzzyQuery = Query.of(q -> q.fuzzy(f -> f
                    .field(ElasticsearchConstants.FIELD_NAME)
                    .value(query)
                    .fuzziness("AUTO")
                    .boost(0.5F)
            ));
            MatchPhrasePrefixQuery mppQuery = MatchPhrasePrefixQuery.of(builder -> builder
                    .field(ElasticsearchConstants.FIELD_NAME)
                    .query(query)
                    .maxExpansions(10)
                    .boost(2.0F)
            );

            BoolQuery boolQuery = buildAutocompleteBoolQuery(query, category, mppQuery, fuzzyQuery);

            SearchRequest searchRequest = SearchRequest.of(request -> request
                    .index(ElasticsearchConstants.SEARCH_INDEX)
                    .query(boolQuery._toQuery())
                    .size(10)
                    .from(0)
                    .source(source -> source
                            .filter(f -> f.excludes("_class")))
            );

            SearchResponse<SearchDocument> searchResponse = elasticsearchClient.search(searchRequest, SearchDocument.class);

            List<AutocompleteResponseDto.AutocompleteResult> results = searchResponse.hits().hits().stream()
                    .map(Hit::source)
                    .map(doc -> new AutocompleteResponseDto.AutocompleteResult(
                            doc.getOriginalId().toString(),
                            doc.getCategory(),
                            doc.getName(),
                            generateDetails(doc)
                    ))
                    .collect(Collectors.toList());

            return new AutocompleteResponseDto(results);
        }catch (IOException e){
            throw new CustomException(SearchErrorCode.SEARCH_FAILED);
        }

    }

    private BoolQuery buildAutocompleteBoolQuery(String query, String category, MatchPhrasePrefixQuery mppQuery, Query fuzzyQuery) {
        return BoolQuery.of(boolBuilder -> {
            boolBuilder.should(q -> q.matchPhrasePrefix(mppQuery));
            boolBuilder.should(fuzzyQuery);
            boolBuilder.minimumShouldMatch("1");
            if (category != null && !category.isEmpty()) {
                boolBuilder.filter(q -> q.term(TermQuery.of(term -> term
                        .field(ElasticsearchConstants.FIELD_CATEGORY)
                        .value(category)
                )));
            }
            return boolBuilder;
        });
    }

    /**
     * 도큐먼트의 상세 정보 생성 (카테고리에 따라 다르게 처리)
     */
    private String generateDetails(SearchDocument doc) {
        switch (doc.getCategory().toUpperCase()) {
            case "CAST":
                return "인물";
            case "DRAMA":
                return "드라마";
            case "SHOW":
                return "예능";
            case "MOVIE":
                return "영화";
            case "PLACE":
                return "장소";
            default:
                return "";
        }
    }

    /**
     * 검색 기능 구현
     */
    public SearchResponseDto search(SearchRequestDto requestDto) {
        try{
            if(requestDto.getCategory()==null||requestDto.getCategory().trim().isEmpty()){
                BoolQuery.Builder boolQueryBuilder = buildSearchBoolQuery(requestDto);
                List<SortOptions> sortOptions = buildSortOptions(requestDto);

                // 상위 레벨 hit는 필요 없으므로 size는 0으로 설정하고,
                // "by_category" terms aggregation과 그 하위에 "top_hits" 서브 애그리게이션을 사용합니다.
                SearchRequest searchRequest = SearchRequest.of(s -> s
                        .index(ElasticsearchConstants.SEARCH_INDEX)
                        .query(q -> q.bool(boolQueryBuilder.build()))
                        .size(0)
                        .aggregations("by_category", a -> a
//                                .terms(t -> t.field(ElasticsearchConstants.FIELD_CATEGORY))
                                        .filters(f -> f.filters(
                                                bq -> bq.keyed(Map.of(
                                                                "grouped", Query.of(q -> q.bool(b -> b
                                                                        .should(k -> k.term(t -> t
                                                                                .field(ElasticsearchConstants.FIELD_CATEGORY)
                                                                                .value("SHOW")))
                                                                        .should(k -> k.term(t -> t
                                                                                .field(ElasticsearchConstants.FIELD_CATEGORY)
                                                                                .value("MOVIE")))
                                                                        .should(k -> k.term(t -> t
                                                                                .field(ElasticsearchConstants.FIELD_CATEGORY)
                                                                                .value("DRAMA")))
                                                                        .minimumShouldMatch("1")
                                                                ))
                                                                ,"cast", Query.of(q -> q.term(t -> t
                                                                        .field(ElasticsearchConstants.FIELD_CATEGORY)
                                                                        .value("CAST")
                                                                )),
                                                                "place", Query.of(q -> q.term(t -> t
                                                                        .field(ElasticsearchConstants.FIELD_CATEGORY)
                                                                        .value("PLACE")
                                                                ))
                                        ))))
                                .aggregations("top_hits", a2 -> a2.topHits(th -> th
                                        .size(10)
                                        .sort(sortOptions)
                                ))
                        )
                );

                SearchResponse<SearchDocument> searchResponse = elasticsearchClient.search(searchRequest, SearchDocument.class);

                List<SearchResponseDto.SearchResult> combinedResults = new ArrayList<>();
                long total = 0;

                // aggregation 결과 파싱
                if (searchResponse.aggregations() != null && searchResponse.aggregations().containsKey("by_category")) {
                    var byCategoryAgg = searchResponse.aggregations().get("by_category").filters();
                    if (byCategoryAgg != null && byCategoryAgg.buckets() != null) {
                        var buckets = byCategoryAgg.buckets().keyed();
                        for (var entry : buckets.entrySet()) {
                            var key = entry.getKey(); // "grouped", "cast", "place" 등
                            var bucket = entry.getValue();
                            total += bucket.docCount();
                            if (bucket.aggregations() != null && bucket.aggregations().containsKey("top_hits")) {
                                var topHitsAgg = bucket.aggregations().get("top_hits").topHits();
                                if (topHitsAgg != null &&
                                        topHitsAgg.hits() != null &&
                                        topHitsAgg.hits().hits() != null) {
                                    for (var hit : topHitsAgg.hits().hits()) {
                                        SearchDocument doc = hit.source().to(SearchDocument.class);
                                        combinedResults.add(new SearchResponseDto.SearchResult(
                                                doc.getCategory(),
                                                doc.getOriginalId(),
                                                doc.getName(),
                                                doc.getDetails(),
                                                Objects.requireNonNullElse(doc.getImageUrl(),
                                                        String.format("https://%s.s3.%s.amazonaws.com/uploads/default.jpg", awsBucketName, awsRegion))
                                        ));
                                    }
                                }
                            }
                        }
                    }
                }

                // aggregation 방식에서는 커서 기반 페이지네이션을 지원하지 않으므로 nextCursor는 null
                return new SearchResponseDto(combinedResults, total, null);
            }else {
                BoolQuery.Builder boolQueryBuilder = buildSearchBoolQuery(requestDto);
                List<SortOptions> sortOptions = buildSortOptions(requestDto);
                List<Object> searchAfterValues = buildSearchAfterValues(requestDto.getCursor());

                SearchRequest.Builder searchRequestBuilder = new SearchRequest.Builder()
                        .index(ElasticsearchConstants.SEARCH_INDEX)
                        .query(q -> q.bool(boolQueryBuilder.build()))
                        .size(requestDto.getSize())
                        .source(s -> s.filter(f -> f.excludes("_class")))
                        .sort(sortOptions);

                if (searchAfterValues != null && !searchAfterValues.isEmpty()) {
                    searchRequestBuilder.searchAfter(
                            searchAfterValues.stream()
                                    .map(this::convertToFieldValue)
                                    .collect(Collectors.toList())
                    );
                }

                SearchRequest searchRequest = searchRequestBuilder.build();

                SearchResponse<SearchDocument> searchResponse = elasticsearchClient.search(searchRequest, SearchDocument.class);


                List<Hit<SearchDocument>> hits = searchResponse.hits().hits();
                List<SearchResponseDto.SearchResult> results = hits.stream()
                        .map(Hit::source)
                        .map(doc -> new SearchResponseDto.SearchResult(
                                doc.getCategory(),
                                doc.getOriginalId(),
                                doc.getName(),
                                doc.getDetails(),
                                Objects.requireNonNullElse(doc.getImageUrl(),
                                        String.format("https://%s.s3.%s.amazonaws.com/uploads/default.jpg", awsBucketName, awsRegion))
                        ))
                        .collect(Collectors.toList());

                long total = (searchResponse.hits().total() != null) ? searchResponse.hits().total().value() : 0;
                String nextCursor = (hits.isEmpty()) ? null : cursorUtil.encodeCursor(
                        hits.get(hits.size() - 1).sort().stream()
                                .map(fieldValue -> {
                                    if (fieldValue.isString()) return fieldValue.stringValue();
                                    else if (fieldValue.isLong()) return fieldValue.longValue();
                                    else if (fieldValue.isDouble()) return fieldValue.doubleValue();
                                    else if (fieldValue.isBoolean()) return fieldValue.booleanValue();
                                    else return fieldValue.anyValue();
                                }).collect(Collectors.toList())
                );

                return new SearchResponseDto(results, total, nextCursor);
            }
        }catch (IOException e) {
            throw new CustomException(SearchErrorCode.SEARCH_FAILED);
        }
    }

    /**
     * Multi-Search 방식에서 각 카테고리에 대해 상위 10개의 SearchRequest를 생성합니다.
     */
    private SearchRequest buildSearchRequestForCategory(SearchRequestDto requestDto, String category) {
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        String query = requestDto.getQuery();

        if (query != null && !query.trim().isEmpty()) {
            boolQueryBuilder.must(m -> m.match(mm -> mm
                    .field(ElasticsearchConstants.FIELD_NAME)
                    .query(query)
                    .fuzziness("AUTO")
                    .boost(2.0f)
            ));
        } else {
            boolQueryBuilder.must(m -> m.matchAll(mm -> mm));
        }
        // 카테고리 필터 추가
        boolQueryBuilder.filter(f -> f.term(t -> t.field(ElasticsearchConstants.FIELD_CATEGORY).value(category)));

        // PLACE인 경우 추가 필터 적용
        if ("PLACE".equalsIgnoreCase(category)) {
            if (requestDto.getPlaceTypeList() != null && !requestDto.getPlaceTypeList().isEmpty()) {
                List<FieldValue> upperCaseList = requestDto.getPlaceTypeList().stream()
                        .map(String::toUpperCase)
                        .map(val -> FieldValue.of(f -> f.stringValue(val)))
                        .collect(Collectors.toList());
                boolQueryBuilder.filter(q -> q.terms(t -> t.field(ElasticsearchConstants.FIELD_TYPE)
                        .terms(terms -> terms.value(upperCaseList))));
            }
            if (requestDto.getRegion() != null && !requestDto.getRegion().isEmpty()) {
                boolQueryBuilder.filter(q -> q.match(m -> m.field("address").query(requestDto.getRegion())));
            }
        }

        // 정렬 옵션은 필요에 따라 조정 (여기서는 기존의 buildSortOptions() 재사용)
        List<SortOptions> sortOptions = buildSortOptions(requestDto);

        return SearchRequest.of(s -> s
                .index(ElasticsearchConstants.SEARCH_INDEX)
                .query(q -> q.bool(boolQueryBuilder.build()))
                .size(10)  // 각 카테고리별 최대 10개
                .source(src -> src.filter(f -> f.excludes("_class")))
                .sort(sortOptions)
        );
    }

    private BoolQuery.Builder buildSearchBoolQuery(SearchRequestDto requestDto) {
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        String query = requestDto.getQuery();
        String category = requestDto.getCategory();
        String relatedType = requestDto.getRelatedType();

        if (query != null && !query.isEmpty()) {
            if ("place".equalsIgnoreCase(category)) {
                if ("place".equalsIgnoreCase(relatedType)) {
                    boolQueryBuilder.must(q -> q.match(m -> m.field(ElasticsearchConstants.FIELD_NAME)
                            .query(query)
                            .fuzziness("AUTO")
                            .boost(2.0f)));
                } else if ("cast".equalsIgnoreCase(relatedType)) {
                    boolQueryBuilder.must(q -> q.nested(n -> n
                            .path("associatedCasts")
                            .query(nq -> nq.match(m -> m.field("associatedCasts.castName")
                                    .query(query)
                                    .fuzziness("AUTO")
                                    .boost(2.0f)))));
                } else if ("content".equalsIgnoreCase(relatedType)) {
                    boolQueryBuilder.must(q -> q.nested(n -> n
                            .path("associatedContents")
                            .query(nq -> nq.match(m -> m.field("associatedContents.contentTitle")
                                    .query(query)
                                    .fuzziness("AUTO")
                                    .boost(2.0f)))));
                } else {
                    boolQueryBuilder.should(q -> q.match(m -> m.field(ElasticsearchConstants.FIELD_NAME)
                            .query(query)
                            .fuzziness("AUTO")
                            .boost(2.0f)));
                    boolQueryBuilder.should(q -> q.nested(n -> n
                            .path("associatedCasts")
                            .query(nq -> nq.match(m -> m.field("associatedCasts.castName")
                                    .query(query)
                                    .fuzziness("AUTO")
                                    .boost(1.0f)))));
                    boolQueryBuilder.should(q -> q.nested(n -> n
                            .path("associatedContents")
                            .query(nq -> nq.match(m -> m.field("associatedContents.contentTitle")
                                    .query(query)
                                    .fuzziness("AUTO")
                                    .boost(1.0f)))));
                    boolQueryBuilder.minimumShouldMatch("1");
                }
            } else {
                boolQueryBuilder.must(q -> q.match(m -> m.field(ElasticsearchConstants.FIELD_NAME)
                        .query(query)
                        .fuzziness("AUTO")
                        .boost(2.0f)));
            }
        } else {
            boolQueryBuilder.must(q -> q.matchAll(m -> m));
        }

        if (category != null && !category.isEmpty()) {
            boolQueryBuilder.filter(q -> q.term(t -> t.field(ElasticsearchConstants.FIELD_CATEGORY).value(category)));
        }

        if ("PLACE".equalsIgnoreCase(category)) {
            if (requestDto.getPlaceTypeList() != null && !requestDto.getPlaceTypeList().isEmpty()) {
                List<FieldValue> upperCaseList = requestDto.getPlaceTypeList().stream()
                        .map(String::toUpperCase)
                        .map(val -> FieldValue.of(f -> f.stringValue(val)))
                        .collect(Collectors.toList());
                boolQueryBuilder.filter(q -> q.terms(t -> t.field(ElasticsearchConstants.FIELD_TYPE)
                        .terms(terms -> terms.value(upperCaseList))));
            }
            if (requestDto.getRegion() != null && !requestDto.getRegion().isEmpty()) {
                boolQueryBuilder.filter(q -> q.match(m -> m.field("address").query(requestDto.getRegion())));
            }
        }
        return boolQueryBuilder;
    }

    private List<SortOptions> buildSortOptions(SearchRequestDto requestDto) {
        List<SortOptions> sortOptions = new ArrayList<>();
        String sortByInput = requestDto.getSortBy();
        String sortBy = (sortByInput != null && sortByInput.equalsIgnoreCase("name"))
                ? "name.keyword" : sortByInput;
        String sortOrder = requestDto.getSortOrder();

        if (sortBy != null && !sortBy.isEmpty()) {
            SortOrder order = ("desc".equalsIgnoreCase(sortOrder)) ? SortOrder.Desc : SortOrder.Asc;
            sortOptions.add(SortOptions.of(s -> s.field(f -> f.field(sortBy).order(order))));
            sortOptions.add(SortOptions.of(s -> s.field(f -> f.field("id").order(SortOrder.Asc))));
        } else {
            sortOptions.add(SortOptions.of(s -> s.field(f -> f.field("_score").order(SortOrder.Desc))));
            sortOptions.add(SortOptions.of(s -> s.field(f -> f.field("id").order(SortOrder.Asc))));
        }
        return sortOptions;
    }

    private List<Object> buildSearchAfterValues(String cursor) {
        if (cursor != null && !cursor.isEmpty()) {
            try {
                return cursorUtil.decodeCursor(cursor);
            } catch (IllegalArgumentException e) {
                throw new CustomException(SearchErrorCode.INVALID_CURSOR);
            }
        }
        return null;
    }

    private FieldValue convertToFieldValue(Object o) {
        if (o instanceof String) {
            return FieldValue.of(fv -> fv.stringValue((String) o));
        } else if (o instanceof Integer) {
            return FieldValue.of(fv -> fv.longValue(((Integer) o).longValue()));
        } else if (o instanceof Long) {
            return FieldValue.of(fv -> fv.longValue((Long) o));
        } else if (o instanceof Double) {
            return FieldValue.of(fv -> fv.doubleValue((Double) o));
        } else if (o instanceof Float) {
            return FieldValue.of(fv -> fv.doubleValue(((Float) o).doubleValue()));
        } else if (o instanceof Boolean) {
            return FieldValue.of(fv -> fv.booleanValue((Boolean) o));
        } else if (o instanceof java.util.Date) {
            return FieldValue.of(fv -> fv.longValue(((java.util.Date) o).getTime()));
        } else {
            throw new IllegalArgumentException("Unsupported search type: " + o.getClass().getName());
        }
    }

    /**
     * 인기순 정렬을 위한 Place의 popularity 필드 업데이트
     *
     * @param placeId    업데이트할 Place의 ID
     * @param popularity 최신 조회수
     */
    public void updatePlacePopularity(Long placeId, int popularity) {
        String documentId = "PLACE-" + placeId;
        try {
            UpdateRequest<SearchDocument, Object> updateRequest = UpdateRequest.of(u -> u
                    .index(ElasticsearchConstants.SEARCH_INDEX)
                    .id(documentId)
                    .doc(Map.of(ElasticsearchConstants.FIELD_POPULARITY, popularity))
            );

            UpdateResponse<SearchDocument> updateResponse = elasticsearchClient.update(updateRequest, SearchDocument.class);

        } catch (IOException e) {
            throw new CustomException(SearchErrorCode.SEARCH_FAILED);
        }
    }

    /**
     * 지도 보기를 위한 장소 목록 가져오기
     * @param requestDto 지도 보기 요청 DTO
     * @return 지도에 표시할 장소 목록과 적용된 필터
     */
    public MapViewResponseDto getMapViewPlaces(MapViewRequestDto requestDto) {
        try {
            String query = requestDto.getQuery();
            String region = requestDto.getRegion();

            BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();

            boolQueryBuilder.filter(q -> q.term(t -> t.field(ElasticsearchConstants.FIELD_CATEGORY).value("place".toUpperCase())));

            if (query != null && !query.isEmpty()) {
                boolQueryBuilder.must(q -> q.match(m -> m
                        .query(query)
                        .field(ElasticsearchConstants.FIELD_NAME)
                ));
            }

            if (region != null && !region.isEmpty()) {
                boolQueryBuilder.filter(q -> q.match(m -> m
                        .field("address")
                        .query(region)
                ));
            }

            SearchRequest searchRequest = SearchRequest.of(request -> request
                    .index(ElasticsearchConstants.SEARCH_INDEX)
                    .query(q -> q.bool(boolQueryBuilder.build()))
                    .size(10000)
                    .sort(List.of(
                            SortOptions.of(s -> s
                                    .field(f -> f
                                            .field(ElasticsearchConstants.FIELD_ID)
                                            .order(SortOrder.Desc)
                                    )
                            )
                    ))
            );

            SearchResponse<SearchDocument> searchResponse = elasticsearchClient.search(searchRequest, SearchDocument.class);

            List<Hit<SearchDocument>> hits = searchResponse.hits().hits();
            List<MapViewResponseDto.PlaceDto> places = hits.stream()
                    .map(Hit::source)
                    .map(doc -> new MapViewResponseDto.PlaceDto(
                            doc.getOriginalId(),
                            doc.getName(),
                            doc.getType(),
                            doc.getOpenHour(),
                            doc.getBreakTime(),
                            doc.getClosedDay(),
                            doc.getAddress(), // Assuming 'details' contains 'address'
                            doc.getLat(), // Ensure 'lat' is included
                            doc.getLng(), // Ensure 'lng' is included
                            doc.getImageUrl()
                    ))
                    .collect(Collectors.toList());

            return new MapViewResponseDto(places);
        } catch (IOException e) {
            throw new CustomException(SearchErrorCode.SEARCH_FAILED);
        }
    }
}
