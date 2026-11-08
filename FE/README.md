# 같이가요 (Gachigayo) — Frontend (`React + TypeScript + Vite`)

경북 어르신의 대구 대형병원 진료 길에 대구 지역 대학생 봉사자가 함께하는 **같이가요**의 모바일 웹 프론트엔드입니다.  
단일 계정으로 **동행 요청 모드(나·가족)**와 **동행하기 모드(봉사자)**를 오갈 수 있으며, 31개 전체 화면이 백엔드 REST API 및 FCM 웹 푸시와 연동되어 있습니다.

---

## 🌐 배포 및 디자인 시안

* **Live Demo (Cloudflare Pages)**: https://dandython.pages.dev
* **Backend API (Railway)**: https://dandython-production.up.railway.app
* **Figma Design**: https://www.figma.com/design/PgOCB74w9FtE59SJPWg1CP

---

## 🚀 실행 및 빌드 방법

### 1. 환경변수 설정 (`.env`)

```bash
cp .env.example .env
```

| 환경변수 | 설명 | 기본값 |
| :--- | :--- | :--- |
| `VITE_PROXY_TARGET` | 로컬 개발 서버(`vite dev`)가 `/api/*` 요청을 프록시할 백엔드 주소 | `http://localhost:8080` |
| `VITE_API_URL` | 배포 환경에서 직접 호출할 API Base URL | `/api` |
| `VITE_FIREBASE_*` | FCM 웹 푸시 연동용 Firebase Web Config 및 `VITE_FIREBASE_VAPID_KEY` | 미설정 시 앱 내 알림 목록으로 동작 |

### 2. 개발 서버 및 프로덕션 빌드

```bash
npm install
npm run dev      # http://localhost:5173 실행 ('/' 접속 시 시작 화면(/start), '/dev' 접속 시 31개 전체 화면 갤러리 제공)
npm run lint     # oxlint 정적 분석 (0 warnings, 0 errors)
npm run build    # tsc -b 타입 체크 + dist/ 프로덕션 빌드
npm run preview  # 빌드 결과물 로컬 프리뷰
```

* 데스크톱 브라우저에서는 **390×844 모바일 프레임**으로 표시되며, 모바일 기기 폭(`430px` 이하)에서는 프레임 없이 전체 화면(`100dvh`)으로 동작합니다.
* Cloudflare Pages SPA 라우팅을 위해 `public/_redirects`(`/* /index.html 200`)가 설정되어 있습니다.

---

## 🧭 화면 구성 및 라우트 (`src/routes.tsx`)

### 1. 공통 · 계정 하나 (`/start`, `/signup`, `/login`, `/mode`)
| 코드 | 화면명 | 경로 | 주요 기능 및 심사 기준 반영 사항 |
| :--- | :--- | :--- | :--- |
| `C01` | 시작 | `/start` | 서비스 슬로건 및 단일 계정 안내, 로그인 세션 보유 시 마지막 사용 모드로 자동 이동 |
| `C02` | 가입 1 · 기본 정보 | `/signup` | 역할 구분 없이 이름·휴대폰·이메일·비밀번호(8~20자) 입력 (`sessionStorage` 임시 저장) |
| `C03` | 가입 2 · 공통 약관 | `/signup/agree` | 필수 공통 약관(`TERMS`, `PRIVACY`, `THIRD_PARTY`) 동의 |
| `C04` | 로그인 | `/login` | 이메일+비밀번호 로그인, 401 응답 시 자동 세션 정리 및 로그인 이동 |
| `C10` | 모드 선택 | `/mode` | **"오늘은 무엇을 할까요?"** — `동행 요청하기` / `동행하러 가기` 선택 |
| `C11` | 모드 첫 진입 약관 | `/mode/terms` | 모드별 최초 1회 필수 약관 수집 (봉사자 금전 대리 결제 금지 서약, 요청자 건강정보·대리 등록 확인 등) |

