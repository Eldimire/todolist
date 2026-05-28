# 프론트엔드 통합 가이드

> 버전: 1.0.0
> 작성일: 2026-05-28
> 기반: 백엔드 API 구현 완료 기준 (BE-01 ~ BE-13)

---

## 변경 이력

| 버전 | 변경일 | 변경 내용 |
|------|--------|-----------|
| v1.0.0 | 2026-05-28 | 최초 작성 (API 명세, 응답 형식, 타입 정의, 에러 처리, 구현 예시) |

---

## 1. API 기본 설정

### Base URL

```
개발: http://localhost:3000/api
```

환경변수: `VITE_API_BASE_URL=http://localhost:3000/api`

### 인증 헤더

로그인 성공 후 발급된 JWT를 **모든 인증 필요 요청**에 포함해야 한다.

```
Authorization: Bearer <JWT_TOKEN>
```

토큰 만료 기간: **7일**

### Content-Type

모든 요청 본문은 `application/json`을 사용한다.

---

## 2. 응답 필드 명명 규칙 (중요)

백엔드 응답 필드 명명이 엔드포인트마다 다르게 적용된다. 반드시 숙지해야 한다.

| 도메인 | 필드 형식 | 예시 |
|--------|-----------|------|
| **User (인증 응답)** | camelCase | `themeMode`, `createdAt` |
| **Category** | snake_case (DB 직접 반환) | `is_default`, `user_id`, `created_at` |
| **Todo** | snake_case (DB 직접 반환) | `is_completed`, `category_id`, `start_date`, `end_date` |

> 프론트엔드에서 Category, Todo 필드를 다룰 때는 snake_case를 사용하거나,
> API Client 레이어에서 camelCase로 변환하는 처리가 필요하다.

---

## 3. 에러 응답 형식

모든 에러는 아래 스키마를 따른다.

```json
{
  "code": "ERROR_CODE",
  "message": "오류에 대한 설명 메시지"
}
```

### 에러 코드 전체 목록

| code | HTTP | 상황 |
|------|------|------|
| `VALIDATION_ERROR` | 400 | 입력값 형식 오류, 필수 필드 누락 |
| `UNAUTHORIZED` | 401 | 토큰 없음·만료·유효하지 않음 |
| `INVALID_CREDENTIALS` | 401 | 이메일/비밀번호 불일치 |
| `FORBIDDEN` | 403 | 타인 리소스 접근 시도 |
| `NOT_FOUND` | 404 | 존재하지 않는 경로 |
| `CATEGORY_NOT_FOUND` | 404 | 카테고리 미존재 |
| `TODO_NOT_FOUND` | 404 | 할일 미존재 |
| `EMAIL_ALREADY_EXISTS` | 409 | 이메일 중복 |
| `DEFAULT_CATEGORY_NOT_MODIFIABLE` | 422 | 기본 카테고리 수정 시도 |
| `DEFAULT_CATEGORY_NOT_DELETABLE` | 422 | 기본 카테고리 삭제 시도 |
| `INVALID_DATE_RANGE` | 422 | 종료일 < 시작일 |
| `INTERNAL_SERVER_ERROR` | 500 | 서버 내부 오류 |

---

## 4. 인증 API

### 4.1 회원가입

```
POST /api/auth/signup
```

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| email | string | Y | RFC 5321 형식 |
| password | string | Y | 최소 8자 |
| name | string | Y | - |

**Response 201**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

**에러**
- `400 VALIDATION_ERROR`: 형식 오류 / 필드 누락 / 비밀번호 8자 미만
- `409 EMAIL_ALREADY_EXISTS`: 이메일 중복

---

### 4.2 로그인

```
POST /api/auth/login
```

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "language": "ko",
    "themeMode": "light"
  }
}
```

> `token`은 localStorage에 저장하고, `user.language` / `user.themeMode` 는 즉시 UI에 적용한다.

**에러**
- `400 VALIDATION_ERROR`: 필드 누락
- `401 INVALID_CREDENTIALS`: 이메일/비밀번호 불일치

---

### 4.3 로그아웃

```
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response 200**

```json
{
  "message": "로그아웃 되었습니다."
}
```

> 서버는 stateless이므로, 프론트엔드에서 반드시 localStorage 토큰을 삭제해야 한다.

**에러**
- `401 UNAUTHORIZED`: 토큰 없음/무효

---

### 4.4 내 정보 수정

