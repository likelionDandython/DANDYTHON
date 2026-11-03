# 경북대구병원동행 · 모바일 화면 (React + Vite + TypeScript)

경북 어르신의 대구 병원 동행 서비스 화면을 코드로 옮긴 프로토타입이에요.
Figma 파일 「병원동행 봉사자 앱」의 세 페이지(봉사자 · 어르신 · 보호자)에 있는 화면 37개를 그대로 옮겼어요.

- Figma: https://www.figma.com/design/PgOCB74w9FtE59SJPWg1CP

## 실행

```bash
npm install
npm run dev
```

`http://localhost:5173` 에 접속하면 전체 화면 목록이 나와요. 화면을 누르면 390×844 모바일 프레임으로 열리고, 버튼을 누르면 다음 화면으로 이어져요.
휴대폰 폭(430px 이하)에서는 프레임 없이 화면 전체를 채워요.

```bash
npm run build    # 타입 검사 + 배포용 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기
```

## 폴더 구조

```
src/
├─ styles/tokens.css        # Figma 'Color' 변수와 1:1인 디자인 토큰
├─ index.css                # 공통 스타일 (컴포넌트 클래스)
├─ components/
│  ├─ common/               # 세 앱이 같이 쓰는 컴포넌트
│  │  ├─ Button.tsx         # Button(Primary/Secondary/Ghost), BigButton(어르신용)
│  │  ├─ Chip.tsx           # 상태 Chip, 선택형 칩, 필터 칩
│  │  ├─ Form.tsx           # Field, Checkbox, 약관 동의, Switch, OptionCards
│  │  ├─ Icon.tsx           # 라인 아이콘 세트
│  │  ├─ Layout.tsx         # Screen 프레임, StatusBar, TopBar, Progress
│  │  └─ TabBar.tsx         # 봉사자 / 보호자 탭바
│  ├─ volunteer/RequestCard.tsx
│  └─ elder/Elder.tsx       # ChoiceRow, ChoiceRow/기타(직접 입력), 큰 입력칸
├─ screens/
│  ├─ volunteer/  Auth.tsx (온보딩·로그인·등록)  Main.tsx (홈~마이페이지)
│  ├─ elder/      Elder.tsx (시작·가입·신청·당일 안내·기록)
│  └─ guardian/   Auth.tsx (시작·로그인·가입)  Main.tsx (홈~MY)
├─ data/mock.ts             # 예시 데이터 (API 연결 시 교체)
├─ routes.tsx               # 화면 번호 ↔ 경로 목록
└─ App.tsx                  # 라우터 + 화면 목록 페이지
```

## Figma ↔ 코드 대응

| Figma | 코드 |
| --- | --- |
| 변수 `brand/primary`, `bg/canvas` … | `--brand-primary`, `--bg-canvas` … (`tokens.css`) |
| Button (Type=Primary/Secondary/Ghost) | `<Button variant="primary" />` |
| BigButton (Type=Primary/Call/Ghost) | `<BigButton variant="call" />` |
| Chip (Tone=Green/Orange/Gray) | `<Chip tone="orange" />` |
| ChoiceRow / ChoiceRow/기타 | `<ChoiceRow />`, `<ChoiceRowOther />` |
| TabBar, TabBar/보호자 | `<TabBar tabs={VOLUNTEER_TABS} />`, `GUARDIAN_TABS` |
| RequestCard | `<RequestCard request={...} />` |

## 화면 경로

