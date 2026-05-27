# TodoList 기술 아키텍처 다이어그램

> 버전: 1.0.1
> 작성일: 2026-05-27

---

## 변경 이력

| 버전 | 변경일 | 변경 내용 | 변경 유형 |
|------|--------|-----------|-----------|
| v1.0.0 | 2026-05-27 | 최초 문서 작성 (시스템 전체 구조, 백엔드 레이어 구조, 프론트엔드 레이어 구조) | 신규 |
| v1.0.1 | 2026-05-27 | Express.js → Express 표기 통일, 기술 스택 요약표에서 Vite 제거 | 수정 |

---

## 1. 시스템 전체 구조

시스템의 전체적인 구성 요소와 데이터 흐름을 표현합니다. 클라이언트(React)에서 시작하여 백엔드(Express)를 거쳐 데이터베이스(PostgreSQL)로 도달하는 흐름과 JWT 인증 메커니즘을 포함합니다.

```mermaid
graph TD
    Browser["🌐 Browser<br/>React 19 + TypeScript"]
    
    Browser -->|HTTP Request +<br/>JWT Token| ExpressAPI["🔧 Backend<br/>Express<br/>Node.js"]
    
    ExpressAPI -->|HTTP Response| Browser
    
    ExpressAPI -->|SQL Query<br/>pg 라이브러리| PostgreSQL["💾 Database<br/>PostgreSQL 17"]
    
    PostgreSQL -->|Query Result| ExpressAPI
    
    Auth["🔐 JWT Authentication"]
    
    Browser -->|1. 로그인 요청<br/>이메일/비밀번호| ExpressAPI
    ExpressAPI -->|2. JWT 토큰 발급<br/>만료: 7일| Browser
    Browser -->|3. 모든 요청에<br/>토큰 포함| ExpressAPI
    ExpressAPI -->|4. 토큰 검증<br/>req.user 설정| Auth
    
    style Browser fill:#e3f2fd
    style ExpressAPI fill:#fff3e0
    style PostgreSQL fill:#f3e5f5
    style Auth fill:#ffe0b2
```

---

## 2. 백엔드 레이어 구조

백엔드의 5계층 아키텍처를 표현합니다. 클라이언트 요청이 Router → Controller → Service → Repository 순서로 흘러가며, 각 계층은 독립적인 책임을 담당합니다. Middleware는 모든 요청에 적용되어 JWT 검증과 에러 처리를 담당합니다.

```mermaid
graph TD
    Request["HTTP Request<br/>POST /api/todos"]
    
    MW_Auth["🔐 Middleware: JWT<br/>verifyToken()<br/>req.user 설정"]
    
    Router["📍 Router<br/>todo.route.js<br/>경로 매핑 & 미들웨어 적용"]
    
    Controller["🎮 Controller<br/>todo.controller.js<br/>- 요청 데이터 검증<br/>- Service 호출<br/>- HTTP 응답 반환"]
    
    Service["⚙️ Service<br/>todo.service.js<br/>- 비즈니스 로직<br/>- 비즈니스 규칙 적용<br/>- Repository 조율"]
    
    Repository["🗄️ Repository<br/>todo.repository.js<br/>- SQL 쿼리 생성<br/>- pg 파라미터 바인딩<br/>- DB 데이터 접근"]
    
    DB["💾 PostgreSQL<br/>todos 테이블<br/>categories 테이블<br/>users 테이블"]
    
    MW_Error["⚠️ Middleware: ErrorHandler<br/>에러 → HTTP 응답 변환"]
    
    Response["HTTP Response<br/>JSON + Status Code"]
    
    Request --> MW_Auth
    MW_Auth --> Router
    Router --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> DB
    DB --> Repository
    Repository --> Service
    Service --> Controller
    Controller --> MW_Error
    MW_Error --> Response
    
    style Request fill:#e8f5e9
    style MW_Auth fill:#ffe0b2
    style Router fill:#f3e5f5
    style Controller fill:#fff3e0
    style Service fill:#e0f2f1
    style Repository fill:#fce4ec
    style DB fill:#f1f8e9
    style MW_Error fill:#ffebee
    style Response fill:#c8e6c9
```

---

## 3. 프론트엔드 레이어 구조

프론트엔드의 상태 관리와 API 통신 흐름을 표현합니다. React 컴포넌트에서 시작하여 커스텀 Hook을 통해 Zustand Store와 TanStack Query를 활용하고, 최종적으로 API Client를 거쳐 백엔드로 요청을 보냅니다.