```
PATCH /api/users/me
Authorization: Bearer <token>
```

**Request Body** (최소 1개 필드 필요)

```json
{
  "name": "새이름",
  "password": "newpassword123"
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| name | string | N | - |
| password | string | N | 최소 8자 |

**Response 200**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "새이름"
  }
}
```

> 이메일 변경은 지원하지 않는다.

**에러**
- `400 VALIDATION_ERROR`: 비밀번호 8자 미만
- `401 UNAUTHORIZED`: 토큰 없음/무효

---

## 5. 카테고리 API

> 모든 카테고리 엔드포인트는 `Authorization` 헤더가 필요하다.
> 응답 필드는 **snake_case** (DB 직접 반환)이다.

### Category 객체 형식

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "업무",
  "is_default": false,
  "created_at": "2026-05-28T00:00:00.000Z"
}
```

---

### 5.1 카테고리 목록 조회

```
GET /api/categories
Authorization: Bearer <token>
```

**Response 200**

```json
{
  "categories": [
    { "id": "uuid", "user_id": "uuid", "name": "기본", "is_default": true, "created_at": "..." },
    { "id": "uuid", "user_id": "uuid", "name": "업무", "is_default": false, "created_at": "..." }
  ]
}
```

> 정렬: 기본 카테고리(`is_default=true`) 먼저, 이후 생성일 오름차순.

---

### 5.2 카테고리 등록

```
POST /api/categories
Authorization: Bearer <token>
```

**Request Body**

```json
{ "name": "개인" }
```

| 필드 | 제약 |
|------|------|
| name | 필수, 최대 100자 |

**Response 201**

```json
{
  "category": { "id": "uuid", "user_id": "uuid", "name": "개인", "is_default": false, "created_at": "..." }
}
```

**에러**
- `400 VALIDATION_ERROR`: 이름 누락 / 100자 초과

---

### 5.3 카테고리 수정

```
PATCH /api/categories/:id
Authorization: Bearer <token>
```

**Request Body**

```json
{ "name": "수정된 이름" }
```

**Response 200**

```json
{
  "category": { "id": "uuid", "user_id": "uuid", "name": "수정된 이름", "is_default": false, "created_at": "..." }
}
```

**에러**
- `400 VALIDATION_ERROR`: 이름 누락 / 100자 초과
- `403 FORBIDDEN`: 타인 카테고리
- `404 CATEGORY_NOT_FOUND`: 카테고리 미존재
- `422 DEFAULT_CATEGORY_NOT_MODIFIABLE`: 기본 카테고리 수정 시도

---

### 5.4 카테고리 삭제

```
DELETE /api/categories/:id
Authorization: Bearer <token>
```

**Response 200**

```json
{ "message": "카테고리가 삭제되었습니다." }
```

> 삭제된 카테고리에 속한 할일은 자동으로 기본 카테고리로 재지정된다.

**에러**
- `403 FORBIDDEN`: 타인 카테고리
- `404 CATEGORY_NOT_FOUND`: 카테고리 미존재
- `422 DEFAULT_CATEGORY_NOT_DELETABLE`: 기본 카테고리 삭제 시도

---

## 6. 할일 API

> 모든 할일 엔드포인트는 `Authorization` 헤더가 필요하다.
> 응답 필드는 **snake_case** (DB 직접 반환)이다.

### Todo 객체 형식

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "category_id": "uuid",
  "title": "보고서 작성",
  "description": "월간 보고서",
  "start_date": "2026-05-28",
  "end_date": "2026-05-30",
  "is_completed": false,
  "created_at": "2026-05-28T00:00:00.000Z",
  "updated_at": "2026-05-28T00:00:00.000Z"
}
```

### 할일 상태 계산 (KST 기준)

상태는 서버 응답의 `start_date`, `end_date`, `is_completed` 값을 이용해 **프론트엔드에서 계산**한다.

| 상태 | 조건 |
|------|------|
| 완료 (`completed`) | `is_completed = true` |
| 시작 전 (`not_started`) | `is_completed = false` AND `오늘(KST) < start_date` |
| 진행 중 (`in_progress`) | `is_completed = false` AND `start_date <= 오늘(KST) <= end_date` |
| 기한 초과 (`overdue`) | `is_completed = false` AND `오늘(KST) > end_date` |

