package com.king.backend.search.util;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch._types.mapping.Property;
import co.elastic.clients.elasticsearch._types.mapping.TypeMapping;
import co.elastic.clients.elasticsearch.indices.*;
import lombok.RequiredArgsConstructor;
import org.elasticsearch.client.RequestOptions;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

/**
 * Elasticsearch 유틸리티 클래스
 */
@Component
@RequiredArgsConstructor
public class ElasticsearchUtil {

    private final ElasticsearchClient client;

    /**
     * 인덱스 존재 여부 확인
     */
    public boolean indexExists(String indexName) {
        GetIndexRequest request = new GetIndexRequest.Builder()
                .index(indexName)
                .build();
        try {
            GetIndexResponse response = client.indices().get(request);
            return response.result().containsKey(indexName);
        } catch (ElasticsearchException e) {
            // Elasticsearch에서 인덱스가 없을 때 발생하는 예외를 명확하게 처리
            if (e.getMessage().contains("index_not_found_exception")) {
                System.out.println("🔍 인덱스가 존재하지 않음: " + indexName);
                return false;
            }
            e.printStackTrace();
            return false;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 인덱스 생성
     */
    public void createIndex(String indexName, Map<String, Property> properties, IndexSettings settings) {
        if (!indexExists(indexName)) {
            CreateIndexRequest request = new CreateIndexRequest.Builder()
                    .index(indexName)
                    .settings((IndexSettings) settings)
                    .mappings(new TypeMapping.Builder().properties(properties).build())
                    .build();
            try {
                CreateIndexResponse response = client.indices().create(request);
                if (response.acknowledged()) {
                    System.out.println("인덱스 생성 완료: " + indexName);
                } else {
                    System.out.println("인덱스 생성 실패: " + indexName);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }else {
            System.out.println("이미 존재하는 인덱스: " + indexName);
        }
    }

    /**
     * 기존 createIndex() 메소드 (settings 없이) - 필요시 유지
     */
    public void createIndex(String indexName, Map<String, Property> properties) {
        createIndex(indexName, properties, IndexSettings.of(s -> s)); // 빈 settings 전달
    }

    public void deleteIndex(String indexName) {
        try {
            client.indices().delete(d -> d.index(indexName));
            System.out.println("인덱스 삭제 완료: " + indexName);
        } catch (IOException e) {
            System.out.println("인덱스 삭제 중 오류 발생: " + e.getMessage());
        }
    }
}
