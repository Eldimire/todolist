# 프론트엔드 스타일 가이드

> 버전: 1.0.0
> 작성일: 2026-05-28

---

## 변경 이력

| 버전 | 변경일 | 변경 내용 |
|------|--------|-----------|
| v1.0.0 | 2026-05-28 | 최초 작성 |

---

## 1. 디자인 원칙

- **Clean & Minimal**: 흰 배경 기반, 불필요한 장식 없이 정보 전달에 집중
- **Rounded**: 카드, 뱃지, 입력창 등 모든 요소에 둥근 모서리 일관 적용
- **Subtle Depth**: 진한 그림자 대신 아주 옅은 그림자 또는 테두리로 레이어 구분
- **Color as Signal**: 색상은 장식이 아닌 상태·분류 신호로만 사용

---

## 2. 색상 팔레트

### 2.1 기본 색상

```css
/* Backgrounds */
--color-bg-base:    #FFFFFF;  /* 주 배경 (카드, 모달, 메인 콘텐츠) */
--color-bg-subtle:  #F8F8F8;  /* 보조 배경 (사이드바, 입력창, 칸 헤더) */
--color-bg-muted:   #F0F0F0;  /* 강조 섹션, 구분 영역 */

/* Borders */
--color-border:     #E5E7EB;  /* 기본 테두리 */
--color-border-focus: #9CA3AF; /* 포커스 시 테두리 */

/* Text */
--color-text-primary:   #111827;  /* 제목, 주요 텍스트 */
--color-text-secondary: #6B7280;  /* 설명, 부제목 */
--color-text-muted:     #9CA3AF;  /* 플레이스홀더, 비활성 */
--color-text-inverse:   #FFFFFF;  /* 어두운 배경 위 텍스트 */
```

### 2.2 상태 색상 (할일 상태)

```css
/* 시작 전 (Not Started) */
--color-not-started-dot:  #9CA3AF;
--color-not-started-bg:   #F3F4F6;
--color-not-started-text: #374151;

/* 진행 중 (In Progress) */
--color-in-progress-dot:  #3B82F6;
--color-in-progress-bg:   #EFF6FF;
--color-in-progress-text: #1D4ED8;

/* 완료 (Completed) */
--color-completed-dot:    #22C55E;
--color-completed-bg:     #F0FDF4;
--color-completed-text:   #15803D;

/* 기한 초과 (Overdue) */
--color-overdue-dot:  #F97316;
--color-overdue-bg:   #FFF7ED;
--color-overdue-text: #C2410C;
```

### 2.3 액션 색상

```css
/* Primary Action (주요 버튼, 링크) */
--color-primary:       #111827;  /* 거의 검정 */
--color-primary-hover: #374151;

/* Destructive Action (삭제) */
--color-danger:        #EF4444;
--color-danger-hover:  #DC2626;
--color-danger-bg:     #FEF2F2;

/* Disabled */
--color-disabled-bg:   #F3F4F6;
--color-disabled-text: #9CA3AF;
```

### 2.4 카테고리 색상 도트

카테고리는 사용자가 선택하는 컬러 도트로 시각적으로 구분한다.

```css
--color-cat-1: #3B82F6;  /* 파랑 */
--color-cat-2: #F97316;  /* 주황 */
--color-cat-3: #22C55E;  /* 초록 */
--color-cat-4: #A855F7;  /* 보라 */
--color-cat-5: #EC4899;  /* 핑크 */
--color-cat-6: #6B7280;  /* 회색 (기본 카테고리) */
```

---

## 3. 타이포그래피

