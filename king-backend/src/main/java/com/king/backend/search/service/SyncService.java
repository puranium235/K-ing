package com.king.backend.search.service;

import co.elastic.clients.elasticsearch._types.analysis.*;
import co.elastic.clients.elasticsearch._types.mapping.*;
import co.elastic.clients.elasticsearch.indices.IndexSettings;
import com.king.backend.global.util.RedisUtil;
import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.repository.CastRepository;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.repository.ContentRepository;
import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.curation.repository.CurationListRepository;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.repository.PlaceRepository;
import com.king.backend.search.config.ElasticsearchConstants;
import com.king.backend.search.entity.CurationDocument;
import com.king.backend.search.entity.SearchDocument;
import com.king.backend.search.repository.ElasticsearchCurationListRepository;
import com.king.backend.search.repository.SearchRepository;
import com.king.backend.search.util.ElasticsearchUtil;
import com.king.backend.search.util.SearchDocumentBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 데이터 동기화 서비스 (MySQL <-> Elasticsearch)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SyncService implements CommandLineRunner {

    private final CastRepository castRepository;
    private final ContentRepository contentRepository;
    private final PlaceRepository placeRepository;
    private final SearchRepository searchRepository;
    private final ElasticsearchUtil elasticsearchUtil;
    private final RedisUtil redisUtil;
    private final CurationListRepository curationListRepository;
    private final ElasticsearchCurationListRepository elasticsearchCurationListRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        settingBeforeSearchMigration();
        settingBeforeCurationMigration();
    }

    private void settingBeforeSearchMigration(){
        log.info("초기 mysql-elasticsearch 데이터 마이그레이션 시작");

        // 기존 인덱스가 있는지 확인하고 없으면 생성
        if (elasticsearchUtil.indexExists(ElasticsearchConstants.SEARCH_INDEX)) {
            elasticsearchUtil.deleteIndex(ElasticsearchConstants.SEARCH_INDEX);
        }

        log.info("인덱스가 존재하지 않음. 새로 생성합니다.");

        // Define properties with new fields
        Map<String, Property> properties = new HashMap<>();
        properties.put(ElasticsearchConstants.FIELD_ID, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put(ElasticsearchConstants.FIELD_CATEGORY, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put(ElasticsearchConstants.FIELD_TYPE, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build()); // Added 'type'
        properties.put(ElasticsearchConstants.FIELD_NAME, new Property.Builder().text(
                new TextProperty.Builder()
                        .analyzer(ElasticsearchConstants.ANALYZER_AUTOCOMPLETE)
                        .searchAnalyzer("standard")
                        .fields(Map.of(
                                "keyword",new Property.Builder().keyword(new KeywordProperty.Builder().build()).build()
                        ))
                        .build()
        ).build());
        properties.put(ElasticsearchConstants.FIELD_DETAILS, new Property.Builder().text(new TextProperty.Builder().analyzer("standard").build()).build());
        properties.put(ElasticsearchConstants.FIELD_IMAGE_URL, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put(ElasticsearchConstants.FIELD_ORIGINAL_ID, new Property.Builder().long_(new LongNumberProperty.Builder().build()).build());
        properties.put(ElasticsearchConstants.FIELD_POPULARITY, new Property.Builder().integer(new IntegerNumberProperty.Builder().build()).build()); // Added 'popularity'
        properties.put(ElasticsearchConstants.FIELD_CREATED_AT, new Property.Builder()
                .date(new DateProperty.Builder()
                        .format("yyyy-MM-dd'T'HH:mm:ss.SSSX")
                        .build())
                .build());
        properties.put("openHour", new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put("breakTime", new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put("closedDay", new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put("address", new Property.Builder().text(new TextProperty.Builder().analyzer("standard").build()).build());
        properties.put("lat", new Property.Builder().double_(new DoubleNumberProperty.Builder().build()).build());
        properties.put("lng", new Property.Builder().double_(new DoubleNumberProperty.Builder().build()).build());
        properties.put("associatedCastNames", new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put("associatedContentNames",new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());

        // 1. n-gram 토큰 필터 정의 (이름: "autocomplete_filter")
        TokenFilterDefinition autocompleteFilterDefinition = TokenFilterDefinition.of(tf -> tf
                .ngram(ng -> ng
                        .minGram(1)   // 최소 n-gram 길이
                        .maxGram(20)  // 최대 n-gram 길이
                )
        );

        TokenFilter tokenFilter=TokenFilter.of(tf -> tf
                .definition(autocompleteFilterDefinition));

        // 2. TokenFilterDefinition을 Map에 등록
        Map<String, TokenFilter> tokenFiltersMap = new HashMap<>();
        tokenFiltersMap.put(ElasticsearchConstants.TOKEN_FILTER_AUTOCOMPLETE, tokenFilter);

        // 3. IndexSettings 생성: analyzer와 tokenFilters 모두 설정
        IndexSettings settings = new IndexSettings.Builder()
                        .analysis(analysis -> analysis
                        // "autocomplete_analyzer" 정의
                        .analyzer(ElasticsearchConstants.ANALYZER_AUTOCOMPLETE, a -> a
                                .custom(ca -> ca
                                        .tokenizer("standard")                       // 원하는 tokenizer 설정
                                        .filter("lowercase", ElasticsearchConstants.TOKEN_FILTER_AUTOCOMPLETE)  // 필터 적용 (등록된 토큰 필터 이름 사용)
                                )
                        )
                        // 별도로 등록한 token filter 설정 추가
                        .filter(tokenFiltersMap)
                )
                .maxNgramDiff(20)
                .build();


        elasticsearchUtil.createIndex(ElasticsearchConstants.SEARCH_INDEX, properties,settings);

        migrateCasts();
        migrateContents();
        migratePlaces();

        log.info("초기 mysql-elasticsearch 데이터 마이그레이션 완료");
    }

    private void settingBeforeCurationMigration(){
        log.info("========== 큐레이션 리스트 데이터 동기화 시작 ==========");

        // 인덱스가 이미 존재한다면 삭제 후 재생성(테스트 및 초기 동기화를 위한 처리)
        if (elasticsearchUtil.indexExists(ElasticsearchConstants.CURATION_INDEX)) {
            elasticsearchUtil.deleteIndex(ElasticsearchConstants.CURATION_INDEX);
        }
        log.info("새로운 인덱스 [{}]를 생성합니다.", ElasticsearchConstants.CURATION_INDEX);
        // 인덱스 매핑 설정
        Map<String, Property> properties = new HashMap<>();
        properties.put(ElasticsearchConstants.FIELD_ID, new Property.Builder()
                .keyword(new KeywordProperty.Builder().build())
                .build());
        properties.put("title", new Property.Builder()
                .text(new TextProperty.Builder()
                        .analyzer("standard")
                        .fields(Map.of(
                                "keyword", new Property.Builder()
                                        .keyword(new KeywordProperty.Builder().build())
                                        .build()
                        ))
                        .build())
                .build());
        properties.put("writerNickname", new Property.Builder()
                .keyword(new KeywordProperty.Builder().build())
                .build());
        properties.put("imageUrl", new Property.Builder()
                .keyword(new KeywordProperty.Builder().build())
                .build());
        properties.put(ElasticsearchConstants.FIELD_ORIGINAL_ID, new Property.Builder()
                .long_(new LongNumberProperty.Builder().build())
                .build());
        properties.put(ElasticsearchConstants.FIELD_CREATED_AT, new Property.Builder()
                .date(new DateProperty.Builder()
                        .format("yyyy-MM-dd'T'HH:mm:ss.SSSX")
                        .build())
                .build());

        // 인덱스 생성
        elasticsearchUtil.createIndex(ElasticsearchConstants.CURATION_INDEX, properties);

        migrateCurationLists();

        log.info("========== 큐레이션 리스트 데이터 동기화 종료 ==========");
    }

    private void migrateCurationLists(){
        // MySQL의 curation_list 데이터 조회
        List<CurationList> curationLists = curationListRepository.findAllWithWriter();
        List<CurationDocument> documents = curationLists.stream()
                .map(curation -> {
                    // 작성자 닉네임에 "@" 접두어 추가 (필요에 따라 프론트에서 처리할 수도 있음)
                    String writerNickname = "@" + curation.getWriter().getNickname();
                    return new CurationDocument(
                            "CURATION-" + curation.getId(),  // 문서 id
                            curation.getTitle(),             // 제목
                            writerNickname,                  // 작성자 닉네임
                            curation.getImageUrl(),          // 이미지 URL
                            curation.getId(),                // originalId
                            curation.getCreatedAt(),         // 생성일시
                            curation.isPublic()
                    );
                })
                .collect(Collectors.toList());

        elasticsearchCurationListRepository.saveAll(documents);
        log.info("MySQL의 큐레이션 리스트 {}건을 인덱스 [{}]로 동기화 완료", documents.size(), ElasticsearchConstants.CURATION_INDEX);
    }

    /**
     * MySQL 데이터 변경 시 Elasticsearch 동기화 메소드
     * CurationList 데이터 저장
     */
    public void indexCurationList(CurationList curationList) {
        CurationDocument doc = new CurationDocument(
                "CURATION-" + curationList.getId(),
                curationList.getTitle(),
                "@"+curationList.getWriter().getNickname(),
                curationList.getImageUrl(),
                curationList.getId(),
                curationList.getCreatedAt(),
                curationList.isPublic()
        );
        elasticsearchCurationListRepository.save(doc);
        log.info("CurationList 인덱싱 완료: {}", doc.getId());
    }

    /**
     * CurationList 인덱스 업데이트
     */
    public void updateCurationList(CurationList curationList) {
        indexCurationList(curationList);
        log.info("curationList 업데이트 완료: {}", curationList.getId());
    }

    /**
     * CurationList 인덱스 삭제
     */
    public void deleteCurationList(Long curationListId) {
        String documentId = "CURATION-" + curationListId;
        elasticsearchCurationListRepository.deleteById(documentId);
        log.info("Content 인덱스 삭제 완료: {}", documentId);
    }

    /**
     * Cast 데이터 마이그레이션
     */
    private void migrateCasts(){
        List<Cast> casts = castRepository.findAll();
        List<SearchDocument> documents = casts.stream()
                .map(SearchDocumentBuilder::fromCast)
                .collect(Collectors.toList());
        searchRepository.saveAll(documents);
        log.info("Cast 데이터 mysql -> elasticsearch 마이그레이션 완료: {} 건", documents.size());
    }

    /**
     * Content 데이터 마이그레이션
     */
    private void migrateContents(){
        List<Content> contents = contentRepository.findAll();
        List<SearchDocument> documents = contents.stream()
                .map(SearchDocumentBuilder::fromContent)
                .collect(Collectors.toList());
        searchRepository.saveAll(documents);
        log.info("Content 데이터 mysql -> elasticsearch 마이그레이션 완료: {} 건", documents.size());
    }

    /**
     * Place 데이터 마이그레이션
     */
    private void migratePlaces() {
        List<Place> places = placeRepository.findAll();
        List<SearchDocument> documents = places.stream()
                .map(place -> {
                    String key = "place:view:" + place.getId();
                    String viewCountStr = redisUtil.getValue(key);
                    int viewCount = 0;
                    if (viewCountStr != null) {
                        try {
                            viewCount = Integer.parseInt(viewCountStr);
                        } catch (NumberFormatException e) {
                            log.warn("Invalid view count for place {}: {}", place.getId(), viewCountStr);
                        }
                    }
                    return SearchDocumentBuilder.fromPlace(place, viewCount);
                })
                .collect(Collectors.toList());
        searchRepository.saveAll(documents);
        log.info("Place 데이터 mysql -> elasticsearch 마이그레이션 완료: {} 건", documents.size());
    }

    /**
     * MySQL 데이터 변경 시 Elasticsearch 동기화 메소드
     * Content 데이터 저장
     */
    public void indexContent(Content content) {
        SearchDocument doc = SearchDocumentBuilder.fromContent(content);
        searchRepository.save(doc);
        log.info("Content 인덱싱 완료: {}", doc.getId());
    }

    /**
     * Content 인덱스 업데이트
     */
    public void updateContent(Content content) {
        indexContent(content);
        log.info("Content 업데이트 완료: {}", content.getId());
    }

    /**
     * Content 인덱스 삭제
     */
    public void deleteContent(Long contentId) {
        String documentId = "CONTENT-" + contentId;
        searchRepository.deleteById(documentId);
        log.info("Content 인덱스 삭제 완료: {}", documentId);
    }

    /**
     * Cast 인덱싱 (생성 및 업데이트)
     */
    public void indexCast(Cast cast) {
        SearchDocument doc = SearchDocumentBuilder.fromCast(cast);
        searchRepository.save(doc);
        log.info("Cast 인덱싱 완료: {}", doc.getId());
    }

    /**
     * Cast 인덱스 업데이트
     */
    public void updateCast(Cast cast) {
        indexCast(cast);
        log.info("Cast 업데이트 완료: {}", cast.getId());
    }

    /**
     * Cast 인덱스 삭제
     */
    public void deleteCast(Long castId) {
        String documentId = "CAST-" + castId;
        searchRepository.deleteById(documentId);
        log.info("Cast 인덱스 삭제 완료: {}", documentId);
    }

    /**
     * Place 인덱싱 (생성 및 업데이트)
     */
    public void indexPlace(Place place) {
        String key = "place:view:" + place.getId();
        String viewCountStr = redisUtil.getValue(key);
        int viewCount = 0;
        if (viewCountStr != null) {
            try {
                viewCount = Integer.parseInt(viewCountStr);
            } catch (NumberFormatException e) {
                log.warn("Invalid view count for place {}: {}", place.getId(), viewCountStr);
            }
        }
        SearchDocument doc = SearchDocumentBuilder.fromPlace(place, viewCount);
        searchRepository.save(doc);
        log.info("Place 인덱싱 완료: {}", doc.getId());
    }

    /**
     * Place 인덱스 업데이트
     */
    public void updatePlace(Place place) {
        indexPlace(place);
        log.info("Place 업데이트 완료: {}", place.getId());
    }

    /**
     * Place 인덱스 삭제
     */
    public void deletePlace(Long placeId) {
        String documentId = "PLACE-" + placeId;
        searchRepository.deleteById(documentId);
        log.info("Place 인덱스 삭제 완료: {}", documentId);
    }
}
