# 같이가요 (Gachigayo) — Backend API Server

경북·대구 세대 연결 병원 동행 서비스 **같이가요**의 Spring Boot 백엔드 서버입니다.

## 🌐 배포 및 API 문서

* **Production API URL**: https://dandython-production.up.railway.app
* **Swagger UI**: https://dandython-production.up.railway.app/swagger-ui.html
* **OpenAPI Spec**: https://dandython-production.up.railway.app/v3/api-docs

---

## 🛠 기술 스택

* **Language & Framework**: Java 17, Spring Boot 3.4.5
* **ORM & Database**: Spring Data JPA, MySQL 8
* **Authentication**: Spring Security, JWT (`io.jsonwebtoken:jjwt 0.12.6`)
* **Validation & Docs**: Jakarta Bean Validation, SpringDoc OpenAPI (`2.8.6`)
* **Build & Deploy**: Gradle, Railway

---

## 📦 패키지 구조

```text
com.dandi.hospital
├─ auth/          # 회원가입(POST /api/auth/signup), 로그인(POST /api/auth/login)
├─ user/          # 내 정보 조회(GET /api/users/me), 약관 동의(Consent) 엔티티
├─ volunteer/     # 봉사자 프로필 저장·조회(GET/PUT /api/volunteers/me, GET /api/volunteers/{userId})
├─ senior/        # 동행받는 분 등록·조회(POST /api/seniors, GET /api/seniors/me)
├─ hospital/      # 대구 5대 대학병원 시드 데이터 초기화 및 조회(GET /api/hospitals)
├─ request/       # 동행 요청 등록(POST /api/requests), 모집 게시판 조회(GET /api/requests)
├─ application/   # 동행 봉사 신청(POST /api/requests/{requestId}/applications) 및 매칭
├─ visit/         # 동행 체크인/체크아웃, 단계별 체크리스트, 봉사 인정 시간 계산, 진료 메모 및 AI 요약
└─ global/
   ├─ config/     # JPA Auditing, Swagger 설정
   ├─ entity/     # BaseEntity, JSON/List 컨버터
   ├─ enums/      # 도메인 상태 Enum (RequestStatus, ApplicationStatus, VisitStep, Need 등)
   ├─ exception/  # ErrorCode, CustomException, GlobalExceptionHandler
   ├─ response/   # 표준 응답 래퍼 (ApiResponse<T>)
   └─ security/   # JwtProvider, JwtAuthenticationFilter, SecurityConfig
```

---

## ⚙️ 실행 방법

### 1. 환경변수 설정
기본적으로 `local` 프로파일로 동작하며, 배포 환경에서는 `SPRING_PROFILES_ACTIVE=prod`와 함께 아래 환경변수를 주입합니다.

| 환경변수 | 설명 | 기본값 (local) |
| :--- | :--- | :--- |
| `PORT` | 서버 실행 포트 | `8080` |
| `SPRING_PROFILES_ACTIVE` | 실행 프로파일 (`local` / `prod`) | `local` |
| `DB_URL` | MySQL JDBC URL | 로컬 MySQL 설정 |
| `DB_USERNAME` | DB 사용자명 | 로컬 설정 |
| `DB_PASSWORD` | DB 비밀번호 | 로컬 설정 |
| `JWT_SECRET` | JWT 서명 시크릿 키 (32바이트 이상) | 개발용 기본 키 |
| `CORS_ORIGINS` | 허용할 프론트엔드 Origin 목록 (콤마 구분) | `http://localhost:3000,http://localhost:5173` |

### 2. 빌드 및 실행

```bash
# 테스트 및 빌드
./gradlew build

# 서버 실행
./gradlew bootRun
```
