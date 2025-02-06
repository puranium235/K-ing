package com.king.backend.search.config;

/**
 * Elasticsearch 관련 공통 상수 정의 클래스.
 */
public final class ElasticsearchConstants {
    // 인덱스 이름
    public static final String SEARCH_INDEX = "search-index";
    public static final String CURATION_INDEX = "curation-index";

    // 필드 이름
    public static final String FIELD_NAME = "name";
    public static final String FIELD_CATEGORY = "category";
    public static final String FIELD_ID = "id";
    public static final String FIELD_CREATED_AT = "createdAt";
    public static final String FIELD_DETAILS = "details";
    public static final String FIELD_IMAGE_URL = "imageUrl";
    public static final String FIELD_ORIGINAL_ID = "originalId";
    public static final String FIELD_POPULARITY = "popularity";
    public static final String FIELD_TYPE = "type";

    // Analyzer 및 Token Filter 이름
    public static final String ANALYZER_AUTOCOMPLETE = "autocomplete_analyzer";
    public static final String TOKEN_FILTER_AUTOCOMPLETE = "autocomplete_filter";

    private ElasticsearchConstants() {
        // 상수 클래스는 인스턴스화하지 않음.
    }
}