| 앱 | 번호 | 경로 |
| --- | --- | --- |
| 봉사자 | 01 온보딩 · 02 로그인 · 10~13 등록 | `/volunteer/onboarding`, `/volunteer/login`, `/volunteer/signup/1~3`, `/volunteer/signup/done` |
| 봉사자 | 03 홈 · 04 요청 목록 · 05 상세 · 06 수락 · 07 진행 · 08 MY | `/volunteer/home`, `/requests`, `/request-detail`, `/accepted`, `/progress`, `/my` |
| 어르신 | E01 시작 · E10~E13 가입 | `/elder/start`, `/elder/signup/1~3`, `/elder/signup/done` |
| 어르신 | E02 홈 · E03~E05 신청 · E06 배정 · E07 도착 안내 · E08 기록 | `/elder/home`, `/elder/apply/1~3`, `/assigned`, `/arriving`, `/records` |
| 보호자 | G00 시작 · G01-0 로그인 · G10~G13 가입 | `/guardian/onboarding`, `/guardian/login`, `/guardian/signup/1~3`, `/guardian/signup/done` |
| 보호자 | G01 홈 · G02 신청 · G03 확정 · G04 실시간 · G05 리포트 · G06 기록 · G07 MY | `/guardian/home`, `/apply`, `/confirmed`, `/live`, `/report`, `/records`, `/my` |

## 다음에 할 일

- 지도: `MapPlaceholder`(screens/volunteer/Main.tsx)를 카카오맵 등 실제 지도 SDK로 교체
- 데이터: `data/mock.ts`와 화면 안 예시 문구를 API 응답으로 교체
- 인증: 로그인·인증번호 버튼에 실제 SMS 인증 연결
- 배포 시 SPA 라우팅: 새로고침해도 화면이 열리도록 호스팅에서 모든 경로를 `index.html`로 보내기 (Vercel·Netlify는 기본 설정으로 동작)


---

## API 연동 (BE 명세 `api-spec.md` v0.1 반영)

> 위 설명 중 `data/mock.ts`(목업 데이터)와 "로그인 인증번호/SMS" 관련 내용은 이번 작업으로 **더 이상 사용하지 않습니다.** (`mock.ts` 삭제, 로그인은 이메일+비밀번호)

### 실행 방법

```bash
cp .env.example .env     # 백엔드 주소 설정 (기본 http://localhost:8080)
npm install
npm run dev
```

- 개발 서버가 `/api/*` 요청을 `VITE_PROXY_TARGET`으로 프록시합니다 (CORS 회피).
- 배포 시 API 주소를 직접 지정하려면 `VITE_API_URL`을 설정합니다 (기본값 `/api`).

### 추가된 구조

```
src/
├ api/
│  ├ types.ts      # 명세의 Enum·요청·응답 타입
│  ├ client.ts     # fetch 래퍼: JWT 헤더, {success,data,error} 언랩, ApiError
│  ├ services.ts   # authApi / profileApi / requestApi / applicationApi / visitApi
│  └ labels.ts     # 상태·필요도움 한글 라벨, 에러코드 → 한글 문구
├ auth/
│  ├ AuthContext.tsx  # 로그인 세션(localStorage), 401 자동 로그아웃
│  └ signup.ts        # 여러 화면에 걸친 가입 입력 임시 저장 + 가입→로그인→어르신 등록
├ hooks/useApi.ts  # useApi(조회: loading/error/data), useAction(버튼 동작)
└ lib/format.ts    # 날짜·시간·D-day·나이 등 포맷
```

- `/volunteer/*`, `/guardian/*` 중 온보딩·로그인·가입을 제외한 화면은 **로그인 + 역할 일치**가 필요합니다 (`App.tsx`의 `Guard`).
- 화면 간 이동은 쿼리스트링으로 id를 전달합니다 (예: `/volunteer/request-detail?requestId=10`, `/guardian/report?requestId=10`).

### 이번에 수정한 화면

