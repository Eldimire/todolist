# TodoList 실행계획

> 버전: 1.0.0
> 작성일: 2026-05-28
> 기반 문서: PRD v1.1.0, 도메인 정의서 v1.2.0, 프로젝트 구조 v1.0.2

---

## 변경 이력

| 버전 | 변경일 | 변경 내용 | 변경 유형 |
|------|--------|-----------|-----------|
| v1.0.0 | 2026-05-28 | 최초 작성 (DB·백엔드·프론트엔드 Task 분해, 완료 조건·의존성 체크박스) | 신규 |

---

## 전체 Task 개요

| 영역 | Task 수 | 비고 |
|------|---------|------|
| Database | 3개 (DB-01 ~ DB-03) | 스키마, 환경, 시드 |
| Backend | 13개 (BE-01 ~ BE-13) | 레이어별 독립 Task |
| Frontend | 14개 (FE-01 ~ FE-14) | 레이어·화면별 독립 Task |

---

## 의존성 구조 요약

```
[DB-01] 환경 구성
    └── [DB-02] 스키마 생성
            └── [DB-03] 시드 데이터

[BE-01] 프로젝트 초기화
    ├── [BE-02] 환경변수·DB 연결  ← DB-02 완료 필요
    ├── [BE-03] 공통 유틸리티
    └── [BE-04] 미들웨어
            ├── [BE-05] Repository (User/Category/Todo)  ← BE-02 완료 필요
            │       └── [BE-06] Service (Auth/Category/Todo)  ← BE-03·04 완료 필요
            │               └── [BE-07] Controller·Router (Auth)
            │               └── [BE-08] Controller·Router (Category)
            │               └── [BE-09] Controller·Router (Todo)
            │               └── [BE-10] Controller·Router (User)
            └── [BE-11] Express 앱 통합  ← BE-07~10 완료 필요
                    └── [BE-12] 통합 검증
                    └── [BE-13] .env 설정 완성

[FE-01] 프로젝트 초기화
    ├── [FE-02] 타입·상수·유틸리티
    └── [FE-03] API Client 기반
            ├── [FE-04] Zustand Store
            ├── [FE-05] Auth 기능  ← BE-07 완료 필요
            │       └── [FE-06] 인증 화면 (S-01, S-02)
            ├── [FE-07] 공통·레이아웃 컴포넌트  ← FE-04 완료 필요
            │       ├── [FE-08] 카테고리 기능  ← BE-08 완료 필요
            │       └── [FE-09] 할일 기능  ← BE-09 완료 필요
            │               └── [FE-10] 메인 화면 (S-03)
            │               └── [FE-11] 할일 등록·수정 화면 (S-04)
            └── [FE-12] 내 정보 수정 화면 (S-05)  ← BE-10 완료 필요
    └── [FE-13] 라우팅 통합  ← FE-05~12 완료 필요
    └── [FE-14] 통합 검증·반응형

```

---

## DATABASE

---

### DB-01: 개발 환경 구성

**설명**: PostgreSQL 17 설치·구동 확인, DB·사용자 생성, 접속 검증

**의존성**
- [x] 없음 (시작점)

