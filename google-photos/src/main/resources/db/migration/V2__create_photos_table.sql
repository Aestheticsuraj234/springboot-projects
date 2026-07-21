CREATE TABLE photos (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    imagekit_file_id VARCHAR(255) NOT NULL,
    file_name        VARCHAR(255) NOT NULL,
    url              TEXT NOT NULL,
    thumbnail_url    TEXT,
    mime_type        VARCHAR(100),
    size_bytes       BIGINT NOT NULL DEFAULT 0,
    width            INT,
    height           INT,
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_photos_user_imagekit_file ON photos(user_id, imagekit_file_id);
CREATE INDEX idx_photos_user_status_created ON photos(user_id, status, created_at DESC);