```typescript
// KST 기준 오늘 날짜 계산 예시
function getTodayKST(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

function calcTodoStatus(todo: Todo): TodoStatus {
  if (todo.is_completed) return 'completed';
  const today = getTodayKST();
  if (todo.start_date > today) return 'not_started';
  if (todo.end_date < today) return 'overdue';
  return 'in_progress';
}
```

---

### 6.1 할일 목록 조회

```
GET /api/todos
GET /api/todos?categoryId=<uuid>
GET /api/todos?status=not_started
GET /api/todos?status=in_progress
GET /api/todos?status=completed
GET /api/todos?status=overdue
Authorization: Bearer <token>
```

> `categoryId`와 `status`는 동시에 사용할 수 없다. 둘 다 없으면 전체 조회.

**쿼리 파라미터**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| categoryId | uuid (optional) | 특정 카테고리의 할일만 조회 |
| status | string (optional) | `not_started` / `in_progress` / `completed` / `overdue` |

**Response 200**

```json
{
  "todos": [ /* Todo 객체 배열 */ ]
}
```

---

### 6.2 할일 등록

```
POST /api/todos
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "title": "보고서 작성",
  "description": "월간 보고서 초안",
  "categoryId": "uuid",
  "startDate": "2026-05-28",
  "endDate": "2026-05-30"
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| title | string | Y | 최대 200자 |
| description | string | N | 최대 2000자 |
| categoryId | uuid | N | 미지정 시 기본 카테고리 자동 적용 |
| startDate | string | Y | `YYYY-MM-DD` 형식 |
| endDate | string | Y | `YYYY-MM-DD` 형식, `endDate >= startDate` |

**Response 201**

```json
{
  "todo": { /* Todo 객체 */ }
}
```

**에러**
- `400 VALIDATION_ERROR`: 필수 필드 누락 / 길이 초과
- `422 INVALID_DATE_RANGE`: 종료일 < 시작일

---

### 6.3 할일 수정

```
PATCH /api/todos/:id
Authorization: Bearer <token>
```

**Request Body** (최소 1개 필드 필요)

```json
{
  "title": "수정된 제목",
  "description": "수정된 내용",
  "categoryId": "uuid",
  "startDate": "2026-05-29",
  "endDate": "2026-06-01"
}
```

> `isCompleted` 필드도 직접 전달 가능하지만, 완료 토글은 `/complete` 엔드포인트 사용 권장.

**Response 200**

```json
{
  "todo": { /* 수정된 Todo 객체 */ }
}
```

**에러**
- `400 VALIDATION_ERROR`: 수정 필드 없음
- `403 FORBIDDEN`: 타인 할일
- `404 TODO_NOT_FOUND`: 할일 미존재
- `422 INVALID_DATE_RANGE`: 종료일 < 시작일

---

### 6.4 할일 삭제

```
DELETE /api/todos/:id
Authorization: Bearer <token>
```

**Response 200**

```json
{ "message": "할일이 삭제되었습니다." }
```

**에러**
- `403 FORBIDDEN`: 타인 할일
- `404 TODO_NOT_FOUND`: 할일 미존재

---

### 6.5 완료 상태 토글

```
PATCH /api/todos/:id/complete
Authorization: Bearer <token>
```

> `is_completed`를 현재 값의 반대로 토글한다. (완료 → 미완료, 미완료 → 완료)

**Response 200**

```json
{
  "todo": { /* 업데이트된 Todo 객체 (is_completed 변경됨) */ }
}
```

**에러**
- `403 FORBIDDEN`: 타인 할일
- `404 TODO_NOT_FOUND`: 할일 미존재

---

## 7. 사용자 설정 API (v2)

### 7.1 언어 설정

```
PATCH /api/users/me/language
Authorization: Bearer <token>
```

**Request Body**

```json
{ "language": "en" }
```

| 허용값 | 설명 |
|--------|------|
| `ko` | 한국어 |
| `en` | 영어 |
| `ja` | 일본어 |

**Response 200**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "language": "en",
    "themeMode": "light"
  }
}
```

**에러**
- `400 VALIDATION_ERROR`: 유효하지 않은 언어 코드

---

### 7.2 테마 설정

```
PATCH /api/users/me/theme
Authorization: Bearer <token>
```

**Request Body**

```json
{ "themeMode": "dark" }
```

| 허용값 | 설명 |
|--------|------|
| `light` | 라이트 모드 |
| `dark` | 다크 모드 |