```mermaid
graph TD
    Page["📄 Pages<br/>TodoListPage.tsx<br/>LoginPage.tsx"]
    
    Component["🎨 Components<br/>TodoList.tsx<br/>TodoCard.tsx<br/>TodoForm.tsx"]
    
    Hook["🪝 Hooks<br/>useTodoList()<br/>useTodoMutation()<br/>useAuth()"]
    
    Zustand["🔵 Zustand Store<br/>authStore (로그인 정보)<br/>uiStore (필터, 카테고리)<br/>settingsStore (언어, 테마)"]
    
    TanStackQuery["🟠 TanStack Query<br/>useQuery (데이터 조회)<br/>useMutation (데이터 변경)<br/>캐싱 & 동기화"]
    
    APIClient["📡 API Client<br/>authClient.ts<br/>todoClient.ts<br/>categoryClient.ts"]
    
    Backend["🔧 Backend API<br/>Express Server<br/>/api/todos<br/>/api/auth<br/>/api/categories"]
    
    Page --> Component
    Component --> Hook
    
    Hook --> Zustand
    Hook --> TanStackQuery
    
    Zustand -->|상태 읽기/업데이트| Component
    TanStackQuery -->|서버 데이터 관리| Component
    
    TanStackQuery --> APIClient
    Zustand -->|토큰 관리| APIClient
    APIClient -->|Authorization 헤더<br/>+ 파라미터| Backend
    
    Backend -->|JSON Response| APIClient
    APIClient -->|데이터 캐싱| TanStackQuery
    
    style Page fill:#e3f2fd
    style Component fill:#f3e5f5
    style Hook fill:#fff3e0
    style Zustand fill:#e0f2f1
    style TanStackQuery fill:#fce4ec
    style APIClient fill:#ede7f6
    style Backend fill:#fff9c4
```

---

## 기술 스택 요약

| 계층 | 기술 |
|------|------|
| **프론트엔드** | React 19, TypeScript, Zustand, TanStack Query |
| **백엔드** | Node.js, Express (JavaScript) |
| **데이터베이스** | PostgreSQL 17 |
| **데이터 드라이버** | pg 라이브러리 (Prisma 사용 금지) |
| **인증** | JWT (토큰 기반) |

---

## 주요 개념

### JWT 인증 흐름

1. **로그인**: 사용자가 이메일/비밀번호로 로그인 요청
2. **토큰 발급**: 서버가 JWT 토큰 발급 (만료: 7일)
3. **토큰 저장**: 클라이언트가 localStorage에 토큰 저장
4. **요청 포함**: 모든 API 요청의 Authorization 헤더에 토큰 포함
5. **토큰 검증**: 백엔드 JWT 미들웨어가 토큰 검증 후 req.user 설정

### 백엔드 5계층 아키텍처

| 계층 | 역할 | 예시 |
|------|------|------|
| **Router** | HTTP 메서드와 경로 매핑 | `POST /api/todos` → Controller 호출 |
| **Controller** | 요청 검증 및 응답 반환 | 입력값 검증, HTTP 상태 코드 결정 |
| **Service** | 비즈니스 로직 구현 | 할일 생성 시 기본 카테고리 자동 지정 |
| **Repository** | DB 쿼리 실행 | pg 파라미터 바인딩으로 SQL 실행 |
| **Database** | 데이터 저장 | PostgreSQL 테이블 |

### 프론트엔드 상태 관리

| 도구 | 용도 |
|------|------|
| **Zustand Store** | 클라이언트 상태 (인증, UI, 설정) |
| **TanStack Query** | 서버 상태 (할일 목록, 카테고리) |
| **React Hook** | 컴포넌트 로직 및 부수 효과 |

---

## 의존 방향 규칙

### 백엔드 (위 → 아래만 허용)
```
Router → Controller → Service → Repository → Database
```

### 프론트엔드 (위 → 아래만 허용)
```
Pages → Components → Hooks → Stores/Query → API Client → Backend
```

**역방향 호출은 절대 금지**합니다. 이를 통해 코드의 유지보수성과 테스트 가능성을 확보합니다.

---

## 참고

- 모든 API 요청은 JWT 토큰 검증을 통과해야 합니다.
- pg 라이브러리의 파라미터 바인딩을 반드시 사용하여 SQL Injection을 방지합니다.
- 데이터베이스 커넥션 풀을 적절히 구성하여 동시 접속 1,000명을 처리합니다.