**완료 조건**
- [x] PostgreSQL 17 설치 완료, `psql --version` 확인
- [x] `todolist` 데이터베이스 생성 완료
- [x] DB 접속 계정(user/password) 생성 및 권한 부여 완료
- [x] `psql -U <user> -d todolist` 접속 성공 확인
- [x] `uuid-ossp` 확장 활성화 확인 (`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)

---

### DB-02: 스키마 생성 (DDL 실행)

**설명**: `database/schema.sql` 실행하여 users·categories·todos 테이블 및 인덱스 생성

**의존성**
- [x] DB-01 완료

**완료 조건**
- [x] `users`, `categories`, `todos` 3개 테이블 생성 확인
- [x] PK, UNIQUE, FK 제약조건 적용 확인
- [x] CHECK 제약조건 3개 적용 확인 (`chk_users_language`, `chk_users_theme_mode`, `chk_todos_end_date`)
- [x] 인덱스 4개 생성 확인 (`idx_categories_user_id`, `idx_todos_user_id`, `idx_todos_category_id`, `idx_todos_status`)
- [x] FK `fk_todos_category` ON DELETE RESTRICT 동작 확인 (카테고리 직접 삭제 시 오류 발생 검증)

---

### DB-03: 테스트 시드 데이터 작성

**설명**: `database/seeds/seed.js` 작성 — 개발·테스트용 사용자, 카테고리, 할일 데이터 삽입

**의존성**
- [x] DB-02 완료

**완료 조건**
- [x] 테스트 사용자 1명 이상 삽입 (이메일, bcrypt 해시 비밀번호)
- [x] 해당 사용자의 기본 카테고리 + 일반 카테고리 1개 이상 삽입
- [x] 상태별 할일 4개 이상 삽입 (시작 전·진행 중·완료·기한 초과 각 1개)
- [x] `node database/seeds/seed.js` 실행 시 오류 없이 완료

---

## BACKEND

---

### BE-01: 프로젝트 초기화

**설명**: `backend/` 디렉토리 생성, `package.json` 설정, 디렉토리 구조 생성, ESLint·Prettier 설정

**의존성**
- [x] 없음 (시작점)

**완료 조건**
- [x] `backend/` 디렉토리 및 하위 구조 생성 완료
  ```
  backend/src/{route,controller,service,repository,middleware,config,utils,constants,db}
  ```
- [x] `package.json` 생성, 의존성 설치 완료
  - 필수: `express`, `pg`, `jsonwebtoken`, `bcrypt`, `dotenv`, `cors`
  - 개발: `eslint`, `prettier`, `jest`, `supertest`, `nodemon`
- [x] `.eslintrc.js`, `.prettierrc` 설정 완료
- [x] `npm run dev` (nodemon) 실행 확인
- [x] `backend/.env.example` 파일 생성 (실제 값 없이 키 목록만)

---

### BE-02: 환경변수 및 DB 연결 설정

**설명**: `.env` 파일 구성, `config/env.js` 환경변수 로드, `config/database.js` pg 커넥션 풀 설정

**의존성**
- [x] BE-01 완료
- [x] DB-02 완료

**완료 조건**
- [x] `backend/.env` 파일 생성 (NODE_ENV, PORT, DB_*, JWT_SECRET, JWT_EXPIRY, CORS_ORIGIN 포함)
- [x] `config/env.js` — 필수 환경변수 누락 시 서버 시작 실패 처리
- [x] `config/database.js` — pg Pool 생성, 커넥션 풀 설정 (max: 20 이상)
- [x] DB 연결 테스트 쿼리 (`SELECT NOW()`) 성공 확인
- [x] DB 연결 실패 시 적절한 오류 로그 출력 확인

---

### BE-03: 공통 유틸리티 구현

**설명**: JWT 토큰 생성·검증, bcrypt 해싱, 로거, 에러 코드 정의

**의존성**
- [x] BE-01 완료

**완료 조건**
- [x] `utils/jwt.js` — `generateToken(payload)`, `verifyToken(token)` 구현 및 단위 테스트 통과
- [x] `utils/hash.js` — `hashPassword(plain)`, `comparePassword(plain, hash)` 구현 및 단위 테스트 통과
- [x] `utils/logger.js` — ERROR·WARN·INFO·DEBUG 레벨 로거, 민감정보(비밀번호·토큰) 로그 미포함 확인
- [x] `utils/errorCodes.js` — 전체 에러 코드 상수 정의 완료
- [x] `constants/httpStatus.js` — HTTP 상태 코드 상수 정의 (200·201·400·401·403·404·409·422)

---

### BE-04: 미들웨어 구현

**설명**: JWT 인증 미들웨어, 에러 핸들러 미들웨어 구현

**의존성**
- [x] BE-03 완료

**완료 조건**
- [x] `middleware/auth.middleware.js` — `verifyToken()` 구현
  - [x] `Authorization: Bearer <token>` 헤더 파싱
  - [x] 토큰 없음 → HTTP 401 반환
  - [x] 토큰 유효하지 않음 → HTTP 401 반환
  - [x] 토큰 만료 → HTTP 401 반환
  - [x] 검증 성공 시 `req.user = { id, email }` 설정
- [x] `middleware/errorHandler.middleware.js` — `handleError()` 구현
  - [x] 모든 에러를 `{ code, message }` JSON 스키마로 변환
  - [x] 알 수 없는 에러 → HTTP 500 처리
- [x] 단위 테스트: 토큰 없음·만료·유효 케이스 통과

---

### BE-05: Repository 레이어 구현

**설명**: User·Category·Todo Repository 구현 (pg 파라미터 바인딩 사용)

**의존성**
- [x] BE-02 완료

**완료 조건**

**user.repository.js**
- [x] `findByEmail(email)` — 이메일로 사용자 조회
- [x] `findById(id)` — ID로 사용자 조회
- [x] `create({ email, password, name })` — 사용자 생성, 생성된 row 반환
- [x] `update(id, { name?, password? })` — 사용자 정보 수정

**category.repository.js**
- [x] `create({ userId, name, isDefault })` — 카테고리 생성
- [x] `findById(id)` — ID로 카테고리 조회
- [x] `findByUserId(userId)` — 사용자별 카테고리 목록 조회
- [x] `findDefaultByUserId(userId)` — 사용자의 기본 카테고리 조회
- [x] `update(id, { name })` — 카테고리명 수정
- [x] `delete(id)` — 카테고리 삭제

**todo.repository.js**
- [x] `create({ userId, categoryId, title, description, startDate, endDate })` — 할일 생성
- [x] `findById(id)` — ID로 할일 조회
- [x] `findByUserId(userId)` — 전체 할일 목록 조회
- [x] `findByUserIdAndCategory(userId, categoryId)` — 카테고리별 조회
- [x] `findByUserIdAndStatus(userId, status)` — 상태별 조회 (시작 전·진행 중·완료·기한 초과)
- [x] `update(id, fields)` — 할일 수정
- [x] `updateCategory(todoId, categoryId)` — 카테고리 재지정 (카테고리 삭제 시 사용)
- [x] `delete(id)` — 할일 삭제
- [x] 모든 쿼리에 pg 파라미터 바인딩(`$1`, `$2`) 사용 확인 (동적 문자열 연결 없음)

---

### BE-06: Service 레이어 구현

**설명**: Auth·Category·Todo·User Service 구현 (비즈니스 규칙 BR-01~06 적용)

**의존성**
- [x] BE-03 완료
- [x] BE-04 완료
- [x] BE-05 완료

**완료 조건**

**auth.service.js** (UC-001~004)
- [x] `signup({ email, password, name })` — 이메일 중복 확인(409), bcrypt 해싱, 사용자 생성, 기본 카테고리 자동 생성 (BR-04)
- [x] `login({ email, password })` — 이메일 조회(401), 비밀번호 비교(401), JWT 발급, language·themeMode 포함 반환
- [x] `updateProfile(userId, { name?, password? })` — 비밀번호 변경 시 bcrypt 재해싱

**category.service.js** (UC-005~007)
- [x] `createCategory(userId, { name })` — 카테고리 생성 (BR-02 소유권 적용)
- [x] `updateCategory(userId, categoryId, { name })` — isDefault=true 수정 시도 → HTTP 422 (BR-04)
- [x] `deleteCategory(userId, categoryId)` — isDefault=true 삭제 시도 → HTTP 422 (BR-04), 하위 할일 기본 카테고리로 재지정 후 삭제

**todo.service.js** (UC-008~017)
- [x] `createTodo(userId, { title, description?, categoryId?, startDate, endDate })` — 카테고리 미지정 시 기본 카테고리 자동 적용 (BR-03), 날짜 유효성 검증 (BR-05)
- [x] `updateTodo(userId, todoId, fields)` — 소유권 확인 (BR-02), 날짜 유효성 검증 (BR-05)
- [x] `deleteTodo(userId, todoId)` — 소유권 확인 (BR-02)
- [x] `toggleComplete(userId, todoId)` — isCompleted 토글, 완료 취소 시 날짜 기반 상태 재계산 (BR-06)
- [x] `getTodos(userId, filter)` — 전체·카테고리별·상태별 필터 처리 (UC-012~017, KST 기준)

---

### BE-07: 인증 API 구현 (Auth Controller·Router)

**설명**: UC-001~004 엔드포인트 구현 및 라우팅 연결

**의존성**
- [x] BE-06 완료

**완료 조건**
- [x] `POST /api/auth/signup` — 회원가입 (201 반환)
  - [x] 이메일 RFC 5321 형식 검증 (400)
  - [x] 비밀번호 8자 미만 → 400
  - [x] 이메일 중복 → 409
- [x] `POST /api/auth/login` — 로그인 (200, JWT + user 정보 반환)
  - [x] 이메일/비밀번호 불일치 → 401
  - [x] 응답에 `language`, `themeMode` 포함 확인
- [x] `POST /api/auth/logout` — 로그아웃 (200, 인증 필요)
- [x] `PATCH /api/users/me` — 내 정보 수정 (200, 인증 필요)
  - [x] 비밀번호 8자 미만 → 400

---

### BE-08: 카테고리 API 구현 (Category Controller·Router)

**설명**: UC-005~007 엔드포인트 구현 및 라우팅 연결

**의존성**
- [x] BE-06 완료

**완료 조건**
- [x] `POST /api/categories` — 카테고리 등록 (201, 인증 필요)
  - [x] 이름 100자 초과 → 400
- [x] `PATCH /api/categories/:id` — 카테고리 수정 (200, 인증 필요)
  - [x] 기본 카테고리 수정 시도 → 422
  - [x] 타 사용자 카테고리 접근 → 403
- [x] `DELETE /api/categories/:id` — 카테고리 삭제 (200, 인증 필요)
  - [x] 기본 카테고리 삭제 시도 → 422
  - [x] 타 사용자 카테고리 접근 → 403
  - [x] 하위 할일 기본 카테고리 재지정 확인
- [x] `GET /api/categories` — 카테고리 목록 조회 (200, 인증 필요)

---

### BE-09: 할일 API 구현 (Todo Controller·Router)

**설명**: UC-008~017 엔드포인트 구현 및 라우팅 연결

**의존성**
- [x] BE-06 완료

**완료 조건**
- [x] `POST /api/todos` — 할일 등록 (201, 인증 필요)
  - [x] 제목 200자 초과 → 400
  - [x] 설명 2000자 초과 → 400
  - [x] 종료일 < 시작일 → 422
  - [x] 카테고리 미지정 시 기본 카테고리 자동 적용 확인
- [x] `PATCH /api/todos/:id` — 할일 수정 (200, 인증 필요)
  - [x] 종료일 < 시작일 → 422
  - [x] 타 사용자 할일 접근 → 403
- [x] `DELETE /api/todos/:id` — 할일 삭제 (200, 인증 필요)
  - [x] 타 사용자 할일 접근 → 403
- [x] `PATCH /api/todos/:id/complete` — 완료 처리 토글 (200, 인증 필요)
- [x] `GET /api/todos` — 전체 할일 조회 (200, 인증 필요)
- [x] `GET /api/todos?categoryId=:id` — 카테고리별 조회 (200)
- [x] `GET /api/todos?status=not-started` — 시작 전 조회 (KST 기준)
- [x] `GET /api/todos?status=in-progress` — 진행 중 조회 (KST 기준)
- [x] `GET /api/todos?status=completed` — 완료 조회
- [x] `GET /api/todos?status=overdue` — 기한 초과 조회 (KST 기준)

---

### BE-10: Express 앱 통합

**설명**: `app.js` — CORS·JSON 파싱·라우터 통합·에러 핸들러 등록, `server.js` — 서버 시작

**의존성**
- [ ] BE-07 완료
- [ ] BE-08 완료
- [ ] BE-09 완료

**완료 조건**
- [ ] `app.js` — cors(CORS_ORIGIN), express.json(), 모든 라우터 등록, errorHandler 마지막 등록
- [ ] `server.js` — PORT 환경변수로 서버 시작, DB 연결 성공 후 listen 확인
- [ ] `npm run dev` 실행 후 `GET /` → 200 응답 확인
- [ ] 존재하지 않는 경로 → 404 확인
- [ ] CORS 헤더 (`Access-Control-Allow-Origin`) 응답 포함 확인

---

### BE-11: 백엔드 통합 검증

**설명**: 전체 API 흐름 통합 테스트 — US-01~US-06 시나리오 기반

**의존성**
- [ ] BE-10 완료
- [ ] DB-03 완료

**완료 조건**
- [ ] US-01 흐름: 회원가입 → 로그인(JWT 수신) → 할일 등록 정상 동작
- [ ] US-02 흐름: 카테고리 생성 → 할일 등록(카테고리 지정) → 카테고리별 조회 정상 동작
- [ ] US-03 흐름: 진행 중 필터 조회 → 완료 처리 → 완료 필터 확인 정상 동작
- [ ] US-04 흐름: 기한 초과 조회 → 날짜 수정 → 삭제 정상 동작
- [ ] US-06 흐름: 내 정보 수정 → 카테고리 삭제(하위 할일 재지정) → 로그아웃 정상 동작
- [ ] 모든 에러 응답이 `{ code, message }` 형식 준수 확인
- [ ] JWT 없이 보호 엔드포인트 접근 시 401 반환 확인

---

### BE-12: 백엔드 .env 설정 완성

**설명**: `.env` 파일의 모든 필수 환경변수 설정 최종 확인

**의존성**
- [ ] BE-02 완료

**완료 조건**
- [ ] 아래 모든 환경변수 설정 확인
  - [ ] `NODE_ENV`
  - [ ] `PORT`
  - [ ] `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - [ ] `JWT_SECRET` (최소 32자 이상)
  - [ ] `JWT_EXPIRY` (예: `7d`)
  - [ ] `CORS_ORIGIN`
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음 확인
- [ ] `.env.example` 파일에 실제 값 없이 키만 명시 확인

---

### BE-13: v2 설정 API 구현 (Settings Controller·Router)

**설명**: UC-018~019 언어·테마 설정 API 구현 (v2)

**의존성**
- [ ] BE-06 완료
- [ ] BE-11 완료 (v1 완성 후 진행)

**완료 조건**
- [ ] `PATCH /api/users/me/language` — 언어 설정 저장 (200, 인증 필요)
  - [ ] 유효하지 않은 언어 코드(ko/en/ja 외) → 400
- [ ] `PATCH /api/users/me/theme` — 테마 설정 저장 (200, 인증 필요)
  - [ ] 유효하지 않은 테마 값(light/dark 외) → 400
- [ ] 로그인 응답에 변경된 language·themeMode 포함 확인

---

## FRONTEND

---

### FE-01: 프로젝트 초기화

**설명**: `frontend/` 디렉토리 생성, Vite + React 19 + TypeScript 초기화, 디렉토리 구조 생성

**의존성**
- [ ] 없음 (시작점)

**완료 조건**
- [ ] `npm create vite@latest frontend -- --template react-ts` 실행 완료
- [ ] `frontend/src/` 하위 디렉토리 구조 생성
  ```
  components/{common,layout,auth,todo,category}
  pages, hooks, stores, api, types, utils, constants, styles
  ```
- [ ] 의존성 설치 완료
  - 필수: `zustand`, `@tanstack/react-query`, `axios`, `react-router-dom`
  - 개발: `eslint`, `prettier`, `vitest`, `@testing-library/react`, `@playwright/test`
- [ ] `npm run dev` 실행 후 브라우저 접속 확인 (`http://localhost:5173`)
- [ ] `frontend/.env.example` 생성 (`VITE_API_BASE_URL`, `VITE_APP_NAME`)

---

### FE-02: 타입 정의, 상수, 유틸리티

**설명**: TypeScript 타입, API 상수, 공통 유틸리티 함수 구현

**의존성**
- [ ] FE-01 완료

**완료 조건**

**types/**
- [ ] `auth.types.ts` — `User`, `LoginRequest`, `LoginResponse`, `SignupRequest`
- [ ] `todo.types.ts` — `Todo`, `TodoStatus`, `CreateTodoRequest`, `UpdateTodoRequest`
- [ ] `category.types.ts` — `Category`, `CreateCategoryRequest`
- [ ] `api.types.ts` — `ApiError({ code, message })`, `ApiResponse<T>`

**constants/**
- [ ] `api.ts` — `API_BASE_URL`, 엔드포인트 경로 상수
- [ ] `queryKeys.ts` — TanStack Query Key 상수 (`['todos', userId]` 등)

**utils/**
- [ ] `dateUtils.ts` — KST 기준 오늘 날짜 계산, 날짜 포맷 함수
- [ ] `validation.ts` — 이메일 형식, 비밀번호 8자 이상, 날짜 범위(endDate >= startDate) 검증
- [ ] `errorHandler.ts` — API 에러 코드 → 사용자 표시 메시지 변환

---

### FE-03: API Client 기반 설정

**설명**: Axios 인스턴스 생성, 인터셉터 설정 (토큰 자동 주입, 401 처리)

**의존성**
- [ ] FE-02 완료

**완료 조건**
- [ ] `api/client.ts` — Axios 인스턴스 생성 (`baseURL = VITE_API_BASE_URL`)
- [ ] 요청 인터셉터 — `Authorization: Bearer <token>` 헤더 자동 주입
- [ ] 응답 인터셉터 — 401 수신 시 로그인 페이지 리다이렉트
- [ ] `api/authClient.ts` — `signup`, `login`, `logout`, `updateProfile` 함수
- [ ] `api/categoryClient.ts` — `getCategories`, `createCategory`, `updateCategory`, `deleteCategory` 함수
- [ ] `api/todoClient.ts` — `getTodos(filter?)`, `createTodo`, `updateTodo`, `deleteTodo`, `toggleComplete` 함수

---

### FE-04: Zustand Store 구현

**설명**: 인증 상태, UI 상태 전역 Store 구현

**의존성**
- [ ] FE-03 완료

**완료 조건**
- [ ] `stores/authStore.ts` — `user`, `token` 상태, `setAuth()`, `clearAuth()` 액션 구현
  - [ ] 토큰 localStorage 저장·복원 처리
- [ ] `stores/uiStore.ts` — `activeFilter`, `selectedCategoryId` 상태, `setFilter()`, `setCategory()` 액션 구현
- [ ] 앱 시작 시 localStorage에서 토큰 복원하여 인증 상태 초기화 확인

---

### FE-05: 인증 기능 (Hook·컴포넌트)

**설명**: 회원가입·로그인·로그아웃 Hook 및 폼 컴포넌트 구현

**의존성**
- [ ] FE-04 완료
- [ ] BE-07 완료 (백엔드 인증 API)

**완료 조건**
- [ ] `hooks/useAuth.ts` — `useLogin()`, `useSignup()`, `useLogout()` TanStack Query mutation
- [ ] `components/auth/LoginForm.tsx` — 이메일·비밀번호 입력, 유효성 검증, 오류 메시지 표시
- [ ] `components/auth/SignupForm.tsx` — 이메일·비밀번호·이름 입력, 유효성 검증, 오류 메시지 표시
- [ ] 로그인 성공 시 토큰을 authStore에 저장, 메인 페이지로 리다이렉트
- [ ] 이메일 중복(409), 비밀번호 오류(400), 인증 실패(401) 에러 메시지 표시 확인

---

### FE-06: 인증 화면 구현 (S-01, S-02)

**설명**: 회원가입 페이지(S-01), 로그인 페이지(S-02) 구현

**의존성**
- [ ] FE-05 완료

**완료 조건**
- [ ] `pages/SignupPage.tsx` — SignupForm 렌더링, 가입 후 로그인 페이지 이동
- [ ] `pages/LoginPage.tsx` — LoginForm 렌더링, 로그인 후 메인 페이지 이동, 회원가입 링크
- [ ] `components/layout/AuthLayout.tsx` — 인증 화면 공통 레이아웃 (중앙 정렬)
- [ ] 반응형 레이아웃 (모바일·데스크톱) 확인

---

### FE-07: 공통·레이아웃 컴포넌트 구현

**설명**: 재사용 가능한 공통 컴포넌트 및 메인 레이아웃 구현

**의존성**
- [ ] FE-04 완료

**완료 조건**
- [ ] `components/common/Button.tsx` — variant(primary·secondary·danger), disabled, loading 상태
- [ ] `components/common/Input.tsx` — label, error 메시지, type(text·password·date)
- [ ] `components/common/Header.tsx` — 앱 타이틀, 내 정보 수정·로그아웃 링크
- [ ] `components/layout/MainLayout.tsx` — Header + 콘텐츠 영역 레이아웃

---

### FE-08: 카테고리 기능 (Hook·컴포넌트)

**설명**: 카테고리 조회·생성·수정·삭제 Hook 및 컴포넌트 구현

**의존성**
- [ ] FE-07 완료
- [ ] BE-08 완료 (백엔드 카테고리 API)

**완료 조건**
- [ ] `hooks/useCategory.ts` — `useCategories()` 조회, `useCategoryMutation()` CRUD TanStack Query
- [ ] `components/category/CategoryList.tsx` — 카테고리 목록 표시, 생성·수정·삭제 UI
- [ ] 기본 카테고리 수정·삭제 시 422 에러 메시지 표시 확인
- [ ] 카테고리 삭제 후 TanStack Query 캐시 자동 갱신 확인

---

### FE-09: 할일 기능 (Hook·컴포넌트)

**설명**: 할일 조회·등록·수정·삭제·완료 처리 Hook 및 카드 컴포넌트 구현

**의존성**
- [ ] FE-07 완료
- [ ] FE-08 완료
- [ ] BE-09 완료 (백엔드 할일 API)

**완료 조건**
- [ ] `hooks/useTodoList.ts` — `useTodos(filter)` TanStack Query, 필터 파라미터 처리
- [ ] `hooks/useTodoMutation.ts` — `useCreateTodo()`, `useUpdateTodo()`, `useDeleteTodo()`, `useToggleComplete()` mutation
- [ ] `components/todo/TodoCard.tsx` — 제목·카테고리·날짜·상태 표시, 완료 토글 버튼, 수정·삭제 버튼
- [ ] 할일 상태 배지 표시: 시작 전·진행 중·완료·기한 초과 (색상 구분)
- [ ] 완료 토글 후 캐시 자동 갱신 (진행 중 목록에서 제거) 확인

---

### FE-10: 할일 목록 메인 화면 (S-03)

**설명**: 필터 탭 + 할일 카드 목록 메인 화면 구현

**의존성**
- [ ] FE-09 완료

**완료 조건**
- [ ] `pages/TodoListPage.tsx` — MainLayout + 필터 + 할일 목록
- [ ] 필터 탭 구현: 전체·카테고리별·시작 전·진행 중·완료·기한 초과 (UC-012~017)
- [ ] 카테고리 필터 선택 시 드롭다운으로 카테고리 선택 가능
- [ ] 할일 없을 경우 빈 상태 메시지 표시
- [ ] 할일 등록 버튼 → S-04 이동
- [ ] 반응형 레이아웃 확인

---

### FE-11: 할일 등록·수정 화면 (S-04)

**설명**: 할일 등록 및 수정 폼 구현

**의존성**
- [ ] FE-09 완료

**완료 조건**
- [ ] `pages/TodoFormPage.tsx` (또는 `components/todo/TodoForm.tsx`) — 등록·수정 겸용 폼
- [ ] 필드: 제목(200자), 설명(2000자, 선택), 카테고리 선택, 시작일자, 종료일자
- [ ] 카테고리 기본값 = 기본 카테고리 자동 선택
- [ ] 종료일 < 시작일 → 422 에러 메시지 표시 (클라이언트 및 서버 측 모두)
- [ ] 등록·수정 성공 후 할일 목록으로 이동 및 캐시 갱신 확인

---

### FE-12: 내 정보 수정 화면 (S-05)

**설명**: 이름·비밀번호 수정 폼 및 로그아웃 기능 구현

**의존성**
- [ ] FE-07 완료
- [ ] BE-07 완료 (백엔드 내 정보 수정 API)

**완료 조건**
- [ ] `pages/ProfilePage.tsx` — 이름·비밀번호 수정 폼, 저장·취소 버튼, 로그아웃 버튼
- [ ] 비밀번호 8자 미만 → 400 에러 메시지 표시
- [ ] 로그아웃 클릭 시 authStore 초기화, localStorage 토큰 삭제, 로그인 페이지 이동 확인
- [ ] 카테고리 관리 UI 포함 (CategoryList 컴포넌트 재사용)

---

### FE-13: 라우팅 통합 및 인증 보호

**설명**: React Router 설정, 인증 여부에 따른 라우팅 보호 구현

**의존성**
- [ ] FE-06 완료
- [ ] FE-10 완료
- [ ] FE-11 완료
- [ ] FE-12 완료

**완료 조건**
- [ ] `App.tsx` — BrowserRouter + TanStack Query Provider + 전체 라우트 설정
- [ ] ProtectedRoute 컴포넌트 구현 — 미인증 시 `/login`으로 리다이렉트
- [ ] 라우트 구성 확인
  - [ ] `/signup` → SignupPage (미인증만 접근)
  - [ ] `/login` → LoginPage (미인증만 접근)
  - [ ] `/` → TodoListPage (인증 필요)
  - [ ] `/todos/new` → TodoFormPage (인증 필요)
  - [ ] `/todos/:id/edit` → TodoFormPage (인증 필요)
  - [ ] `/profile` → ProfilePage (인증 필요)
  - [ ] `*` → NotFoundPage
- [ ] 로그인 상태에서 `/login` 접근 시 `/`로 리다이렉트 확인

---

### FE-14: 통합 검증 및 반응형

**설명**: 전체 사용자 흐름 통합 검증, 반응형 UI 최종 확인

**의존성**
- [ ] FE-13 완료
- [ ] BE-11 완료

**완료 조건**
- [ ] US-01 흐름 전체 동작 확인 (회원가입 → 로그인 → 할일 등록)
- [ ] US-02 흐름 전체 동작 확인 (카테고리 생성 → 할일 분류 → 필터 조회)
- [ ] US-03 흐름 전체 동작 확인 (진행 중 조회 → 완료 처리)
- [ ] US-04 흐름 전체 동작 확인 (기한 초과 조회 → 수정·삭제)
- [ ] US-05 흐름 전체 동작 확인 (전체 필터 점검)
- [ ] US-06 흐름 전체 동작 확인 (내 정보·카테고리 정리 → 로그아웃)
- [ ] Chrome, Edge, Firefox 최신 버전에서 정상 동작 확인
- [ ] 모바일(375px), 태블릿(768px), 데스크톱(1280px) 반응형 레이아웃 확인
- [ ] 네트워크 오류 시 사용자 친화적 오류 메시지 표시 확인

---

## Task 완료 체크리스트 요약

### Database
- [x] DB-01: 개발 환경 구성
- [x] DB-02: 스키마 생성 (DDL 실행)
- [x] DB-03: 테스트 시드 데이터 작성

### Backend
- [x] BE-01: 프로젝트 초기화
- [x] BE-02: 환경변수 및 DB 연결 설정
- [x] BE-03: 공통 유틸리티 구현
- [x] BE-04: 미들웨어 구현
- [x] BE-05: Repository 레이어 구현
- [x] BE-06: Service 레이어 구현
- [x] BE-07: 인증 API 구현
- [x] BE-08: 카테고리 API 구현
- [x] BE-09: 할일 API 구현
- [ ] BE-10: Express 앱 통합
- [ ] BE-11: 백엔드 통합 검증
- [ ] BE-12: 백엔드 .env 설정 완성
- [ ] BE-13: v2 설정 API 구현 *(v2)*

### Frontend
- [ ] FE-01: 프로젝트 초기화
- [ ] FE-02: 타입 정의, 상수, 유틸리티
- [ ] FE-03: API Client 기반 설정
- [ ] FE-04: Zustand Store 구현
- [ ] FE-05: 인증 기능 (Hook·컴포넌트)
- [ ] FE-06: 인증 화면 구현 (S-01, S-02)
- [ ] FE-07: 공통·레이아웃 컴포넌트 구현
- [ ] FE-08: 카테고리 기능 (Hook·컴포넌트)
- [ ] FE-09: 할일 기능 (Hook·컴포넌트)
- [ ] FE-10: 할일 목록 메인 화면 (S-03)
- [ ] FE-11: 할일 등록·수정 화면 (S-04)
- [ ] FE-12: 내 정보 수정 화면 (S-05)
- [ ] FE-13: 라우팅 통합 및 인증 보호
- [ ] FE-14: 통합 검증 및 반응형