### 3.1 서체

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
```

### 3.2 크기 척도

| 토큰 | 크기 | 줄 높이 | 사용처 |
|------|------|---------|--------|
| `text-xs` | 11px | 16px | 뱃지 라벨, 메타 정보 |
| `text-sm` | 13px | 20px | 설명문, 부제목, 플레이스홀더 |
| `text-base` | 15px | 24px | 본문, 카드 제목 |
| `text-lg` | 18px | 28px | 섹션 제목 |
| `text-xl` | 22px | 32px | 페이지 제목 |
| `text-2xl` | 28px | 36px | 인증 화면 헤더 |

### 3.3 굵기

```css
font-weight: 400;  /* Regular — 설명, 본문 */
font-weight: 500;  /* Medium — 레이블, 뱃지 */
font-weight: 600;  /* SemiBold — 카드 제목, 섹션명 */
font-weight: 700;  /* Bold — 페이지 제목 */
```

---

## 4. 간격 시스템

4px 기반 8pt Grid를 사용한다.

```css
--spacing-1:  4px;
--spacing-2:  8px;
--spacing-3:  12px;
--spacing-4:  16px;
--spacing-5:  20px;
--spacing-6:  24px;
--spacing-8:  32px;
--spacing-10: 40px;
--spacing-12: 48px;
```

---

## 5. 모서리 반경

```css
--radius-sm:   6px;   /* 뱃지, 작은 버튼 */
--radius-md:   10px;  /* 입력창, 버튼 */
--radius-lg:   14px;  /* 카드 */
--radius-xl:   20px;  /* 모달, 패널 */
--radius-full: 9999px; /* 필 뱃지, 아바타, 원형 아이콘 버튼 */
```

---

## 6. 그림자

```css
--shadow-sm:  0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
--shadow-md:  0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
--shadow-lg:  0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06);
```

카드에는 `shadow-sm`, 모달/드롭다운에는 `shadow-lg`를 사용한다.

---

## 7. 레이아웃

### 7.1 전체 구조

```
┌──────────┬─────────────────────────────────────┐
│ Sidebar  │           Main Content              │
│  64px    │                                     │
│          │  Header (제목 + 필터/탭)             │
│ (icon-   │  ─────────────────────────────────  │
│  only)   │  Content Area (카드 목록 등)         │
│          │                                     │
└──────────┴─────────────────────────────────────┘
```

### 7.2 사이드바

- 너비: `64px` (고정, 아이콘 전용)
- 배경: `var(--color-bg-subtle)`
- 오른쪽 테두리: `1px solid var(--color-border)`
- 앱 로고: 상단 `40×40` 원형 아이콘 (배경 검정, 아이콘 흰색)
- 내비게이션 아이콘: `24×24`, outline 스타일, `var(--color-text-muted)`
- 활성 아이콘: 배경 `var(--color-bg-muted)`, 아이콘 `var(--color-text-primary)`, `radius-md`

```
사이드바 아이콘 배치:
  [로고]
  ─────
  [홈]
  [통계]
  [카테고리]
  [사용자]
  ─────  (하단)
  [설정]
```

### 7.3 메인 콘텐츠 영역

- 패딩: 좌우 `32px`, 상하 `28px`
- 최대 너비: `1200px` (중앙 정렬)
- 헤더 섹션 하단에 `1px solid var(--color-border)` 구분선

### 7.4 반응형 브레이크포인트

| 이름 | 범위 | 레이아웃 변화 |
|------|------|--------------|
| mobile | ~767px | 사이드바 숨김, 하단 탭바로 대체 |
| tablet | 768px~1279px | 사이드바 표시, 콘텐츠 단순화 |
| desktop | 1280px~ | 풀 레이아웃 |

---

## 8. 컴포넌트 명세

### 8.1 카드 (TodoCard)

```
┌─────────────────────────────────┐  ← radius-lg, shadow-sm
│ [태그1] [태그2]            [···] │  ← 상단 패딩 16px
│                                 │
│ 카드 제목 (semibold, text-base)  │  ← mt-12
│ 설명 텍스트 (regular, text-sm,  │
│ secondary, 2줄 clamp)           │  ← mt-6
│                                 │
│ ≡ 서브태스크          6/12      │  ← mt-16
│ ████████░░░░░░░░░░░░░░░░ (bar)  │  ← mt-6
│                                 │
│ 💬 12  🔗 1       [👤] [👤]    │  ← mt-12, 하단 패딩 16px
└─────────────────────────────────┘
```

**CSS 속성:**
```css
.todo-card {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}
.todo-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-focus);
}
```

---

### 8.2 상태 뱃지 (StatusBadge)

상태를 시각적으로 표시하는 pill 형태의 뱃지. 컬러 도트 + 텍스트로 구성.

```
● 시작 전    ● 진행 중    ● 완료    ● 기한 초과
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  font-size: 12px;
  font-weight: 500;
  background: var(--color-bg-base);
}

.badge__dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

/* 상태별 도트 색상 */
.badge--not-started .badge__dot  { background: var(--color-not-started-dot); }
.badge--in-progress .badge__dot  { background: var(--color-in-progress-dot); }
.badge--completed .badge__dot    { background: var(--color-completed-dot); }
.badge--overdue .badge__dot      { background: var(--color-overdue-dot); }
```

---

### 8.3 카운트 뱃지 (CountBadge)

헤더·탭 옆에 붙는 숫자 원형 뱃지.

```css
.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
}

