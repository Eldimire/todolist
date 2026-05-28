# TodoList 프로젝트 구조 설계 원칙

> 버전: 1.0.2
> 작성일: 2026-05-27

---

## 변경 이력

| 버전 | 변경일 | 변경 내용 | 변경 유형 |
|------|--------|-----------|-----------|
| v1.0.0 | 2026-05-27 | 최초 문서 작성 (공통 최상위 원칙, 의존성/레이어 원칙, 코드/네이밍 원칙, 테스트/품질 원칙, 설정/보안/운영 원칙, 프론트엔드/백엔드 디렉토리 구조) | 신규 |
| v1.0.1 | 2026-05-27 | 백엔드 필수 환경변수에 CORS_ORIGIN 추가 | 수정 |
| v1.0.2 | 2026-05-27 | TanStack Query 명칭 통일, PostgreSQL 버전 명시, Prisma 금지 문구 추가 | 수정 |
| v1.0.3 | 2026-05-28 | 백엔드 디렉토리 구조를 실제 구현에 맞게 업데이트 (settings/user controller 통합, validation middleware 제거, database/ 위치 수정, 테스트 구조 반영) | 수정 |

---

## 1. 공통 최상위 원칙

### 1.1 단일 책임 원칙 (Single Responsibility Principle)
각 모듈, 함수, 클래스는 하나의 책임만 가져야 한다.

- **프론트엔드**: 컴포넌트는 UI 렌더링, Hook은 로직, 상태 관리는 Zustand/TanStack Query
- **백엔드**: Router는 라우팅, Controller는 요청 처리, Service는 비즈니스 로직, Repository는 데이터 접근

### 1.2 관심사 분리 (Separation of Concerns)
프로그래밍 관심사를 명확히 분리하여 유지보수성 향상

- **프론트엔드**: UI 로직 ≠ 비즈니스 로직 ≠ API 통신 ≠ 상태 관리
- **백엔드**: 라우팅 ≠ 요청 처리 ≠ 비즈니스 규칙 ≠ DB 접근 ≠ 보안

### 1.3 일관성 (Consistency)
동일한 문제에 대해 동일한 방식으로 해결

- 파일명/폴더명 규칙 일관성 유지
- 함수명/변수명 네이밍 규칙 일관성 유지
- 에러 처리 방식 일관성 유지
- 로깅 방식 일관성 유지

### 1.4 과도한 최적화 금지 (No Over-engineering)
지시한 작업만 수행하며, 불필요한 복잡성 배제