### 2. 동행 요청 모드 (`/guardian/*`, `/request/*`)
| 코드 | 화면명 | 경로 | 주요 기능 및 심사 기준 반영 사항 |
| :--- | :--- | :--- | :--- |
| `G00` | 요청 대상 선택 | `/request/who` | **나(`SELF`)** 또는 **가족(`FAMILY`)** 선택 |
| `G10` | 동행받는 분 등록 | `/guardian/senior/new` | 이름, 출생연도(연령 계산), 연락처, 거주지 주소(`○○시/군` 자동 추출) 등록 |
| `G01` | 요청자 홈 | `/guardian/home` | 상단 동행 대상(`나` / 등록된 가족) 스위처 드롭다운, 진행 중 동행 실시간 단계 바, 다가오는 일정, 알림 벨(`BellButton`), 모드 전환 버튼 |
| `G02` | 동행 신청 | `/guardian/apply` | 대구 5대 대학병원 선택, **대구 주요 역·터미널 4곳(`동대구역`, `동대구터미널`, `북부정류장`, `서부정류장`) 퀵 버튼**, 대구 이동 수단, 필요한 도움 5종, 중증 거동 불편 시 장기요양 제도 안내 |
| `G08` | 신청자 보기 | `/guardian/applicants` | 대기 중 신청자 카드(신청 한 마디 말풍선, **재학 인증 배지**, **고향 연결 배지**, 동행 횟수) |
| `G08-1` | 봉사자 프로필 상세 | `/guardian/volunteer` | 학력·고향·활동 지역·가능 요일·할 수 있는 도움·누적 봉사시간·이전 요청자 감사 후기 열람 |
| `G09` | 봉사자 확정 확인 | `/guardian/applicants/confirm` | 1:1 매칭 확정 전 안내 (상호 연락처 공개, 나머지 신청 자동 마감, 2일 전 이후 취소 시 기록 안내) |
| `G03` | 봉사자 확정 완료 | `/guardian/confirmed` | 확정된 봉사자 프로필 요약 및 즉시 전화 걸기(`tel:`), 요청 취소 이동 |
| `G04` | 동행 현황 (실시간) | `/guardian/live` | 체크인부터 배웅까지 단계별 완료 시각(`completedAt`) 타임라인 조회 및 봉사자 전화 연결 |
| `G05` | 진료 결과 리포트 | `/guardian/report` | 감성 헤드라인(*"동행받는 분의 '괜찮다'는 말씀 뒤에 담긴 오늘의 진료 기록이에요"*), AI 3줄 요약·다음 진료·처방약·챙길 일 카드, 요약 실패 시 원문 메모 표시, **감사 메시지 프리셋 3종(`ThanksPresets`) + 봉사시간 승인** |
| `G06` | 동행 기록 | `/guardian/records` | 동행받는 분 이름별 필터링 및 완료·승인·취소 이력 조회 |
| `G07` | MY · 모드 전환 | `/guardian/my` | 모드 전환 카드, 등록된 동행받는 분 관리, 알림 설정 이동, 로그아웃 |
| `G11` | 요청 취소 확인 | `/guardian/cancel` | 동행 2일 전 이내 취소(`lateCancel`) 경고 안내 및 요청 취소(`DELETE /requests/{id}`) |
| `G12~13` | 알림 목록 · 설정 | `/guardian/notifications(/settings)` | 오늘/어제/이전 그룹별 알림 목록, 읽음 처리, 5대 동행 단계별 알림 수신 스위치 |

