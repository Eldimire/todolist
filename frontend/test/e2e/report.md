# E2E 테스트 리포트

**작성일**: 2026-05-29  
**테스트 환경**: Chrome (playwright-mcp) / 데스크톱 1280×800  
**프론트엔드**: http://localhost:5173  
**백엔드**: http://localhost:3000  

---

## 테스트 결과 요약

| 구분 | 총 케이스 | 통과 | 실패 | 버그 |
|------|-----------|------|------|------|
| 인증 | 3 | 3 | 0 | 0 |
| US-01~06 흐름 | 9 | 9 | 0 | 0 |
| 반응형 | 3 | 3 | 0 | 0 |
| 에지 케이스 | 2 | 1 | 0 | 1 |
| **합계** | **17** | **16** | **0** | **1** |

---

## 상세 테스트 결과

### TC-01 | 미인증 리다이렉트
- **결과**: ✅ PASS
- **내용**: 비로그인 상태에서 `/` 접근 시 `/login`으로 즉시 리다이렉트
- ![tc01-unauth-redirect](screenshots/tc01-unauth-redirect.png)

---

### TC-02 | 회원가입 (S-01)
- **결과**: ✅ PASS
- **내용**: 이름/이메일/비밀번호/비밀번호 확인 입력 후 "가입하기" → `/login`으로 이동
- 회원가입 화면:
  ![tc02-signup-page](screenshots/tc02-signup-page.png)
- 폼 작성 후:
  ![tc02-signup-filled](screenshots/tc02-signup-filled.png)

---

### TC-03 | 로그인 (S-02)
- **결과**: ✅ PASS
- **내용**: 이메일/비밀번호 입력 후 로그인 → `/` (할일 목록 화면) 이동
- ![tc03-login-success](screenshots/tc03-login-success.png)

---

### TC-04 | US-01 — 할일 등록 후 목록 표시
- **결과**: ✅ PASS
- **내용**: "+ 할일 추가" → 폼 입력(제목/설명/날짜) → 저장 → 목록에 즉시 표시
- 할일 등록 폼:
  ![tc04-todo-form-new](screenshots/tc04-todo-form-new.png)
- 등록 완료 후 목록:
  ![tc04-todo-created](screenshots/tc04-todo-created.png)

---

### TC-05 | US-02 — 카테고리 생성 → 할일 분류 → 필터 조회
- **결과**: ✅ PASS
- **내용**:
  1. `/profile` 에서 "E2E 카테고리" 생성 확인
  2. 할일 등록 시 카테고리 선택
  3. 카테고리 탭 → "E2E 카테고리" 선택 시 해당 할일만 필터링
- 카테고리 추가:
  ![tc05-category-added](screenshots/tc05-category-added.png)
- 카테고리 필터:
  ![tc05-category-filter](screenshots/tc05-category-filter.png)

---

### TC-06 | US-03 — 완료 처리 후 진행 중 목록에서 사라짐
- **결과**: ✅ PASS
- **내용**: 진행 중 탭에서 체크박스 클릭 → 목록에서 즉시 사라짐 → 완료 탭에서 확인
- 완료 처리 전:
  ![tc06-in-progress-before](screenshots/tc06-in-progress-before.png)
- 완료 처리 후 (진행 중 탭):
  ![tc06-after-complete](screenshots/tc06-after-complete.png)
- 완료 탭 확인:
  ![tc06-completed-tab](screenshots/tc06-completed-tab.png)

---

### TC-07 | US-04 — 기한 초과 할일 수정 후 탭에서 제거
- **결과**: ✅ PASS
- **내용**: 기한 초과 탭 할일 → "수정" 클릭 → 종료일 미래로 변경 → 저장 → 기한 초과 탭에서 사라지고 상태가 "진행 중"으로 변경
- 기한 초과 목록:
  ![tc07-overdue-before](screenshots/tc07-overdue-before.png)
- 수정 폼:
  ![tc07-edit-form](screenshots/tc07-edit-form.png)
- 수정 후 전체 목록:
  ![tc07-overdue-edited](screenshots/tc07-overdue-edited.png)

> **참고**: 수정 폼 진입 시 날짜 필드가 비어 있음. GET /api/todos/:id 응답의 날짜 값이 ISO 문자열(`2026-05-19T15:00:00.000Z`)로 내려오지만 `<input type="date">`는 `YYYY-MM-DD` 형식만 허용하여 자동 바인딩이 안 되는 것으로 추정. 수동 입력 후 저장은 정상 동작.

---

