# 병원동행 백엔드

Spring Boot 3.4 · Java 17 · MySQL · JWT

## 로컬 실행
1. MySQL에 DB 만들기: `CREATE DATABASE hospital;`
2. DB 계정이 root/1234가 아니면 환경변수 `DB_USERNAME`, `DB_PASSWORD` 설정
3. IntelliJ에서 `HospitalApplication` 실행
4. http://localhost:8080/api/health → `ok`
5. API 문서: http://localhost:8080/swagger-ui.html

## 패키지 규칙
- `global/` 공통 코드 (수정은 단톡에 공유 후)
- 도메인 폴더(`request/` 등) 안에 `controller`, `service`, `repository`, `entity`, `dto` 만들어서 작업
- 엔티티는 `extends BaseEntity`
- 응답은 `ApiResponse.ok(data)`, 에러는 `throw new CustomException(ErrorCode.XXX)`
- 로그인 유저: `@AuthenticationPrincipal LoginUser user`
- 역할 제한: `@PreAuthorize("hasRole('GUARDIAN')")` / `hasRole('VOLUNTEER')`

## 브랜치
`feat/{도메인}-{기능}` → PR → 1명 리뷰 후 main 머지
