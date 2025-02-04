package com.king.backend.search.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOptions;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MatchPhrasePrefixQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TermQuery;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.UpdateRequest;
import co.elastic.clients.elasticsearch.core.UpdateResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.king.backend.global.exception.CustomException;
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
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final SearchRepository searchRepository;
    private final ElasticsearchClient elasticsearchClient;
    private final CursorUtil cursorUtil;
    private final RankingService rankingService;

    /**
     * 자동완성 제안 가져오기
     */
    public AutocompleteResponseDto getAutocompleteSuggestions(AutocompleteRequestDto requestDto) {
        try{
            String query = requestDto.getQuery();

            // 검색 로직 실행 전후에 검색어가 존재하면 랭킹 업데이트
            if (query != null && !query.trim().isEmpty()) {
                rankingService.incrementKeywordCount(query.trim());
            }

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
                    .sort(List.of(
                            new SortOptions.Builder()
                                    .field(f -> f.field("name.keyword").order(SortOrder.Asc))
                                    .build()
                    )) // name 기준 오름차순 정렬 적용
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
            String query = requestDto.getQuery();
            String category = requestDto.getCategory();
            String relatedType = requestDto.getRelatedType();
            int size = requestDto.getSize();
            String sortByInput = requestDto.getSortBy();
            String sortOrder = requestDto.getSortOrder();
            List<String> placeTypeList = requestDto.getPlaceTypeList();
            String region = requestDto.getRegion();
            String cursor = requestDto.getCursor();

            String sortBy;
            if (sortByInput != null && sortByInput.equalsIgnoreCase("name")) {
                sortBy = "name.keyword";
            } else {
                sortBy = sortByInput;
            }

            // BoolQuery 생성
            BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();

            // 검색어 처리
            if (query != null && !query.isEmpty()) {
                if ("place".equalsIgnoreCase(category)){
                    if ("place".equalsIgnoreCase(relatedType)) {
                        // 오직 장소만 결과로 검색: name 필드에 대해 match 쿼리 사용.
                        boolQueryBuilder.must(q -> q.match(m -> m.field("name").query(query)));
                    }else if("cast".equalsIgnoreCase(relatedType)){
                        // 연예인 검색: associatedCastNames 필드에 대해 match 쿼리 사용
                        boolQueryBuilder.must(q -> q.match(m -> m.field("associatedCastNames").query(query)));
                    }else if("content".equalsIgnoreCase(relatedType)){
                        boolQueryBuilder.must(q -> q.match(m -> m.field("associatedContentNames").query(query)));
                    }else{
                        boolQueryBuilder.should(q -> q.match(m -> m.field("name").query(query)));
                        boolQueryBuilder.should(q -> q.match(m -> m.field("associatedCastNames").query(query)));
                        boolQueryBuilder.should(q -> q.match(m -> m.field("associatedContentNames").query(query)));
                        boolQueryBuilder.minimumShouldMatch(String.valueOf(1L));
                    }
                }else{
                    boolQueryBuilder.must(q -> q.match(m -> m
                            .query(query)
                            .field("name")
                    ));
                }
            }else{
                boolQueryBuilder.must(q -> q.matchAll(m -> m));
            }

            // 카테고리 필터링
            if (category != null && !category.isEmpty()) {
                boolQueryBuilder.filter(q -> q.term(t -> t.field("category").value(category)));
            }

            // 장소 필터링
            if ("PLACE".equalsIgnoreCase(category)) {
                if (placeTypeList != null && !placeTypeList.isEmpty()) {
                    // 리스트의 모든 문자열을 대문자로 변환
                    List<FieldValue> upperCasePlaceTypeList = placeTypeList.stream()
                            .map(String::toUpperCase)
                            .map(o -> FieldValue.of(fv -> fv.stringValue(o)))
                            .collect(Collectors.toList());
                    boolQueryBuilder.filter(q -> q.terms(t -> t.field("type")
                            .terms(termsBuilder -> termsBuilder.value(upperCasePlaceTypeList))));
                    //boolQueryBuilder.filter(q -> q.term(t -> t.field("type").value(placeType.toUpperCase())));
                }
                if (region != null && !region.isEmpty()) {
                    boolQueryBuilder.filter(q -> q.match(m -> m.field("address").query(region)));
                }
            }

            // 정렬 설정
            List<SortOptions> sortOptions = new ArrayList<>();
            if (sortBy != null && !sortBy.isEmpty()) {
                SortOrder order = "desc".equalsIgnoreCase(sortOrder) ? SortOrder.Desc : SortOrder.Asc;
                sortOptions.add(SortOptions.of(s -> s
                        .field(f -> f
                                .field(sortBy)
                                .order(order)
                        )
                ));
                sortOptions.add(SortOptions.of(s -> s
                        .field(f -> f
                                .field("id")
                                .order(SortOrder.Asc)
                        )
                ));
            } else {
                // 기본 정렬 : createdAt 내림차순, id 오름차순
                sortOptions.add(SortOptions.of(s -> s
                        .field(f -> f
                                .field("createdAt")
                                .order(SortOrder.Desc)
                        )
                ));
                sortOptions.add(SortOptions.of(s -> s
                        .field(f -> f
                                .field("id")
                                .order(SortOrder.Asc)
                        )
                ));
            }

            // 'search_after' 처리 (커서가 존재하는 경우)
            List<Object> searchAfterValues = null;
            if(cursor!=null && !cursor.isEmpty()){
                try{
                    searchAfterValues = cursorUtil.decodeCursor(cursor);
                }catch (IllegalArgumentException e){
                    log.error("유효하지 않은 커서: {}", cursor);
                    throw new CustomException(SearchErrorCode.INVALID_CURSOR);
                }
            }

            SearchRequest.Builder searchRequestBuilder = new SearchRequest.Builder()
                    .index("search-index")
                    .query(q -> q.bool(boolQueryBuilder.build()))
                    .size(size)
                    .sort(sortOptions)
                    .source(s -> s
                            .filter(f -> f
                                    .excludes("_class")
                            )
                    );

            // 'search_after' 값이 존재하면 추가
            if (searchAfterValues != null && !searchAfterValues.isEmpty()) {
                searchRequestBuilder.searchAfter(searchAfterValues
                        .stream()
                        .map(o -> {
                            if(o instanceof String){
                                return FieldValue.of(fv -> fv.stringValue((String) o));
                            }else if(o instanceof Integer){
                                return FieldValue.of(fv -> fv.longValue(((Integer)o).longValue()));
                            }else if(o instanceof Long){
                                return FieldValue.of(fv -> fv.longValue((Long)o));
                            }else if(o instanceof Double){
                                return FieldValue.of(fv -> fv.doubleValue((Double)o));
                            }else if(o instanceof Float){
                                return FieldValue.of(fv -> fv.doubleValue(((Float)o).doubleValue()));
                            }else if(o instanceof Boolean){
                                return FieldValue.of(fv -> fv.booleanValue((Boolean)o));
                            }else if (o instanceof java.util.Date){
                                return FieldValue.of(fv -> fv.longValue(((java.util.Date)o).getTime()));
                            }else{
                                throw new IllegalArgumentException("Unsupported search type: " + o.getClass().getName());
                            }
                        })
                        .collect(Collectors.toList())
                );
            }

            SearchRequest searchRequest = searchRequestBuilder.build();

            // 🔥 검색 요청 로그 출력
            System.out.println("🔍 Elasticsearch Search Request: " + searchRequest.toString());

            // Elasticsearch 검색 실행
            SearchResponse<SearchDocument> searchResponse = elasticsearchClient.search(searchRequest, SearchDocument.class);

            // 검색 결과 매핑
            List<Hit<SearchDocument>> hits = searchResponse.hits().hits();
            List<SearchResponseDto.SearchResult> results = hits.stream()
                    .map(Hit::source)
                    .map(doc -> new SearchResponseDto.SearchResult(
                            doc.getCategory(),
                            doc.getOriginalId(),
                            doc.getName(),
                            doc.getDetails(),
                            doc.getImageUrl()
                    ))
                    .collect(Collectors.toList());
            // 총 문서 개수 조회
            long total = searchResponse.hits().total() != null ? searchResponse.hits().total().value() : 0;

            // 다음 커서 생성
            String nextCursor = null;
            if(!hits.isEmpty()){
                Hit<SearchDocument> lastHit = hits.get(hits.size()-1);
                List<Object> lastSortValues = lastHit.sort().stream()
                        .map(fieldValue -> {
                            if(fieldValue.isString()){
                                return fieldValue.stringValue();
                            }else if(fieldValue.isLong()){
                                return fieldValue.longValue();
                            }else if(fieldValue.isDouble()){
                                return fieldValue.doubleValue();
                            }else if(fieldValue.isBoolean()){
                                return fieldValue.booleanValue();
                            }else{
                                return fieldValue.anyValue();
                            }
                        })
                        .collect(Collectors.toList());
                nextCursor = cursorUtil.encodeCursor(lastSortValues);
            }

            return new SearchResponseDto(
                    results,
                    total,
                    nextCursor
            );
        }catch (IOException e) {
            e.printStackTrace();
            return new SearchResponseDto(
                    null,
                    0,
                    null
            );
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
                    .index("search-index")
                    .id(documentId)
                    .doc(Map.of("popularity", popularity))
            );

            UpdateResponse<SearchDocument> updateResponse = elasticsearchClient.update(updateRequest, SearchDocument.class);

            if (updateResponse.result() == co.elastic.clients.elasticsearch._types.Result.Updated) {
                log.info("Elasticsearch에서 Place {}의 popularity 업데이트 성공", placeId);
            } else {
                log.warn("Elasticsearch에서 Place {}의 popularity 업데이트 실패: {}", placeId, updateResponse.result());
            }
        } catch (IOException e) {
            log.error("Elasticsearch에서 Place {}의 popularity 업데이트 중 오류 발생: {}", placeId, e.getMessage());
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

            // BoolQuery 생성
            BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();

            boolQueryBuilder.filter(q -> q.term(t -> t.field("category").value("place".toUpperCase())));

            // 검색어 처리
            if (query != null && !query.isEmpty()) {
                boolQueryBuilder.must(q -> q.match(m -> m
                        .query(query)
                        .field("name")
                ));
            }

            // 지역 필터링 (address 필드 기준)
            if (region != null && !region.isEmpty()) {
                boolQueryBuilder.filter(q -> q.match(m -> m
                        .field("address")
                        .query(region)
                ));
            }

            // SearchRequest 구성
            SearchRequest searchRequest = SearchRequest.of(request -> request
                    .index("search-index")
                    .query(q -> q.bool(boolQueryBuilder.build()))
                    .size(10000) // 페이지네이션 없이 모든 결과 가져오기 (최대 10,000건)
                    .sort(List.of(
                            SortOptions.of(s -> s
                                    .field(f -> f
                                            .field("createdAt")
                                            .order(SortOrder.Desc)
                                    )
                            )
                    ))
            );

            // Elasticsearch 검색 실행
            SearchResponse<SearchDocument> searchResponse = elasticsearchClient.search(searchRequest, SearchDocument.class);

            // 검색 결과 매핑
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
            log.error("지도 보기 검색 실패: {}", e.getMessage());
            throw new CustomException(SearchErrorCode.SEARCH_FAILED);
        }
    }
}
