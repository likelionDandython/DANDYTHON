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