- YAGNI (You Aren't Gonna Need It) 원칙 준수
- 현재 필요한 기능만 구현
- 미래 확장성을 고려하되, 지금의 요구사항만 충족

---

## 2. 의존성/레이어 원칙

### 2.1 프론트엔드 레이어 구조

```
UI Layer (React Components)
    ↓ 의존
State Management Layer (Zustand + TanStack Query)
    ↓ 의존
API Client Layer (HTTP 클라이언트)
    ↓ 의존
Network Layer (Axios / Fetch)
```

**의존 방향**: 위 → 아래 (역방향 의존 금지)
- 컴포넌트는 상태 관리 Hook을 호출
- Hook은 API 클라이언트 함수를 호출
- API 클라이언트는 네트워크 라이브러리 사용
- 역방향 호출 절대 금지

### 2.2 백엔드 레이어 구조

```
Router (Express routes)
    ↓ 의존
Controller (요청 처리 & 응답 반환)
    ↓ 의존
Service (비즈니스 로직 & 규칙)
    ↓ 의존
Repository (데이터 접근 & DB 쿼리)
    ↓ 의존
Database (PostgreSQL 17)
```

**의존 방향**: 위 → 아래 (역방향 의존 금지)
- Router는 Controller 함수 호출
- Controller는 Service 메서드 호출
- Service는 Repository 메서드 호출
- Repository는 pg 라이브러리로 DB 직접 쿼리
- 역방향 호출 절대 금지

### 2.3 레이어 간 책임 분담

**Router**
- HTTP 메서드(GET, POST, PATCH, DELETE) 매핑
- 경로(path) 정의
- 미들웨어 적용 (인증, 에러 처리)
- 요청을 Controller로 전달

**Controller**
- HTTP 요청 수신 (req, res)
- 요청 데이터 검증 (필드 유무, 형식)
- Service 호출
- HTTP 응답 반환 (상태 코드, 본문)
- 에러 응답 처리

**Service**
- 도메인 비즈니스 로직 구현
- 비즈니스 규칙(BR-01 ~ BR-06) 적용
- 다중 Repository 호출 조율
- 트랜잭션 관리 (필요 시)
- 데이터 가공 및 검증

**Repository**
- SQL 쿼리 생성 및 실행
- pg 라이브러리 파라미터 바인딩 사용
- DB에서 데이터 조회/저장/수정/삭제
- DB 관련 에러를 Service에 전파

---

## 3. 코드/네이밍 원칙

### 3.1 파일 및 폴더명 규칙

#### 프론트엔드

| 항목 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase, .tsx 확장자 | `TodoList.tsx`, `LoginForm.tsx` |
| Hook 파일 | 소문자 시작, useCamelCase, .ts 확장자 | `useTodoList.ts`, `useAuth.ts` |
| Store (Zustand) 파일 | 소문자 시작, Store 접미사, .ts 확장자 | `authStore.ts`, `todoStore.ts` |
| API 클라이언트 파일 | 소문자 시작, Client 접미사, .ts 확장자 | `authClient.ts`, `todoClient.ts` |
| 유틸리티 파일 | 소문자, 기능 이름, .ts 확장자 | `dateUtils.ts`, `validation.ts` |
| 타입 정의 파일 | 소문자, types.ts 또는 domain.ts | `todo.types.ts`, `auth.domain.ts` |
| 폴더명 | 소문자, 복수형 또는 기능 단위 | `components/`, `hooks/`, `stores/`, `api/` |

#### 백엔드

| 항목 | 규칙 | 예시 |
|------|------|------|
| Router 파일 | 소문자, .route.js 확장자 | `auth.route.js`, `todo.route.js` |
| Controller 파일 | 소문자, .controller.js 확장자 | `auth.controller.js`, `todo.controller.js` |
| Service 파일 | 소문자, .service.js 확장자 | `auth.service.js`, `todo.service.js` |
| Repository 파일 | 소문자, .repository.js 확장자 | `user.repository.js`, `todo.repository.js` |
| 미들웨어 파일 | 소문자, .middleware.js 확장자 | `auth.middleware.js`, `errorHandler.middleware.js` |
| 설정/유틸리티 파일 | 소문자, 기능 이름, .js 확장자 | `config.js`, `logger.js`, `validators.js` |
| 폴더명 | 소문자, 단수형 | `route/`, `controller/`, `service/`, `repository/` |

### 3.2 함수/변수명 규칙

#### 프론트엔드

| 항목 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 함수명 | PascalCase | `export function TodoList() { }` |
| Hook 함수명 | useCamelCase | `function useTodoList() { }` |
| 일반 함수명 | camelCase | `fetchTodos()`, `calculateStatus()` |
| 변수명 | camelCase | `const todayDate = new Date()` |
| 상수명 | UPPER_SNAKE_CASE | `const API_BASE_URL = '...'` |
| 이벤트 핸들러 | handle + CamelCase | `handleTodoClick()`, `handleSubmit()` |
| Boolean 변수 | is/has/can + CamelCase | `isLoading`, `hasError`, `canDelete` |
| Store 메서드 | 동사 + 명사 (Zustand action) | `addTodo()`, `updateTodo()`, `removeTodo()` |
| Query Key | 배열 형식 | `['todos', userId]`, `['categories', userId]` |

#### 백엔드

| 항목 | 규칙 | 예시 |
|------|------|------|
| 라우트 핸들러 | camelCase | `router.get('/todos', getTodos)` |
| Controller 메서드 | camelCase | `async createTodo(req, res) { }` |
| Service 메서드 | camelCase | `async createTodo(userId, data) { }` |
| Repository 메서드 | camelCase | `async findByUserId(userId) { }` |
| 변수명 | camelCase | `const userId = req.user.id` |
| 상수명 | UPPER_SNAKE_CASE | `const JWT_EXPIRY = '7d'` |
| 데이터베이스 컬럼명 | snake_case | `user_id`, `created_at`, `is_completed` |
| SQL 쿼리 별칭 | snake_case 또는 CamelCase | `SELECT id, user_id FROM users` |
| 에러 코드 | UPPER_SNAKE_CASE | `INVALID_DATE_RANGE`, `UNAUTHORIZED` |

### 3.3 컴포넌트명 규칙 (프론트엔드)

| 용도 | 규칙 | 예시 |
|------|------|------|
| 페이지 컴포넌트 | Page + 기능명 | `LoginPage.tsx`, `TodoListPage.tsx` |
| 폼 컴포넌트 | 기능명 + Form | `LoginForm.tsx`, `TodoForm.tsx` |
| 리스트 컴포넌트 | 데이터명 + List | `TodoList.tsx`, `CategoryList.tsx` |
| 카드/아이템 컴포넌트 | 데이터명 + Card/Item | `TodoCard.tsx`, `CategoryItem.tsx` |
| 모달/다이얼로그 컴포넌트 | 기능명 + Modal/Dialog | `ConfirmModal.tsx`, `EditDialog.tsx` |
| 레이아웃 컴포넌트 | Layout + 이름 | `MainLayout.tsx`, `AuthLayout.tsx` |
| 공유 컴포넌트 | 기능명 | `Button.tsx`, `Input.tsx`, `Header.tsx` |

---

## 4. 테스트/품질 원칙

### 4.1 테스트 전략

#### 프론트엔드
- **단위 테스트**: Hook, 유틸리티 함수, 상태 관리 로직
- **통합 테스트**: 컴포넌트 렌더링, 사용자 상호작용, API 연동
- **E2E 테스트**: 전체 사용자 흐름 (US-01 ~ US-07)
- **프레임워크**: Vitest, React Testing Library, Playwright

#### 백엔드
- **단위 테스트**: Service 메서드, Repository 메서드
- **통합 테스트**: API 엔드포인트, 데이터베이스 연동
- **E2E 테스트**: 전체 기능별 API 시나리오
- **프레임워크**: Jest, Supertest

### 4.2 테스트 커버리지 기준

| 대상 | 최소 커버리지 |
|------|----------|
| Service (백엔드) | 80% 이상 |
| Repository (백엔드) | 70% 이상 |
| Hook (프론트엔드) | 75% 이상 |
| Utility 함수 | 80% 이상 |
| Controller/Route (백엔드) | 60% 이상 |
| Component (프론트엔드) | 50% 이상 |

### 4.3 코드 품질 도구

#### 프론트엔드
- **Linter**: ESLint
- **포매터**: Prettier
- **타입 검사**: TypeScript strict mode
- **성능 분석**: Lighthouse, React DevTools Profiler

#### 백엔드
- **Linter**: ESLint
- **포매터**: Prettier
- **코드 분석**: SonarQube (선택)
- **보안 검사**: npm audit, Snyk

---

## 5. 설정/보안/운영 원칙

### 5.1 환경변수 관리

#### 규칙
- `.env` 파일은 git 저장소에 커밋하지 않음
- `.env.example` 파일에는 예제만 포함 (실제 값 없음)
- 환경별 구분: `.env.local` (개발), `.env.staging`, `.env.production`
- 모든 민감한 정보(API 키, 토큰, DB 비밀번호)는 환경변수로 관리

#### 필수 환경변수

**프론트엔드**
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=TodoList
```

**백엔드**
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist
DB_USER=postgres
DB_PASSWORD=<실제 비밀번호>
JWT_SECRET=<실제 시크릿 키>
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
```

### 5.2 JWT 보안 원칙

#### 발급
- JWT_SECRET은 충분히 복잡하고 긴 문자열 (최소 32자)
- 만료 시간(JWT_EXPIRY) 설정 필수 (기본값: 7일)
- 토큰은 응답 본문 또는 HttpOnly 쿠키에 포함
- 로그인 시에만 발급

#### 검증
- 모든 보호된 엔드포인트에서 토큰 검증 필수
- 토큰이 없으면 HTTP 401 반환
- 토큰이 유효하지 않으면 HTTP 401 반환
- 토큰이 만료되면 HTTP 401 반환

#### 저장 (프론트엔드)
- 토큰은 localStorage 또는 sessionStorage에 저장
- XSS 공격 대비: 민감한 정보는 저장하지 않음
- CSRF 공격 대비: CSRF 토큰 또는 SameSite 쿠키 속성 사용

### 5.3 SQL Injection 방지

#### 규칙
- ORM(Prisma) 사용 금지, **pg 라이브러리** 직접 사용
- pg 라이브러리의 **파라미터 바인딩** 필수 사용
- 동적 SQL 문자열 연결 절대 금지

**올바른 예**:
```javascript
const result = await client.query(
  'SELECT * FROM todos WHERE user_id = $1 AND id = $2',
  [userId, todoId]  // 파라미터 바인딩
);
```

**잘못된 예** (금지):
```javascript
// 절대 이렇게 하지 않기
const query = `SELECT * FROM todos WHERE user_id = '${userId}'`;
```

### 5.4 인증 미들웨어

#### 백엔드 인증 미들웨어
- 모든 보호된 라우트 앞에 인증 미들웨어 적용
- 토큰에서 userId 추출 및 req.user에 저장
- 토큰 검증 실패 시 HTTP 401 반환

#### 프론트엔드 토큰 관리
- 로그인 성공 시 토큰 저장
- 모든 API 요청의 Authorization 헤더에 토큰 포함
- 토큰이 없으면 자동으로 로그인 페이지로 리다이렉트

### 5.5 운영 원칙

#### 로깅
- 모든 에러는 구조화된 로그로 기록
- 민감한 정보(비밀번호, 토큰)는 로그에 기록하지 않음
- 로그 레벨: ERROR, WARN, INFO, DEBUG

#### 모니터링
- API 응답 시간 추적
- 에러 발생률 추적
- 데이터베이스 연결 상태 모니터링

#### 배포
- 환경변수는 배포 시점에 설정
- 데이터베이스 마이그레이션은 배포 전 실행
- 롤백 전략 수립 및 테스트

---

## 6. 프론트엔드 디렉토리 구조

```
frontend/
├── src/
│   ├── components/                # React 컴포넌트
│   │   ├── common/               # 공유 컴포넌트 (재사용 가능)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ...
│   │   ├── layout/               # 레이아웃 컴포넌트
│   │   │   ├── MainLayout.tsx   # 메인 화면 레이아웃
│   │   │   ├── AuthLayout.tsx   # 인증 화면 레이아웃
│   │   │   └── ...
│   │   ├── auth/                 # 인증 관련 컴포넌트
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ...
│   │   ├── todo/                 # 할일 관련 컴포넌트
│   │   │   ├── TodoList.tsx     # 할일 목록 (필터 포함)
│   │   │   ├── TodoCard.tsx     # 할일 카드
│   │   │   ├── TodoForm.tsx     # 할일 등록/수정 폼
│   │   │   └── ...
│   │   ├── category/             # 카테고리 관련 컴포넌트
│   │   │   ├── CategoryList.tsx
│   │   │   ├── CategoryItem.tsx
│   │   │   └── ...
│   │   └── settings/             # 설정 관련 컴포넌트 (v2)
│   │       ├── LanguageSettings.tsx
│   │       ├── ThemeSettings.tsx
│   │       └── ...
│   │
│   ├── pages/                    # 페이지 컴포넌트 (라우팅 대상)
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── TodoListPage.tsx      # 메인 페이지
│   │   ├── TodoDetailPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SettingsPage.tsx      # v2
│   │   └── NotFoundPage.tsx
│   │
│   ├── hooks/                    # 커스텀 React Hook
│   │   ├── useAuth.ts           # 인증 로직
│   │   ├── useTodoList.ts       # 할일 목록 조회 로직
│   │   ├── useTodoMutation.ts   # 할일 CRUD 로직
│   │   ├── useCategory.ts       # 카테고리 로직
│   │   └── ...
│   │
│   ├── stores/                   # Zustand 상태 관리 Store
│   │   ├── authStore.ts         # 인증 상태 (로그인 정보, 토큰)
│   │   ├── uiStore.ts           # UI 상태 (필터, 선택된 카테고리 등)
│   │   ├── settingsStore.ts     # 설정 상태 (언어, 테마) (v2)
│   │   └── ...
│   │
│   ├── api/                      # API 클라이언트
│   │   ├── client.ts            # Axios 또는 Fetch 인스턴스
│   │   ├── authClient.ts        # 인증 API
│   │   ├── todoClient.ts        # 할일 API
│   │   ├── categoryClient.ts    # 카테고리 API
│   │   ├── settingsClient.ts    # 설정 API (v2)
│   │   └── ...
│   │
│   ├── types/                    # TypeScript 타입 정의
│   │   ├── auth.types.ts
│   │   ├── todo.types.ts
│   │   ├── category.types.ts
│   │   ├── api.types.ts         # API 응답/요청 타입
│   │   └── ...
│   │
│   ├── utils/                    # 유틸리티 함수
│   │   ├── dateUtils.ts         # 날짜 관련 유틸
│   │   ├── validation.ts        # 폼 검증 함수
│   │   ├── errorHandler.ts      # 에러 처리 유틸
│   │   └── ...
│   │
│   ├── constants/                # 상수 정의
│   │   ├── api.ts               # API URL, 엔드포인트
│   │   ├── messages.ts          # 사용자 메시지
│   │   ├── queryKeys.ts         # TanStack Query Key
│   │   └── ...
│   │
│   ├── i18n/                     # 국제화 (다국어) (v2)
│   │   ├── resources/
│   │   │   ├── ko.json          # 한국어 메시지
│   │   │   ├── en.json          # 영어 메시지
│   │   │   ├── ja.json          # 일본어 메시지
│   │   │   └── ...
│   │   ├── config.ts            # i18n 설정
│   │   └── useTranslation.ts    # 다국어 Hook (또는 라이브러리 사용)
│   │
│   ├── styles/                   # 전역 스타일
│   │   ├── globals.css          # 전역 스타일
│   │   ├── variables.css        # CSS 변수 (테마)
│   │   └── ...
│   │
│   ├── App.tsx                   # 루트 컴포넌트
│   ├── main.tsx                  # 엔트리 포인트
│   └── index.html
│
├── public/                       # 정적 파일
│   └── ...
│
├── tests/                        # 테스트 파일
│   ├── unit/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── ...
│   ├── integration/
│   │   └── ...
│   └── e2e/
│       └── ...
│
├── .env.example                  # 환경변수 예제
├── package.json
├── tsconfig.json
├── vite.config.ts               # Vite 설정 (React 19)
├── vitest.config.ts             # Vitest 설정
└── ...
```

### 6.1 프론트엔드 디렉토리 상세 설명

**components/**
- 재사용 가능한 React 컴포넌트 모음
- 기능/도메인별로 하위 폴더 분류
- 각 컴포넌트는 독립적으로 테스트 가능

**pages/**
- 라우팅의 대상이 되는 페이지 컴포넌트
- URL 경로와 1:1 대응
- 여러 컴포넌트를 조합하여 구성

**hooks/**
- 커스텀 React Hook
- Hook은 상태 관리와 사이드 이펙트 처리
- 컴포넌트 로직의 재사용을 위해 분리

**stores/**
- Zustand를 이용한 클라이언트 상태 관리
- 전역 상태(인증, UI, 설정)를 관리
- 각 Store는 하나의 도메인만 관리

**api/**
- API 통신 클라이언트
- HTTP 요청/응답 처리
- 에러 처리 및 재시도 로직 포함

**types/**
- TypeScript 타입 정의
- 도메인별로 분류
- API 요청/응답 타입도 포함

**utils/**
- 순수 함수 모음
- 날짜, 검증, 포맷팅 등 범용 로직

**constants/**
- 변경되지 않는 상수 정의
- API URL, 메시지, 열거형 값 등

**i18n/**
- 다국어 지원 (v2)
- 언어별 메시지 리소스
- 언어 전환 로직

---

## 7. 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── route/                    # Express 라우트 정의
│   │   ├── auth.route.js        # 인증 API 라우트 (signup, login, logout)
│   │   ├── todo.route.js        # 할일 API 라우트
│   │   ├── category.route.js    # 카테고리 API 라우트
│   │   └── user.route.js        # 사용자 정보 API 라우트 (me, me/language, me/theme)
│   │
│   ├── controller/               # HTTP 요청 처리 로직
│   │   ├── auth.controller.js   # 인증 + 사용자 설정 컨트롤러
│   │   │   ├── signup()         # F-AUTH-001 회원가입
│   │   │   ├── login()          # F-AUTH-002 로그인
│   │   │   ├── logout()         # F-AUTH-003 로그아웃
│   │   │   ├── updateProfile()  # F-AUTH-004 내 정보 수정 (이름·비밀번호)
│   │   │   ├── updateLanguage() # UC-018 언어 설정 (v2)
│   │   │   └── updateTheme()    # UC-019 테마 설정 (v2)
│   │   ├── todo.controller.js   # 할일 컨트롤러
│   │   │   ├── createTodo()     # F-TODO-001 할일 등록
│   │   │   ├── updateTodo()     # F-TODO-002 할일 수정
│   │   │   ├── deleteTodo()     # F-TODO-003 할일 삭제
│   │   │   ├── toggleComplete() # F-TODO-004 완료 처리
│   │   │   └── getTodos()       # F-TODO-005~010 조회 (필터: categoryId, status)
│   │   └── category.controller.js
│   │       ├── getCategories()      # F-CAT-004 카테고리 조회
│   │       ├── createCategory()     # F-CAT-001 카테고리 등록
│   │       ├── updateCategory()     # F-CAT-002 카테고리 수정
│   │       └── deleteCategory()     # F-CAT-003 카테고리 삭제
│   │
│   ├── service/                  # 비즈니스 로직
│   │   ├── auth.service.js      # 인증 + 사용자 설정 서비스
│   │   │   ├── signup()         # 회원가입 로직 (기본 카테고리 자동 생성)
│   │   │   ├── login()          # 로그인 로직 (language·themeMode 포함 반환)
│   │   │   ├── updateProfile()  # 프로필 수정 (이름·비밀번호)
│   │   │   ├── updateLanguage() # 언어 설정 저장 (v2)
│   │   │   └── updateTheme()    # 테마 설정 저장 (v2)
│   │   ├── todo.service.js      # 할일 서비스
│   │   │   ├── createTodo()     # 할일 생성 (BR-03, BR-05 적용)
│   │   │   ├── updateTodo()     # 할일 수정 (BR-05 적용)
│   │   │   ├── deleteTodo()     # 할일 삭제 (BR-02 소유권 확인)
│   │   │   ├── toggleComplete() # 완료 토글 (BR-06 상태 재계산)
│   │   │   └── getTodos()       # 할일 조회 (필터: categoryId, status)
│   │   └── category.service.js  # 카테고리 서비스
│   │       ├── getCategories()  # 카테고리 목록 조회
│   │       ├── createCategory() # 카테고리 생성
│   │       ├── updateCategory() # 카테고리 수정 (BR-04: 기본 카테고리 수정 불가)
│   │       └── deleteCategory() # 카테고리 삭제 (BR-04, 하위 할일 재지정)
│   │
│   ├── repository/               # 데이터 접근 계층
│   │   ├── user.repository.js
│   │   │   ├── findByEmail()
│   │   │   ├── findById()
│   │   │   ├── create()
│   │   │   └── update()         # name, password, language, themeMode 지원
│   │   ├── todo.repository.js
│   │   │   ├── create()
│   │   │   ├── findById()
│   │   │   ├── findByUserId()
│   │   │   ├── findByUserIdAndCategory()
│   │   │   ├── findByUserIdAndStatus() # status: not_started/in_progress/completed/overdue
│   │   │   ├── update()
│   │   │   ├── updateCategory() # 카테고리 재지정 (카테고리 삭제 시 사용)
│   │   │   └── deleteById()
│   │   └── category.repository.js
│   │       ├── create()
│   │       ├── findById()
│   │       ├── findByUserId()
│   │       ├── findDefaultByUserId()
│   │       ├── update()
│   │       └── deleteById()
│   │
│   ├── middleware/               # Express 미들웨어
│   │   ├── auth.middleware.js   # JWT 검증 미들웨어 (req.user = { id, email } 설정)
│   │   └── errorHandler.middleware.js  # 에러 → { code, message } JSON 응답 변환
│   │
│   ├── config/                   # 설정 파일
│   │   ├── database.js          # DB 연결 설정 (pg Pool, max: 20)
│   │   └── env.js               # 환경변수 로드 및 필수값 검증
│   │
│   ├── utils/                    # 유틸리티 함수
│   │   ├── jwt.js               # JWT 토큰 생성/검증
│   │   ├── hash.js              # 비밀번호 해싱 (bcrypt, saltRounds: 10)
│   │   ├── logger.js            # 로깅 (민감정보 필터링)
│   │   ├── errorCodes.js        # 에러 코드 상수 정의
│   │   └── AppError.js          # 커스텀 에러 클래스
│   │
│   ├── constants/                # 상수 정의
│   │   └── httpStatus.js        # HTTP 상태 코드 (200·201·400·401·403·404·409·422·500)
│   │
│   ├── app.js                    # Express 앱 설정 (CORS, 라우터, 에러 핸들러, Swagger UI)
│   └── server.js                 # 서버 시작점 (DB 연결 후 listen)
│
├── tests/                        # 테스트 파일
│   ├── routes/                  # 라우트 통합 테스트 (supertest + mock)
│   │   ├── auth.routes.test.js
│   │   ├── category.routes.test.js
│   │   └── todo.routes.test.js
│   ├── services/                # 서비스 단위 테스트 (mock repository)
│   │   ├── auth.service.test.js
│   │   ├── category.service.test.js
│   │   └── todo.service.test.js
│   └── integration/             # 실제 DB 연결 통합 테스트
│       └── scenarios.test.js    # US-01~06 시나리오 기반
│
├── swagger.json                  # OpenAPI 3.0 스펙 (Swagger UI 제공: /api-docs)
├── .env.example                  # 환경변수 예제
├── package.json
├── .eslintrc.js
└── .prettierrc

# 데이터베이스 관련 파일 (프로젝트 루트)
database/
├── schema.sql                    # 전체 DB 스키마 (DDL)
└── seeds/
    └── seed.js                   # 개발·테스트용 시드 데이터
```

### 7.1 백엔드 디렉토리 상세 설명

**route/**
- Express 라우터 정의
- 기능별로 분류 (auth, todo, category 등)
- 라우팅만 담당, 로직은 Controller로 위임

**controller/**
- HTTP 요청 수신 및 응답 반환
- 입력 데이터 검증
- Service 호출
- 에러 처리 및 HTTP 상태 코드 반환

**service/**
- 비즈니스 로직 구현
- 도메인 규칙(BR-01 ~ BR-06) 적용
- 여러 Repository 호출 조율
- Controller와 Repository 사이의 계층

**repository/**
- pg 라이브러리로 SQL 쿼리 실행
- 파라미터 바인딩으로 SQL Injection 방지
- DB 연결 및 쿼리 결과 처리
- 데이터베이스 전용 로직

**middleware/**
- JWT 토큰 검증 (auth.middleware.js)
- 에러 처리 (errorHandler.middleware.js)
- 입력값 검증은 각 컨트롤러에서 직접 처리

**config/**
- 데이터베이스 연결 설정
- 환경변수 로드
- 서버 포트, 로깅 레벨 등 설정

**utils/**
- JWT 토큰 생성/검증
- 비밀번호 해싱
- 로깅
- 에러 코드 정의

**constants/**
- HTTP 상태 코드 상수 (httpStatus.js)
- 에러 코드 상수는 utils/errorCodes.js에서 관리

**database/** (프로젝트 루트)
- DB 스키마 정의 (schema.sql)
- 테스트 데이터 시드 (seeds/seed.js)

---

## 참고

- 모든 경로와 패턴은 프로젝트 초기 상태에 기반하여 설계됨
- v2 기능(다국어, 테마)은 별도로 표기
- 디렉토리 구조는 필요에 따라 조정 가능하나, 레이어 분리 원칙은 반드시 유지
- 테스트 전략은 추후 상세 문서 작성 필요
