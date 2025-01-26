package com.king.backend.externaldata.service;

import com.king.backend.externaldata.config.AppProperties;
import com.king.backend.externaldata.entity.Cast;
import com.king.backend.externaldata.entity.Content;
import com.king.backend.externaldata.entity.ContentCast;
import com.king.backend.externaldata.repository.CastRepository;
import com.king.backend.externaldata.repository.ContentCastRepository;
import com.king.backend.externaldata.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TmdbService {
    private final AppProperties appProperties;
    private final CastRepository castRepository;
    private final RestTemplate restTemplate;
    private final ContentRepository contentRepository;
    private final ContentCastRepository contentCastRepository;

    /**
     * TMDB 영화 데이터를 2000년 1월부터 현재 년도까지 월 단위로 조회하여,
     * original_language가 "ko"인 영화만 필터링 후, 상세 정보를 조회하여 Content 테이블에 저장합니다.
     *
     * Content 테이블 매핑:
     * - content_type : "MOVIE"
     * - title        : 영화 제목
     * - broadcast    : production_companies 배열에서 각 회사의 name을 콤마(,)로 연결한 문자열
     * - description  : 영화 개요 (overview)
     * - created_at   : 현재 시간
     * - image_url    : "https://image.tmdb.org/t/p/w500" + poster_path
     * - tmdb_id      : 영화의 TMDB ID
     */
    public void fetchAndSavePopularMovies() {
        String baseUrl = appProperties.getTmdbApi().getBaseUrl();
        String apiKey = appProperties.getTmdbApi().getKey();

        // 1900년 1월부터 현재 YearMonth까지 반복
        YearMonth startMonth = YearMonth.of(2000, 1);
        YearMonth endMonth = YearMonth.now();

        for (YearMonth ym = startMonth; !ym.isAfter(endMonth); ym = ym.plusMonths(1)) {
            String releaseGte = ym.atDay(1).toString();       // 예: "2020-01-01"
            String releaseLte = ym.atEndOfMonth().toString();   // 예: "2020-01-31"
            System.out.println("==== 영화 데이터 조회 기간: " + releaseGte + " ~ " + releaseLte + " 시작 ====");

            int page = 1;
            int totalPages = 1; // 최초 호출 후 업데이트

            do {
                // Discover Movie API를 사용, language=ko 적용 및 release_date 범위 지정
                String url = baseUrl + "/discover/movie?api_key=" + apiKey
                        + "&language=ko"
                        + "&sort_by=popularity.desc"
                        + "&include_adult=false"
                        + "&page=" + page
                        + "&release_date.gte=" + releaseGte
                        + "&release_date.lte=" + releaseLte;
                ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
                Map body = response.getBody();
                if (body == null) {
                    System.out.println("TMDB 영화 API 응답 없음. URL: " + url);
                    break;
                }
                if (page == 1 && body.get("total_pages") != null) {
                    totalPages = Integer.parseInt(body.get("total_pages").toString());
                    // 최대 500페이지 제한
                    if (totalPages > 500) {
                        totalPages = 500;
                    }
                }
                List<Map<String, Object>> results = (List<Map<String, Object>>) body.get("results");
                if (results != null) {
                    for (Map<String, Object> movie : results) {
                        // original_language 필터: "ko"인지 확인
                        Object origLangObj = movie.get("original_language");
                        if (origLangObj == null || !"ko".equals(origLangObj.toString())) {
                            continue;
                        }
                        Integer movieId = (Integer) movie.get("id");
                        if (movieId == null) continue;

                        // 상세 정보 조회: language=ko 적용
                        String detailsUrl = baseUrl + "/movie/" + movieId
                                + "?api_key=" + apiKey + "&language=ko";
                        ResponseEntity<Map> detailsResponse = restTemplate.getForEntity(detailsUrl, Map.class);
                        Map<String, Object> details = detailsResponse.getBody();
                        if (details == null) {
                            System.out.println("TMDB 영화 상세 정보 없음. TMDB ID: " + movieId);
                            continue;
                        }

                        String title = (String) details.get("title");
                        String overview = (String) details.get("overview");

                        // broadcast: production_companies 배열에서 각 회사의 name을 추출, 콤마로 연결
                        String broadcast = null;
                        List<Map<String, Object>> companies = (List<Map<String, Object>>) details.get("production_companies");
                        if (companies != null && !companies.isEmpty()) {
                            broadcast = companies.stream()
                                    .map(comp -> (String) comp.get("name"))
                                    .collect(Collectors.joining(", "));
                        }

                        String posterPath = (String) details.get("poster_path");
                        String imageUrl = null;
                        if (posterPath != null) {
                            imageUrl = "https://image.tmdb.org/t/p/w500" + posterPath;
                        }

                        // Content 객체 생성 및 DB 저장
                        Content content = contentRepository.findByTitle(title).orElseGet(Content::new);
                        content.setContentType("MOVIE");
                        content.setTitle(title);
                        content.setBroadcast(broadcast);
                        content.setDescription(overview);
                        content.setCreatedAt(LocalDateTime.now());
                        content.setImageUrl(imageUrl);
                        content.setTmdbId(movieId);

                        contentRepository.save(content);
                        System.out.println("저장된 영화: " + title + " (TMDB ID: " + movieId + ")");
                    }
                }
                page++;
            } while (page <= totalPages);

            System.out.println("==== 영화 데이터 조회 기간: " + releaseGte + " ~ " + releaseLte + " 완료 ====");
        }
    }

    /**
     * TV 프로그램 데이터를 1년 단위의 월별로 조회하여,
     * original_language가 "ko"인 프로그램만 Content 테이블에 저장합니다.
     * broadcast: TV 상세 정보의 networks 배열에서 첫 번째 네트워크의 이름
     * content_type: genres 배열에 "드라마" 관련 장르가 있으면 DRAMA, 그렇지 않으면 SHOW
     */
    public void fetchAndSavePopularTVPrograms() {
        String baseUrl = appProperties.getTmdbApi().getBaseUrl();
        String apiKey = appProperties.getTmdbApi().getKey();
        // 조회할 기간 설정: 예를 들어 2010년부터 현재까지
        int startYear = 2000;
        int endYear = Year.now().getValue();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int year = startYear; year <= endYear; year++) {
            // 각 연도의 1월부터 12월까지
            for (int month = 1; month <= 12; month++) {
                LocalDate startDate = LocalDate.of(year, month, 1);
                LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
                String firstAirDateGte = startDate.format(dtf);
                String firstAirDateLte = endDate.format(dtf);

                System.out.println("==== TV 프로그램 조회 기간: " + firstAirDateGte + " ~ " + firstAirDateLte + " 시작 ====");

                int page = 1;
                int totalPages = 1; // 첫 페이지 호출 후 업데이트

                do {
                    // Discover TV API로 월별 조회 (language=ko 적용)
                    String url = baseUrl + "/discover/tv?api_key=" + apiKey +
                            "&language=ko" +
                            "&sort_by=popularity.desc" +
                            "&page=" + page +
                            "&include_null_first_air_dates=false" +
                            "&first_air_date.gte=" + firstAirDateGte +
                            "&first_air_date.lte=" + firstAirDateLte;
                    ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
                    Map body = response.getBody();
                    if (body == null) {
                        System.out.println("TMDB TV 프로그램 API 응답 없음. URL: " + url);
                        break;
                    }
                    if (page == 1 && body.get("total_pages") != null) {
                        totalPages = Integer.parseInt(body.get("total_pages").toString());
                        // 최대 500페이지 제한 적용
                        if (totalPages > 500) {
                            totalPages = 500;
                        }
                    }
                    List<Map<String, Object>> results = (List<Map<String, Object>>) body.get("results");
                    if (results != null) {
                        for (Map<String, Object> tv : results) {
                            // original_language 필터
                            Object origLangObj = tv.get("original_language");
                            if (origLangObj == null || !"ko".equals(origLangObj.toString())) {
                                continue;
                            }
                            Integer tvId = (Integer) tv.get("id");
                            if (tvId == null) continue;

                            // 상세 정보 조회: /tv/{tv_id}?api_key=...&language=ko
                            String detailsUrl = baseUrl + "/tv/" + tvId + "?api_key=" + apiKey + "&language=ko";
                            ResponseEntity<Map> detailsResponse = restTemplate.getForEntity(detailsUrl, Map.class);
                            Map<String, Object> details = detailsResponse.getBody();
                            if (details == null) {
                                System.out.println("TMDB TV 상세 정보 없음. TMDB ID: " + tvId);
                                continue;
                            }

                            String title = (String) details.get("name");
                            String overview = (String) details.get("overview");

                            // broadcast: networks 배열에서 첫 번째 네트워크의 name 추출
                            String broadcast = null;
                            List<Map<String, Object>> networks = (List<Map<String, Object>>) details.get("networks");
                            if (networks != null && !networks.isEmpty()) {
                                broadcast = networks.get(0).get("name") != null ?
                                        networks.get(0).get("name").toString() : null;
                            }

                            // content_type 결정: genres 배열에서 "드라마" 관련 장르가 존재하면 DRAMA, 아니면 SHOW
                            String contentType = "SHOW";
                            List<Map<String, Object>> genres = (List<Map<String, Object>>) details.get("genres");
                            if (genres != null && !genres.isEmpty()) {
                                boolean isDrama = genres.stream()
                                        .anyMatch(genre -> {
                                            String genreName = (String) genre.get("name");
                                            return genreName != null && genreName.contains("드라마");
                                        });
                                contentType = isDrama ? "DRAMA" : "SHOW";
                            }

                            String posterPath = (String) details.get("poster_path");
                            String imageUrl = null;
                            if (posterPath != null) {
                                imageUrl = "https://image.tmdb.org/t/p/w500" + posterPath;
                            }

                            // Content 객체 생성 및 DB 저장
                            Content content = contentRepository.findByTitle(title).orElseGet(Content::new);
                            content.setContentType(contentType);
                            content.setTitle(title);
                            content.setBroadcast(broadcast);
                            content.setDescription(overview);
                            content.setCreatedAt(LocalDateTime.now());
                            content.setImageUrl(imageUrl);
                            content.setTmdbId(tvId);

                            contentRepository.save(content);
                            System.out.println("저장된 TV 프로그램: " + title + " (TMDB ID: " + tvId + ", content_type: " + contentType + ")");
                        }
                    }
                    page++;
                } while (page <= totalPages);

                System.out.println("==== TV 프로그램 조회 기간: " + firstAirDateGte + " ~ " + firstAirDateLte + " 완료 ====");
            }
        }
    }

    /**
     * 기존 Content 데이터를 기반으로 각 작품의 크레딧을 조회하고,
     * 'Acting' 부서의 출연 인물만 Cast 테이블에 저장하며, participatingWorks 필드를 설정합니다.
     */
    public void fetchAndSaveCastFromContent() {
        List<Content> contents = contentRepository.findAll();
        System.out.println("===== 크레딧 데이터 조회 시작 =====");

        for (Content content : contents) {
            Integer tmdbId = content.getTmdbId();
            String contentType = content.getContentType();
            String creditsUrl = null;

            if ("MOVIE".equalsIgnoreCase(contentType)) {
                creditsUrl = appProperties.getTmdbApi().getBaseUrl() + "/movie/" + tmdbId + "/credits?api_key=" + appProperties.getTmdbApi().getKey() + "&language=ko";
            } else if ("DRAMA".equalsIgnoreCase(contentType) || "SHOW".equalsIgnoreCase(contentType)) {
                creditsUrl = appProperties.getTmdbApi().getBaseUrl() + "/tv/" + tmdbId + "/credits?api_key=" + appProperties.getTmdbApi().getKey() + "&language=ko";
            } else {
                System.out.println("알 수 없는 content_type: " + contentType + " (tmdb_id: " + tmdbId + ")");
                continue;
            }

            try {
                ResponseEntity<Map> response = restTemplate.getForEntity(creditsUrl, Map.class);
                Map<String, Object> body = response.getBody();
                if (body == null || !body.containsKey("cast")) {
                    System.out.println("크레딧 정보 없음. TMDB ID: " + tmdbId);
                    continue;
                }

                List<Map<String, Object>> casts = (List<Map<String, Object>>) body.get("cast");
                for (Map<String, Object> castEntry : casts) {
                    String knownForDepartment = castEntry.get("known_for_department") != null ? castEntry.get("known_for_department").toString() : "";
                    if (!"Acting".equalsIgnoreCase(knownForDepartment)) {
                        continue; // 'Acting' 부서의 인물만 처리
                    }

                    Integer personId = castEntry.get("id") instanceof Integer ? (Integer) castEntry.get("id") : null;
                    if (personId == null) continue;

                    // 인물 상세 정보 조회
                    String detailsUrl = appProperties.getTmdbApi().getBaseUrl() + "/person/" + personId + "?api_key=" + appProperties.getTmdbApi().getKey() + "&language=ko";
                    ResponseEntity<Map> detailsResponse = restTemplate.getForEntity(detailsUrl, Map.class);
                    Map<String, Object> detailsBody = detailsResponse.getBody();
                    if (detailsBody == null) {
                        System.out.println("TMDB 인물 상세 정보 없음. TMDB ID: " + personId);
                        continue;
                    }

                    String name = (String) detailsBody.get("name");
                    String birthday = detailsBody.get("birthday") != null ? detailsBody.get("birthday").toString() : null;
                    String placeOfBirth = detailsBody.get("place_of_birth") != null ? detailsBody.get("place_of_birth").toString() : null;
                    String profilePath = (String) detailsBody.get("profile_path");
                    String imgUrl = profilePath != null ? "https://image.tmdb.org/t/p/w500" + profilePath : null;

                    // 인물의 전체 출연 작품 수 조회
                    String combinedCreditsUrl = appProperties.getTmdbApi().getBaseUrl() + "/person/" + personId + "/combined_credits?api_key=" + appProperties.getTmdbApi().getKey() + "&language=ko";
                    ResponseEntity<Map> combinedCreditsResponse = restTemplate.getForEntity(combinedCreditsUrl, Map.class);
                    Map<String, Object> combinedCreditsBody = combinedCreditsResponse.getBody();
                    if (combinedCreditsBody == null || !combinedCreditsBody.containsKey("cast")) {
                        System.out.println("인물 크레딧 정보 없음. TMDB ID: " + personId);
                        continue;
                    }

                    List<Map<String, Object>> combinedCasts = (List<Map<String, Object>>) combinedCreditsBody.get("cast");
                    // 'Acting' 부서의 출연 작품 수를 계산
                    int participatingWorksCount = combinedCasts.size();

                    // Cast 엔티티 생성 또는 업데이트
                    Optional<Cast> existingCastOpt = castRepository.findByTmdbId(personId);
                    Cast cast;
                    if (existingCastOpt.isPresent()) {
                        cast = existingCastOpt.get();
                        cast.setName(name);
                        cast.setImgUrl(imgUrl);
                        cast.setParticipatingWorks((long) participatingWorksCount);
                        cast.setBirthDate(birthday);
                        cast.setBirthPlace(placeOfBirth);
                        cast.setCreatedAt(LocalDateTime.now());
                    } else {
                        cast = new Cast();
                        cast.setName(name);
                        cast.setImgUrl(imgUrl);
                        cast.setParticipatingWorks((long) participatingWorksCount);
                        cast.setBirthDate(birthday);
                        cast.setBirthPlace(placeOfBirth);
                        cast.setCreatedAt(LocalDateTime.now());
                        cast.setTmdbId(personId);
                    }
                    castRepository.save(cast);
                    System.out.println("저장/업데이트된 TMDB 인물: " + name + " (TMDB ID: " + personId + "), 참여 작품 수: " + participatingWorksCount);
                }
            } catch (Exception e) {
                System.out.println("크레딧 조회 오류. TMDB ID: " + tmdbId + " - " + e.getMessage());
            }
        }

        System.out.println("===== 크레딧 데이터 조회 완료 =====");
    }

    /**
     * Content 테이블의 모든 콘텐츠 유형(MOVIE, SHOW, DRAMA)을 대상으로 크레딧을 조회하고,
     * Cast 테이블과 연동하여 content_cast 테이블을 업데이트합니다.
     */
    @Transactional
    public void populateContentCast() {
        List<Content> contents = contentRepository.findAll();
        System.out.println("===== content_cast 데이터 업데이트 시작 =====");

        for (Content content : contents) {
            Integer tmdbId = content.getTmdbId();
            String contentType = content.getContentType();

            String creditsUrl = null;

            if ("MOVIE".equalsIgnoreCase(contentType)) {
                creditsUrl = appProperties.getTmdbApi().getBaseUrl() + "/movie/" + tmdbId + "/credits?api_key=" + appProperties.getTmdbApi().getKey() + "&language=ko";
            } else if ("SHOW".equalsIgnoreCase(contentType) || "DRAMA".equalsIgnoreCase(contentType)) {
                creditsUrl = appProperties.getTmdbApi().getBaseUrl() + "/tv/" + tmdbId + "/credits?api_key=" + appProperties.getTmdbApi().getKey() + "&language=ko";
            } else {
                System.out.println("알 수 없는 content_type: "+contentType+" (tmdb_id: "+tmdbId+")");
                continue;
            }

            try {
                ResponseEntity<Map> response = restTemplate.getForEntity(creditsUrl, Map.class);
                Map<String, Object> body = response.getBody();

                if (body == null || !body.containsKey("cast")) {
                    System.out.println("크레딧 정보 없음. TMDB ID: "+tmdbId);
                    continue;
                }

                List<Map<String, Object>> casts = (List<Map<String, Object>>) body.get("cast");
                for (Map<String, Object> castEntry : casts) {
                    String knownForDepartment = castEntry.get("known_for_department") != null ? castEntry.get("known_for_department").toString() : "";
                    if (!"Acting".equalsIgnoreCase(knownForDepartment)) {
                        continue; // 'Acting' 부서의 인물만 처리
                    }

                    Integer personId = castEntry.get("id") instanceof Integer ? (Integer) castEntry.get("id") : null;
                    if (personId == null) continue;

                    // Cast 테이블에서 인물 조회
                    Optional<Cast> castOpt = castRepository.findByTmdbId(personId);
                    if (!castOpt.isPresent()) {
                        System.out.println("Cast 테이블에 존재하지 않는 인물 TMDB ID: "+personId);
                        continue;
                    }
                    Cast cast = castOpt.get();

                    // role: character 필드에서 가져오기
                    String role = castEntry.get("character") != null ? castEntry.get("character").toString() : null;

                    // ContentCast 엔티티 조회 또는 생성
                    Optional<ContentCast> contentCastOpt = contentCastRepository.findByContentAndCast(content, cast);
                    ContentCast contentCast;
                    if (contentCastOpt.isPresent()) {
                        contentCast = contentCastOpt.get();
                        contentCast.setRole(role);
                    } else {
                        contentCast = new ContentCast();
                        contentCast.setContent(content);
                        contentCast.setCast(cast);
                        contentCast.setRole(role);
                    }

                    contentCastRepository.save(contentCast);
                    System.out.println("content_cast에 저장된 관계: Content ID "+content.getId()+", Cast ID "+cast.getId()+", Role: "+role);
                }
            } catch (Exception e) {
                System.out.println("크레딧 조회 오류. TMDB ID: "+tmdbId+" - "+e.getMessage());
            }
        }

        System.out.println("===== content_cast 데이터 업데이트 완료 =====");
    }
}