**Response 200**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "language": "ko",
    "themeMode": "dark"
  }
}
```

**에러**
- `400 VALIDATION_ERROR`: 유효하지 않은 테마 값

---

## 8. TypeScript 타입 정의

```typescript
// types/auth.types.ts

export interface User {
  id: string;
  email: string;
  name: string;
  language?: 'ko' | 'en' | 'ja';   // 로그인 응답에만 포함
  themeMode?: 'light' | 'dark';      // 로그인 응답에만 포함
}

export interface LoginResponse {
  token: string;
  user: Required<User>;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  password?: string;
}
```

```typescript
// types/category.types.ts

// 서버 응답은 snake_case
export interface Category {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
}
```

```typescript
// types/todo.types.ts

// 서버 응답은 snake_case
export interface Todo {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  start_date: string;   // "YYYY-MM-DD"
  end_date: string;     // "YYYY-MM-DD"
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type TodoStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';

export interface CreateTodoRequest {
  title: string;
  description?: string;
  categoryId?: string;
  startDate: string;
  endDate: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetTodosParams {
  categoryId?: string;
  status?: TodoStatus;
}
```

```typescript
// types/api.types.ts

export interface ApiError {
  code: string;
  message: string;
}
```

---

## 9. API Client 구현 예시

### 기본 Axios 인스턴스

```typescript
// api/client.ts
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: 토큰 자동 주입
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 처리
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
```

### 인증 클라이언트

```typescript
// api/authClient.ts
import client from './client';
import type { SignupRequest, LoginRequest, LoginResponse, User, UpdateProfileRequest } from '../types/auth.types';

export const authClient = {
  signup: (data: SignupRequest) =>
    client.post<{ user: User }>('/auth/signup', data),

  login: (data: LoginRequest) =>
    client.post<LoginResponse>('/auth/login', data),

  logout: () =>
    client.post<{ message: string }>('/auth/logout'),

  updateProfile: (data: UpdateProfileRequest) =>
    client.patch<{ user: User }>('/users/me', data),

  updateLanguage: (language: 'ko' | 'en' | 'ja') =>
    client.patch<{ user: Required<User> }>('/users/me/language', { language }),

  updateTheme: (themeMode: 'light' | 'dark') =>
    client.patch<{ user: Required<User> }>('/users/me/theme', { themeMode }),
};
```

### 카테고리 클라이언트

```typescript
// api/categoryClient.ts
import client from './client';
import type { Category, CreateCategoryRequest } from '../types/category.types';

export const categoryClient = {
  getCategories: () =>
    client.get<{ categories: Category[] }>('/categories'),

  createCategory: (data: CreateCategoryRequest) =>
    client.post<{ category: Category }>('/categories', data),

  updateCategory: (id: string, data: CreateCategoryRequest) =>
    client.patch<{ category: Category }>(`/categories/${id}`, data),

  deleteCategory: (id: string) =>
    client.delete<{ message: string }>(`/categories/${id}`),
};
```

### 할일 클라이언트

```typescript
// api/todoClient.ts
import client from './client';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, GetTodosParams } from '../types/todo.types';

export const todoClient = {
  getTodos: (params?: GetTodosParams) =>
    client.get<{ todos: Todo[] }>('/todos', { params }),

  createTodo: (data: CreateTodoRequest) =>
    client.post<{ todo: Todo }>('/todos', data),

  updateTodo: (id: string, data: UpdateTodoRequest) =>
    client.patch<{ todo: Todo }>(`/todos/${id}`, data),

  deleteTodo: (id: string) =>
    client.delete<{ message: string }>(`/todos/${id}`),

  toggleComplete: (id: string) =>
    client.patch<{ todo: Todo }>(`/todos/${id}/complete`),
};
```

---

## 10. 에러 처리 패턴

```typescript
// utils/errorHandler.ts
import type { ApiError } from '../types/api.types';
import axios from 'axios';

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: '입력값을 확인해주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
  CATEGORY_NOT_FOUND: '카테고리를 찾을 수 없습니다.',
  TODO_NOT_FOUND: '할일을 찾을 수 없습니다.',
  DEFAULT_CATEGORY_NOT_MODIFIABLE: '기본 카테고리는 수정할 수 없습니다.',
  DEFAULT_CATEGORY_NOT_DELETABLE: '기본 카테고리는 삭제할 수 없습니다.',
  INVALID_DATE_RANGE: '종료일은 시작일보다 이전일 수 없습니다.',
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    if (apiError?.code) {
      return ERROR_MESSAGES[apiError.code] ?? apiError.message ?? '알 수 없는 오류가 발생했습니다.';
    }
  }
  return '알 수 없는 오류가 발생했습니다.';
}