### TC-08 | US-04 — 할일 삭제
- **결과**: ✅ PASS
- **내용**: "삭제" 버튼 → 확인 다이얼로그("할일을 삭제하시겠습니까?") → 수락 → 목록에서 즉시 제거
- ![tc08-todo-deleted](screenshots/tc08-todo-deleted.png)

---

### TC-09 | US-05 — 상태별 필터 탭 전체 점검
- **결과**: ✅ PASS
- **내용**: 전체/시작 전/진행 중/완료/기한 초과 5개 탭 모두 콘솔 에러 없이 렌더링
- ![tc09-filter-tabs](screenshots/tc09-filter-tabs.png)

---

### TC-10 | US-06 — 내 정보 수정 후 로그아웃
- **결과**: ✅ PASS
- **내용**: 이름 수정 저장 → 헤더에 즉시 반영 → 로그아웃 → `/login` 이동 → `/` 재접근 시 `/login` 리다이렉트
- 이름 수정 반영:
  ![tc10-profile-updated](screenshots/tc10-profile-updated.png)
- 로그아웃 후:
  ![tc10-logout](screenshots/tc10-logout.png)

---

### TC-11 | 404 페이지
- **결과**: ✅ PASS
- **내용**: 존재하지 않는 경로(`/nonexistent-page`) 접근 시 "404 페이지를 찾을 수 없습니다" 표시, "홈으로 가기" 링크 제공
- ![tc11-404-page](screenshots/tc11-404-page.png)

---

### TC-12 | 에지 케이스 — 잘못된 로그인 정보
- **결과**: ⚠️ BUG
- **내용**: 존재하지 않는 이메일/비밀번호로 로그인 시도 시 `/login` 페이지에 머물지만 **에러 메시지가 표시되지 않음**. 사용자가 왜 로그인이 안 되는지 알 수 없는 UX 문제.
- ![tc12-login-error](screenshots/tc12-login-error.png)

---

### TC-13 | 인증 후 /login 접근 시 리다이렉트
- **결과**: ✅ PASS
- **내용**: 로그인 상태에서 `/login` 직접 접근 시 `/`로 즉시 리다이렉트 (PublicOnlyRoute 정상 동작)

---

### TC-14 | 반응형 — 모바일 375×812
- **결과**: ✅ PASS
- **내용**:
  - 헤더: 데스크톱 nav 숨겨지고 햄버거 버튼(☰) 표시
  - 드로어 열기: "내 정보 수정", "로그아웃", "메뉴 닫기(✕)" 정상 표시
  - 할일 목록: 단일 컬럼으로 정상 렌더링
- 모바일 목록:
  ![tc14-mobile-375-list](screenshots/tc14-mobile-375-list.png)
- 드로어 열림:
  ![tc14-mobile-drawer-open](screenshots/tc14-mobile-drawer-open.png)

---

### TC-15 | 반응형 — 태블릿 768×1024
- **결과**: ✅ PASS
- **내용**: 햄버거 버튼 없이 헤더 nav 링크("내 정보 수정", "로그아웃") 정상 표시
- ![tc15-tablet-768](screenshots/tc15-tablet-768.png)

---

### TC-16 | 반응형 — 데스크톱 1280×800
- **결과**: ✅ PASS
- **내용**: 날짜 필드 2컬럼 그리드, 헤더 nav 정상 표시
- ![tc16-desktop-1280-form](screenshots/tc16-desktop-1280-form.png)

---

### TC-17 | 에지 케이스 — 종료일 < 시작일 유효성 검증
- **결과**: ✅ PASS
- **내용**: 시작일(2026-06-10) > 종료일(2026-06-01) 입력 후 저장 시 "종료일자는 시작일자보다 이전일 수 없습니다." 에러 표시, 페이지 이동 없음
- ![tc17-date-validation](screenshots/tc17-date-validation.png)

---

## 발견된 버그 목록

| # | 심각도 | 위치 | 내용 |
|---|--------|------|------|
| BUG-01 | Medium | 로그인 화면 | 잘못된 이메일/비밀번호 입력 시 에러 메시지 미표시 |
| BUG-02 | Low | 할일 수정 폼 | 날짜 필드 초기값 미표시 (ISO 날짜 → `YYYY-MM-DD` 변환 누락) |
| BUG-03 | Low | 기한 초과 상태 표시 | 당일 종료 할일이 카드에서 "기한 초과"로 표시되지만 기한 초과 탭 필터에서 누락 (UTC/로컬 타임 불일치 추정) |

---

## 미검증 항목 (v2 계획)

- 언어 설정 변경 (`/api/v2/settings/language`)
- 테마 설정 변경 (`/api/v2/settings/theme`)
