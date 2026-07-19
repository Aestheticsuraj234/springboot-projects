CREATE TABLE users (
    id            VARCHAR(36)  PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(255),
    image         VARCHAR(2048),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id         VARCHAR(36)  PRIMARY KEY,
    user_id    VARCHAR(36)  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);

CREATE TABLE projects (
    id          VARCHAR(36)  PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    user_id     VARCHAR(36)  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects (user_id);

CREATE TABLE messages (
    id          VARCHAR(36)  PRIMARY KEY,
    content     TEXT         NOT NULL,
    role        VARCHAR(20)  NOT NULL CHECK (role IN ('USER', 'ASSISTANT')),
    type        VARCHAR(20)  NOT NULL CHECK (type IN ('RESULT', 'ERROR')),
    project_id  VARCHAR(36)  NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_project_id ON messages (project_id);

CREATE TABLE fragments (
    id           VARCHAR(36)  PRIMARY KEY,
    message_id   VARCHAR(36)  NOT NULL UNIQUE REFERENCES messages (id) ON DELETE CASCADE,
    sandbox_url  VARCHAR(2048) NOT NULL,
    title        VARCHAR(255) NOT NULL,
    files        JSONB        NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE usage_records (
    key     VARCHAR(255) PRIMARY KEY,
    points  INT          NOT NULL,
    expire  TIMESTAMPTZ
);