/* 변형 */
.count-badge--dark   { background: #111827; color: #FFFFFF; }  /* 기본 */
.count-badge--blue   { background: #3B82F6; color: #FFFFFF; }  /* 진행 중 */
.count-badge--orange { background: #F97316; color: #FFFFFF; }  /* 기한 초과 */
.count-badge--green  { background: #22C55E; color: #FFFFFF; }  /* 완료 */
```

---

### 8.4 버튼 (Button)

#### Primary (주요 액션)

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-primary:hover    { background: var(--color-primary-hover); }
.btn-primary:disabled { background: var(--color-disabled-bg); color: var(--color-disabled-text); cursor: not-allowed; }
```

#### Secondary (보조 액션 — "Add task +" 스타일)

```css
.btn-secondary {
  width: 100%;
  padding: 10px 16px;
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.btn-secondary:hover { background: var(--color-bg-muted); border-color: var(--color-border-focus); color: var(--color-text-primary); }
```

#### Danger (삭제)

```css
.btn-danger {
  padding: 8px 16px;
  background: transparent;
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.btn-danger:hover { background: var(--color-danger-bg); }
```

---

### 8.5 입력창 (Input)

```css
.input {
  width: 100%;
  padding: 10px 14px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-text-primary);
  outline: none;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.input::placeholder { color: var(--color-text-muted); }
.input:focus {
  background: var(--color-bg-base);
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(17,24,39,0.06);
}
.input--error { border-color: var(--color-danger); }
```

#### 검색 입력창 (pill 형)

```css
.input-search {
  padding: 10px 16px 10px 40px;  /* 왼쪽에 아이콘 공간 */
  border-radius: var(--radius-full);
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
}
```

---

### 8.6 진행 바 (ProgressBar)

할일 카드 내 서브태스크 진행률 표시.

```css
.progress-bar {
  height: 4px;
  background: var(--color-bg-muted);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-bar__fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

/* 상태별 진행 바 색상 */
.progress-bar--dark   .progress-bar__fill { background: #111827; }
.progress-bar--blue   .progress-bar__fill { background: #3B82F6; }
.progress-bar--orange .progress-bar__fill { background: #F97316; }
.progress-bar--green  .progress-bar__fill { background: #22C55E; }
```

---

### 8.7 필터 탭 (FilterTab)

할일 목록 상단의 상태별 필터 탭.

```css
.filter-tab-list {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--color-bg-subtle);
  border-radius: var(--radius-md);
}

.filter-tab {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.filter-tab:hover { color: var(--color-text-primary); }
.filter-tab--active {
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
}
```

---

### 8.8 드롭다운 메뉴 (ContextMenu)

카드 우상단 `···` 버튼 클릭 시 등장하는 드롭다운.

```css
.context-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 160px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 4px;
  z-index: 100;
}

.context-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  cursor: pointer;
}
.context-menu__item:hover { background: var(--color-bg-subtle); }
.context-menu__item--danger { color: var(--color-danger); }
.context-menu__item--danger:hover { background: var(--color-danger-bg); }
```

---

### 8.9 모달 (Modal)

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  width: 480px;
  max-width: calc(100vw - 32px);
  background: var(--color-bg-base);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 28px;
}

.modal__header {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}
```

---

### 8.10 폼 레이아웃 (FormLayout)

인증 화면(로그인/회원가입)과 할일 등록/수정 폼 공통.

```
┌─────────────────────────────────────┐
│  [앱 로고 + 이름]                    │  ← 중앙 정렬
│                                     │
│  페이지 제목 (text-2xl, bold)        │
│  부제목 (text-sm, secondary)         │
│                                     │
│  ─────────────────────────────────  │  ← 24px margin
│                                     │
│  [Label]                            │  ← text-sm, medium, mb-6
│  [Input]                            │  ← mb-16
│                                     │
│  [Primary Button — 100%]            │  ← mt-24
│                                     │
│  [보조 링크 텍스트]                  │  ← text-sm, center
└─────────────────────────────────────┘
```

```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-error {
  font-size: 12px;
  color: var(--color-danger);
  margin-top: 4px;
}
```

---

## 9. 아이콘 시스템

- **라이브러리**: [Lucide React](https://lucide.dev/) 사용 권장 (outline 스타일, 일관성 우수)
- **기본 크기**: `16px` (인라인), `20px` (버튼/카드), `24px` (사이드바)
- **색상**: 부모 요소의 `color` 상속 (`currentColor`)

| 화면/위치 | 아이콘 | 크기 |
|----------|--------|------|
| 사이드바 내비게이션 | `Home`, `BarChart2`, `Tag`, `Settings` | 24px |
| 카드 푸터 | `MessageCircle`, `Link2` | 14px |
| 서브태스크 | `ListChecks` | 14px |
| 메뉴 트리거 | `MoreHorizontal` | 16px |
| 검색 | `Search` | 16px |
| 추가 버튼 | `Plus` | 16px |
| 완료 체크 | `Check`, `CheckCircle2` | 18px |
| 날짜 | `Calendar` | 14px |
| 카테고리 | `Tag` | 14px |

---

## 10. 트랜지션 & 애니메이션

```css
/* 공통 트랜지션 */
--transition-fast:   0.10s ease;
--transition-normal: 0.15s ease;
--transition-slow:   0.25s ease;

/* 사용 원칙 */
/* 호버 색상 변화: fast */
/* 포커스 아웃라인, 카드 그림자: normal */
/* 모달/드롭다운 등장: slow + ease-out */
```

모달 등장 예시:
```css
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.modal { animation: modal-in 0.2s ease-out; }
```

드롭다운 등장 예시:
```css
@keyframes dropdown-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.context-menu { animation: dropdown-in 0.15s ease-out; }
```

---

## 11. 다크 모드

CSS 변수를 재정의하는 방식으로 구현한다. `<html>` 또는 `<body>`에 `data-theme="dark"` 속성을 적용한다.

```css
[data-theme="dark"] {
  --color-bg-base:    #1C1C1E;
  --color-bg-subtle:  #2C2C2E;
  --color-bg-muted:   #3A3A3C;

  --color-border:      #38383A;
  --color-border-focus: #636366;

  --color-text-primary:   #F2F2F7;
  --color-text-secondary: #8E8E93;
  --color-text-muted:     #636366;
  --color-text-inverse:   #1C1C1E;

  --color-primary:       #F2F2F7;
  --color-primary-hover: #D1D1D6;

  --color-danger-bg: rgba(239,68,68,0.15);
}
```

---

## 12. 화면별 레이아웃 적용 가이드

### S-01 회원가입 / S-02 로그인

- 전체 화면 중앙 정렬 (`flexbox`, `min-height: 100vh`)
- 카드 너비: `400px` (모바일: 100% - 32px padding)
- 배경: `var(--color-bg-subtle)`
- 카드: `background: var(--color-bg-base)`, `shadow-md`, `radius-xl`, `padding: 40px`

### S-03 할일 목록 (메인)

- 사이드바 + 메인 레이아웃
- 상단: 페이지 제목 + 필터 탭 + 할일 추가 버튼 (우측 정렬)
- 할일 카드 목록: `display: flex`, `flex-direction: column`, `gap: 10px`
- 빈 상태: 중앙 정렬 아이콘 + 안내 텍스트 + 추가 버튼

### S-04 할일 등록·수정

- 모달 또는 사이드 패널 형태 권장
- 모달 너비: `520px`

### S-05 내 정보 수정

- 사이드바 + 메인 레이아웃
- 카테고리 관리 섹션을 폼 하단에 배치

### S-06 설정 (v2)

- 언어·테마 항목을 섹션 카드로 구분
- 선택 상태: `border: 2px solid var(--color-primary)`, 체크 아이콘 표시

---

## 13. Tailwind CSS 설정 (권장)

위 디자인 토큰을 Tailwind CSS v3의 `tailwind.config.ts`에 확장하는 방식으로 구현한다.

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['attribute', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'bg-base':    'var(--color-bg-base)',
        'bg-subtle':  'var(--color-bg-subtle)',
        'border-base': 'var(--color-border)',
        'text-primary':   'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted':     'var(--color-text-muted)',
        'status-not-started': 'var(--color-not-started-dot)',
        'status-in-progress': 'var(--color-in-progress-dot)',
        'status-completed':   'var(--color-completed-dot)',
        'status-overdue':     'var(--color-overdue-dot)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'dropdown': '0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)',
      },
    },
  },
} satisfies Config;
```
