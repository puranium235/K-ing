# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**K-ING Backend** — A Spring Boot backend for a Korean drama/entertainment filming location discovery platform. Users can find places featured in K-dramas and movies, create curations, write posts, and chat with an AI assistant. Supports 4 languages: Korean (ko), English (en), Japanese (ja), Chinese (zh).

## Build & Run Commands

```bash
# Build
./gradlew build

# Build JAR (skip tests)
./gradlew bootJar

# Run
./gradlew bootRun

# Run tests
./gradlew test

# Run a single test class
./gradlew test --tests "com.king.backend.SomeTestClass"

# Docker (requires .env file)
docker-compose up --build
```

## Tech Stack

- **Java 17**, Spring Boot 3.4.1, Gradle (Kotlin DSL)
- **MySQL 8** (JPA/Hibernate), **Redis** (caching/tokens), **Elasticsearch 8.17** (search)
- **Spring Security** with OAuth2 (Google, LINE) + JWT (stateless sessions)
- **Spring AI** with OpenAI (GPT-4o-mini) for AI chatbot via WebSocket
- **AWS S3** for image storage, **Google Cloud Translate** for translations
- **Firebase Cloud Messaging (FCM)** for push notifications
- API docs: **SpringDoc OpenAPI** (Swagger UI at `/api/swagger-ui.html`)

## Architecture

### Package Structure

- `com.king.backend.global` — Cross-cutting concerns (security, exception handling, configs, utilities)
- `com.king.backend.domain.*` — Domain modules (cast, content, place, curation, post, favorite, user, fcm)
- `com.king.backend.search` — Elasticsearch search module (separate from domain, handles search/autocomplete/ranking)
- `com.king.backend.ai` — AI chatbot module (WebSocket-based chat with RAG using Elasticsearch)
- `com.king.backend.datasetting` — Data ingestion from external APIs (TMDB, public data schedulers)

### Key Patterns

**Domain module structure** — Each domain follows: `controller/` → `service/` → `repository/` with `entity/`, `dto/request/`, `dto/response/`, `errorcode/`.

**i18n/Translation pattern** — Entities like Cast, Content have per-language translation tables (`CastKo`, `CastEn`, `CastJa`, `CastZh`) implementing a shared `CastTranslation` interface. The base entity has a `getTranslation(String language)` method to resolve the right translation. Supported languages: `ko`, `en`, `ja`, `zh`.

**Error handling** — Domain-specific error codes are enums implementing `ErrorCode` interface (returns `HttpStatus`, `code`, `message`). Thrown via `CustomException`. All REST responses use `ApiResponse<T>` wrapper with `success`, `data`, `code`, `message` fields.

**Elasticsearch sync** — JPA `EntityListener` classes (e.g., `CastListener`, `PlaceListener`, `CurationListListener`) sync entity changes to Elasticsearch indices on persist/update/remove.

**Auth flow** — OAuth2 login → `CustomSuccessHandler` issues JWT → `JWTFilter` validates on each request. Roles: `ROLE_PENDING` (pre-signup), `ROLE_REGISTERED` (completed signup). Tokens stored in Redis via `TokenRepository`.

**AI chatbot** — WebSocket-based (`/ws/**` bypasses security). Uses RAG: summarizes conversation → searches Elasticsearch for places/curations → generates response via OpenAI streaming. Chat history stored in Redis.

### Configuration

All config via environment variables (see `application.yml`). Requires `.env` file for Docker. Server runs on port 8080 with context path `/api`.

### Infrastructure (docker-compose)

MySQL (port 3305→3306), Redis (port 6378→6379), Elasticsearch (port 9200), Spring Boot app (port 8080). All on `king` bridge network.
