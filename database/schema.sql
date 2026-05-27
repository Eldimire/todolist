-- ============================================================
-- TodoList Database Schema
-- 버전: 1.0.0
-- 작성일: 2026-05-27
-- 기반 문서: docs/6-erd.md
-- ============================================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. users 테이블
-- ============================================================
CREATE TABLE users (
    id          UUID         NOT NULL DEFAULT uuid_generate_v4(),
    email       VARCHAR(320) NOT NULL,
    password    VARCHAR      NOT NULL,           -- bcrypt 해시 저장
    name        VARCHAR(100) NOT NULL,
    language    VARCHAR(2)   NOT NULL DEFAULT 'ko',   -- ko / en / ja (v2)
    theme_mode  VARCHAR(10)  NOT NULL DEFAULT 'light', -- light / dark (v2)
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_language   CHECK (language   IN ('ko', 'en', 'ja')),
    CONSTRAINT chk_users_theme_mode CHECK (theme_mode IN ('light', 'dark'))
);

-- ============================================================
-- 2. categories 테이블
-- ============================================================
CREATE TABLE categories (
    id          UUID         NOT NULL DEFAULT uuid_generate_v4(),
    user_id     UUID         NOT NULL,
    name        VARCHAR(100) NOT NULL,
    is_default  BOOLEAN      NOT NULL DEFAULT false,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_categories PRIMARY KEY (id),
    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ============================================================
-- 3. todos 테이블
-- ============================================================
CREATE TABLE todos (
    id           UUID         NOT NULL DEFAULT uuid_generate_v4(),
    user_id      UUID         NOT NULL,
    category_id  UUID         NOT NULL,
    title        VARCHAR(200) NOT NULL,
    description  TEXT,                           -- NULL 허용 (선택사항)
    start_date   DATE         NOT NULL,
    end_date     DATE         NOT NULL,
    is_completed BOOLEAN      NOT NULL DEFAULT false,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_todos PRIMARY KEY (id),
    CONSTRAINT fk_todos_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_todos_category
        FOREIGN KEY (category_id) REFERENCES categories (id),  -- 카테고리 삭제 시 Service 레이어에서 기본 카테고리로 재지정 후 삭제
    CONSTRAINT chk_todos_end_date CHECK (end_date >= start_date)
);

-- ============================================================
-- 4. 인덱스
-- ============================================================

-- categories: user_id 기준 조회 (카테고리 목록 조회)
CREATE INDEX idx_categories_user_id ON categories (user_id);

-- todos: user_id 기준 조회 (할일 목록 조회)
CREATE INDEX idx_todos_user_id ON todos (user_id);

-- todos: category_id 기준 조회 (카테고리별 필터링)
CREATE INDEX idx_todos_category_id ON todos (category_id);

-- todos: 상태별 필터링 (is_completed + end_date + start_date 복합)
CREATE INDEX idx_todos_status ON todos (user_id, is_completed, start_date, end_date);