### 3. 동행하기 모드 (`/volunteer/*`)
| 코드 | 화면명 | 경로 | 주요 기능 및 심사 기준 반영 사항 |
| :--- | :--- | :--- | :--- |
| `V10~11` | 봉사자 프로필 등록·완성 | `/volunteer/profile(/done)` | 만 18세 이상 검증, 대학·학과·학년·고향·한 줄 소개, 활동 지역(대구 구·군 및 경산·영천·칠곡·군위)·가능 요일·이동 방법·가능 도움(`SIGN_LANGUAGE` 포함) 저장 |
| `03` | 봉사자 홈 | `/volunteer/home` | 프로필 미완성 안내 배너, 오늘/다가오는 동행 카드(`동행 시작하기` 바로가기), 신규 동행 요청 미리보기 |
| `04` | 동행 요청 게시판 | `/volunteer/requests` | `전체` / `이번 주` / `휠체어 가능` 필터 칩, 동행 2일 전 미확정 **`급해요` 배지**, 예상 소요 시간 및 2인 권장 표시 |
| `05` | 요청 상세 및 신청 | `/volunteer/request-detail` | 일시·병원·만날 장소·필요 도움 확인, 확정 전 상세 주소/연락처 비공개 보호 안내, 본인 등록 요청 신청 차단(`mine`), 신청 한 마디 작성 |
| `06` | 수락 완료 | `/volunteer/accepted` | 매칭 확정 안내 및 공개된 요청자 연락처 확인 |
| `07` | 동행 진행 체크리스트 | `/volunteer/progress` | 동행 당일 검증(`notToday`), 원버튼 단계 진행(`만남 체크인` → 단계별 완료 → `배웅 체크아웃`), 금전 대리 결제 금지 안내, 요청자 바로 전화 |
| `09` | 진료 메모 + 현장 동의 | `/volunteer/memo` | **동행받는 분 확인용 큰 글씨 동의 모달(`25px` 제목, `20px` 안내, `62px` 동의 버튼)** — 직접 동의 터치 전 메모란 비활성화, 20자 이상 검증, 10초 초과 지연 안내 문구 전환 |
| `10~11` | 진료 요약 완료 · Fallback | `/volunteer/memo/done`, `/fallback` | 생성된 AI 요약 확인 또는 요약 실패 시 메모 원문 전달 완료 안내 |
| `08` | 봉사자 MY | `/volunteer/my` | 누적 동행 횟수·총 봉사시간·받은 감사 메시지 집계, 활동 내역 및 신청 취소, 프로필 수정·확인서 발급 이동 |
| `12` | 신청 취소 | `/volunteer/cancel` | 동행 2일 이내 취소 시 페널티 안내 및 신청 취소(`DELETE /applications/{id}`) |
| `13` | 봉사 확인서 | `/volunteer/certificate` | 승인 완료된 동행의 활동일·병원·실제 활동 시간·인정 시간 증명서 조회 및 `window.print()` 기반 PDF 저장 |

---

## 📂 소스 코드 구조 (`src/`)

```text
src/
├─ api/
│  ├─ client.ts               # fetch 래퍼 (JWT 자동 주입, {success,data,error} 언랩, 401 이벤트 발행)
│  ├─ types.ts                # 도메인 Enum 및 API Request/Response 타입 정의
│  ├─ services.ts             # authApi, userApi, profileApi, requestApi, applicationApi, visitApi
│  └─ labels.ts               # 상태·도움 항목 한글 라벨 및 서버 에러 코드 → 친화적 한글 문구 매핑
├─ auth/
│  ├─ AuthContext.tsx         # 단일 계정 + 양방향 모드 세션 관리, 새로고침 시 /users/me 동기화, FCM 자동 등록
│  └─ signup.ts               # 가입 단계별 임시 저장 및 공통/모드별 약관 동의 빌더
├─ components/
│  ├─ common/                 # Button, BigButton, Chip, Form, Icon, Layout, TabBar, ModeSwitch,
│  │                          # Character(일러스트/아바타), HometownBadge(고향 연결), ThanksPresets(감사 프리셋), States
│  └─ volunteer/RequestCard.tsx
├─ design/
│  ├─ notificationsApi.ts     # 알림 목록·읽음·5대 설정 API 및 날짜 그룹 유틸
│  ├─ routes.tsx              # 신청자 수락 및 알림 라우트 모듈
│  └─ styles.ts               # 디자인 개편 스타일 로더
├─ hooks/useApi.ts            # 선언적 데이터 패칭(useApi) 및 비동기 액션 상태 관리(useAction)
├─ lib/
│  ├─ format.ts               # 날짜·시간·D-day·분→시간 변환·주소→시군 추출 유틸
│  └─ hometown.ts             # 경북 22개 시·군 인접 생활권 매칭 로직 (isHometownNeighbor)
├─ push/push.ts               # Firebase Cloud Messaging 서비스 워커 등록 및 기기별 토큰 관리
├─ screens/                   # common / guardian / volunteer 화면 컴포넌트
└─ styles/                    # tokens.css, design-tokens.css, design-match.css, screens.css, notifications.css
```