export function getErrorCode(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as ApiError)?.code ?? null;
  }
  return null;
}
```

---

## 11. TanStack Query 활용 예시

### 인증 Mutation

```typescript
// hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { authClient } from '../api/authClient';
import { useAuthStore } from '../stores/authStore';
import { getErrorMessage } from '../utils/errorHandler';

export function useLogin() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: authClient.login,
    onSuccess: ({ data }) => {
      localStorage.setItem('token', data.token);
      setAuth(data.token, data.user);
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: authClient.logout,
    onSettled: () => {
      localStorage.removeItem('token');
      clearAuth();
    },
  });
}
```

### 할일 목록 Query

```typescript
// hooks/useTodoList.ts
import { useQuery } from '@tanstack/react-query';
import { todoClient } from '../api/todoClient';
import type { GetTodosParams } from '../types/todo.types';

export const TODO_QUERY_KEY = 'todos';

export function useTodos(params?: GetTodosParams) {
  return useQuery({
    queryKey: [TODO_QUERY_KEY, params],
    queryFn: () => todoClient.getTodos(params).then((r) => r.data.todos),
  });
}
```

### 완료 토글 Mutation (낙관적 업데이트)

```typescript
// hooks/useTodoMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todoClient } from '../api/todoClient';
import { TODO_QUERY_KEY } from './useTodoList';

export function useToggleComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoClient.toggleComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TODO_QUERY_KEY] });
    },
  });
}
```

---

## 12. Zustand Store 구조 권장

### 인증 Store

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import type { User } from '../types/auth.types';

interface AuthState {
  token: string | null;
  user: Required<User> | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: Required<User>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (token, user) =>
    set({ token, user, isAuthenticated: true }),

  clearAuth: () =>
    set({ token: null, user: null, isAuthenticated: false }),
}));
```

### UI Store (필터 상태)

```typescript
// stores/uiStore.ts
import { create } from 'zustand';
import type { TodoStatus } from '../types/todo.types';

interface UiState {
  activeStatus: TodoStatus | null;
  selectedCategoryId: string | null;
  setStatus: (status: TodoStatus | null) => void;
  setCategory: (categoryId: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeStatus: null,
  selectedCategoryId: null,
  setStatus: (status) => set({ activeStatus: status, selectedCategoryId: null }),
  setCategory: (categoryId) => set({ selectedCategoryId: categoryId, activeStatus: null }),
}));
```

---

## 13. 주요 주의사항

### 토큰 관리
- 로그인 성공 시 `token`을 `localStorage`에 저장
- 로그아웃 또는 `401` 응답 수신 시 즉시 `localStorage`에서 삭제 후 `/login`으로 이동
- 앱 시작 시 `localStorage`에서 토큰을 읽어 인증 상태 복원

### Category / Todo 필드명
- 서버 응답의 Category, Todo 객체는 **snake_case** (`is_default`, `category_id`, `start_date` 등)
- TypeScript 타입도 snake_case로 정의하거나, API Client 레이어에서 `camelCase`로 변환하는 방식 중 하나를 선택해 프로젝트 전체에 일관되게 적용

### 날짜 처리
- 서버는 날짜를 `YYYY-MM-DD` 문자열로 처리 (`DATE` 타입 → pg 드라이버가 문자열 반환)
- 상태 계산 시 반드시 **KST(UTC+9) 기준** 오늘 날짜와 비교해야 한다 (섹션 6 참조)

### 카테고리 기본값
- 할일 등록 폼에서 카테고리 선택 없이 제출하면 서버가 자동으로 기본 카테고리를 적용
- UI에서는 카테고리 드롭다운 기본값을 `is_default=true`인 카테고리로 설정하는 것을 권장

### 상태 필터 쿼리 파라미터
- 상태 필터값은 **언더스코어** 형식 사용: `not_started`, `in_progress`, `completed`, `overdue`
- 하이픈 형식(`not-started`, `in-progress`)은 작동하지 않는다

### Swagger UI
- 백엔드 서버 실행 후 `http://localhost:3000/api-docs`에서 전체 API 스펙 확인 가능
