# 같이가요 (Gachigayo) — 대구·경북 세대 연결 병원 동행 서비스

> **"남의 할매니도 우리 할매니처럼"**  
> 경북 어르신의 대구 대형병원 진료 길에 대구 지역 대학생 봉사자가 만남부터 진료·약국 동행·귀가 배웅까지 함께하고, **AI 진료 요약**으로 타지 가족의 안심까지 잇는 병원 동행 플랫폼입니다.

---

## 🌐 배포 주소 (Live Demo)

| 구분 | URL | 비고 |
| :--- | :--- | :--- |
| **Frontend (Netlify)** | https://dandython.netlify.app | 모바일 웹 최적화 (390px 프레임 / 모바일 전체 화면) |
| **Backend API (Railway)** | https://dandython-production.up.railway.app | Spring Boot REST API |
| **Swagger API 문서** | https://dandython-production.up.railway.app/swagger-ui.html | OpenAPI 3.1 명세 |

---

## 💡 기획 배경 및 핵심 가치 (RESONANCE)

* **지역 의료 인프라 격차**: 경북은 상급종합병원이 0곳이며, 총진료비의 **40.3%(연 2조 1,017억 원)**가 대구 등 관외로 지출됩니다. 경북 어르신에게 대구 대형병원 방문은 일상이지만, 청년 유출로 동행할 자녀는 타지에 있습니다.
* **제도적 사각지대 해소**: 기존 병원동행 시범사업(장기요양 1~5등급 대상) 밖에 있는 **비등급·자립 보행 가능 어르신**과 **타지 거주 가족**, 그리고 **의미 있는 지역 봉사를 찾는 대구 대학생**을 하나로 연결합니다.
* **경상도식 정(情)의 재해석**: *"괜찮다, 바쁜데 신경 쓰지 마라"*라는 부모님의 무뚝뚝함을 **'부탁하지 못하는 마음'**으로 읽고, 고향이 같거나 인접한 지역 청년이 손주처럼 동행하는 반복 가능한 구조를 만듭니다.

---

## ✨ 주요 기능

### 1. 단일 계정 · 양방향 모드 전환 (`동행 요청 모드` ↔ `동행하기 모드`)
* 하나의 계정으로 가족(또는 본인)을 위해 **동행을 요청**하거나, 대학생 봉사자로서 **동행에 참여**할 수 있습니다.
* 모드 첫 진입 시 역할별 맞춤 필수 약관(어르신 대리 등록 확인, 봉사자 활동·비밀유지 서약 등)을 분리 수집합니다.

### 2. 대구·경북 특화 동행 요청 등록 및 1:1 매칭
* 대구 5대 대학병원(경북대병원, 칠곡경북대병원, 계명대 동산병원, 영남대병원, 대구가톨릭대병원) 사전 탑재
* **대구 주요 역·터미널 빠른 선택**: 시외버스·기차로 도착하는 경북 어르신을 위한 `동대구역`, `동대구터미널`, `북부정류장`, `서부정류장` 퀵 버튼 제공
* 필요한 도움(`보행 지지`, `휠체어 보조`, `검사실 동행`, `약국 동행`, `귀가 차편 배웅`) 선택 및 신청자 프로필·재학 인증·후기 확인 후 1:1 매칭 확정

### 3. 단계별 실시간 동행 체크리스트 & 알림
* `만남 완료(체크인)` → `접수` → `진료·검사` → `수납` → `약국 동행` → `배웅 완료(체크아웃)` 단계별 진행 시각 기록
* 요청자(가족) 화면에서 실시간 진행 단계 확인 및 FCM 웹 푸시 알림 연동

### 4. 어르신 현장 큰 글씨 동의 & AI 진료 요약 (`AI-1`)
* **현장 본인 동의 모달**: 진료 메모 작성 전, 동행받는 분이 직접 확인하고 누를 수 있는 **24px+ 큰 글씨 동의 모달**을 통해 민감 건강정보 수집 동의를 받습니다.
* **AI 진료 요약**: 봉사자가 작성한 진료 메모를 LLM이 분석하여 요청자 눈높이에 맞춘 **① 오늘 들은 내용 3줄, ② 다음 진료 일정, ③ 처방약·복약 안내, ④ 챙겨야 할 일** 카드로 변환합니다.
* **안전장치 (Fallback & 개인정보 보호)**: AI 전송 시 이름·연락처 등 개인식별정보를 제외하며, 의학적 판단을 추가하지 않습니다. 응답 지연(10초 초과) 안내 및 요약 실패 시 **메모 원문 자동 전달(Fallback)**을 지원합니다.