| 화면 | 변경 내용 |
|---|---|
| 봉사자·보호자 로그인 | 휴대폰+인증번호 → **이메일+비밀번호**, 카카오 로그인 버튼 제거, 역할 불일치 안내 |
| 봉사자 가입 1~3 | 이메일·비밀번호 입력 추가, 만 18세 검증, 약관 → `consents` 코드로 전송, 가입 후 자동 로그인 |
| 보호자 가입 1~3 | 이메일·비밀번호 추가, 약관 목록 확장(제3자 제공·건강정보·요약 공유/수신), 어르신 등록(`POST /seniors`) |
| 봉사자 홈 / 요청 목록 | 게시판 API, 필터(전체·이번 주·휠체어 가능), 급한 요청·신청 여부 표시, "다가오는 동행" 카드 |
| 요청 상세 | 상세 API, 연락처 공개 전/후 처리, 신청 메시지 입력, 신청 에러 문구 |
| 수락 완료 | 요청 상세 데이터로 표시 |
| 동행 진행 | 서버 체크리스트, 체크인 → 단계 완료 → 체크아웃 한 버튼으로 진행 |
| 봉사자 MY | 누적 동행·봉사시간·감사 메시지, 활동 내역, 로그아웃(톱니 아이콘) |
| 보호자 홈 | 내 요청 목록, 진행 중 동행 진행률, 다가오는 일정 |
| 동행 신청 | 어르신·병원 선택, 날짜·시간·주소·필요 도움·인원·성별 선호 입력 후 `POST /requests` |
| 봉사자 확정 / 실시간 현황 | 확정 봉사자 정보, 동행 단계, 전화 연결 |
| 진료 결과 리포트 | AI 요약 표시, 요약 실패 시 원문 메모, **봉사시간 승인** + 감사 메시지 |
| 동행 기록 / 보호자 MY | 완료·취소 기록, 등록한 어르신 목록, 로그아웃 |

공통 컴포넌트: `ToggleChipGroup`·`FilterChips`·`Agreements`에 `onChange` 추가, `SelectField`·`ErrorText` 신규.

---

## 디자인이 필요한 부분 (화면/UI가 없어 연동하지 못한 기능)

명세에는 있으나 Figma에 화면이 없어 **API 함수만 만들어 두었습니다** (`src/api/services.ts`).

| 우선순위 | 필요한 화면 | 관련 API | 비고 |
|---|---|---|---|
| 높음 | **신청자 목록 + 수락** (보호자) | `GET /requests/{id}/applications`, `POST /applications/{id}/accept` | 없으면 동행이 확정되지 않음. 신청자 프로필·신청 메시지 카드, 수락 버튼 |
| 높음 | **봉사자 프로필 입력** (가입 후 S-03) | `PUT /volunteers/me` | 성별·학교·학과·학년·고향·소개·사진. 없으면 `PROFILE_INCOMPLETE`로 신청 불가 |
| 높음 | **진료 메모 작성 + 어르신 동의** (봉사자) | `POST /visits/{id}/memo`, `POST /visits/{id}/summary` | 동행 종료 후 흐름: 동의 체크 → 메모 입력 → AI 요약 생성 |
| 중간 | **봉사 확인서** (봉사자) | `GET /visits/{id}/certificate` | 화면 캡처로 PDF 처리 |
| 중간 | **요청 취소 / 신청 취소** UI + 늦은 취소 경고 | `DELETE /requests/{id}`, `DELETE /applications/{id}` | `lateCancel`(동행 2일 이내) 안내 문구 |
| 중간 | **어르신 추가 등록** (보호자 MY "추가" 버튼, 가입 2단계 "한 분 더") | `POST /seniors` | |
| 중간 | **봉사자 프로필 상세** (보호자가 신청자 확인) | `GET /volunteers/{userId}` | 신뢰 지표(`visitCount`, `totalMinutes`, 감사 메시지) |
| 낮음 | 빈 상태·로딩·오류 화면 디자인 | - | 현재는 텍스트로 임시 표시 |
| 낮음 | 봉사자 가입 안내 | - | 승인 대기 상태별 화면 (BE 답변 후) |

디자인 조정이 필요한 기존 화면:
- **로그인 / 가입**: 이메일·비밀번호 입력이 들어가도록 재디자인 (현재 기존 `Field` 스타일로 임시 구성)
- **동행 신청**: 진료과·봉사자 수·성별 선호·만나는 곳 종류 입력 추가 (임시로 `SelectField` 사용)
- **보호자 가입 약관**: 항목이 8개로 늘어남. 필수/선택 구분과 접기 UI 필요
- BE 답변에 따라 제거/변경될 화면: 어르신 앱, 지도(실시간 위치), 알림 설정, 봉사자 가입 2·3단계

BE 확인이 필요한 항목은 [`../docs/BE-요청사항.md`](../docs/BE-요청사항.md)에 정리했습니다.
