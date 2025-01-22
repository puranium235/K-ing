package com.king.backend.connection;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;

@Getter
@Setter
@Document(indexName = "logstash-*")
public class Log {
    @Id
    private String id;
    private String message;
    private String timestamp;
}