### 5. 실제 시간 기반 봉사시간 산정 & 동행 확인서 발급
* 만남 체크인부터 배웅 체크아웃까지의 실제 소요 시간을 30분 단위로 자동 산정하고, 요청자의 **봉사시간 승인 및 감사 한마디** 후 대학·지자체 제출용 **봉사 확인서**를 발급합니다.

---

## 🛠 기술 스택 (Tech Stack)

### Frontend (`/FE`)
* **Framework**: React 19, TypeScript, Vite 8
* **Routing & State**: React Router v7, Context API (`AuthContext`), Custom Hooks (`useApi`, `useAction`)
* **Styling**: CSS Variables (Figma Design Tokens 1:1 매핑), Mobile-First Responsive UI
* **Notification & Deployment**: Firebase Cloud Messaging (FCM Web Push), Netlify

### Backend (`/BE`)
* **Framework**: Java 17, Spring Boot 3.4.5
* **Security & Auth**: Spring Security, JWT (`jjwt 0.12.6`)
* **Database & ORM**: MySQL, Spring Data JPA (Hibernate JSON Column 매핑)
* **Documentation & Deployment**: SpringDoc OpenAPI (Swagger UI), Railway

---

## 📂 프로젝트 폴더 구조

```text
DANDYTHON/
├─ FE/                          # React + TypeScript 프론트엔드
│  ├─ public/                   # 정적 에셋, FCM 서비스 워커, SPA _redirects
│  └─ src/
│     ├─ api/                   # REST API 클라이언트(JWT/에러 핸들링), 타입, 서비스 함수
│     ├─ auth/                  # 단일 계정 세션 및 모드 전환 컨텍스트
│     ├─ components/common/     # 공통 UI 컴포넌트 (Button, BigButton, Chip, Character 등)
│     ├─ screens/
│     │  ├─ common/             # 시작, 로그인/가입, 모드 약관, 알림 화면
│     │  ├─ guardian/           # 동행 요청 모드 (홈, 신청, 신청자 수락, 현황, AI 리포트, MY)
│     │  └─ volunteer/          # 동행하기 모드 (홈, 게시판, 진행 체크리스트, 진료 메모/AI 요약, 확인서)
│     └─ styles/                # 디자인 토큰 및 화면 스타일
├─ BE/                          # Spring Boot 백엔드
│  └─ src/main/java/com/dandi/hospital/
│     ├─ auth/                  # 회원가입·로그인
│     ├─ user/                  # 사용자 및 약관 동의(Consent) 관리
│     ├─ volunteer/             # 봉사자 프로필·신뢰 지표
│     ├─ senior/                # 동행받는 분(어르신) 관리
│     ├─ hospital/              # 대구 5대 대학병원 데이터 초기화 및 조회
│     ├─ request/               # 동행 요청 등록 및 게시판 필터 조회
│     ├─ application/           # 봉사 신청 및 매칭
│     ├─ visit/                 # 체크인·체크리스트·체크아웃·봉사시간 계산·메모/AI 요약
│     └─ global/                # JWT 보안 설정, 공통 응답(ApiResponse), 전역 예외 처리
└─ docs/                        # FE ↔ BE API 연동 및 기획 변경 히스토리 문서
```

---

## 🚀 로컬 실행 방법

### 1. Frontend 실행

```bash
cd FE
cp .env.example .env       # 백엔드 서버 주소 설정 (기본: http://localhost:8080)
npm install
npm run dev                # http://localhost:5173 접속
```

* 프로덕션 빌드 및 타입 검사:
  ```bash
  npm run build
  ```

### 2. Backend 실행

```bash
cd BE
./gradlew bootRun          # Windows: .\gradlew.bat bootRun (기본 포트: 8080)
```

* 환경변수 설정 (`application.yml` 참고):
  * 로컬 프로파일(`SPRING_PROFILES_ACTIVE=local`) 실행 시 로컬 MySQL 연동
  * `JWT_SECRET`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `CORS_ORIGINS` 환경변수 지원
