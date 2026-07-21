CREATE TABLE albums (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    cover_photo_id  UUID REFERENCES photos(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE album_photos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id    UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    photo_id    UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    sort_order  INT NOT NULL DEFAULT 0,
    added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (album_id, photo_id)
);

CREATE INDEX idx_albums_user_id ON albums(user_id);
CREATE INDEX idx_album_photos_album_id ON album_photos(album_id);
CREATE INDEX idx_album_photos_photo_id ON album_photos(photo_id);

ALTER TABLE photos ADD COLUMN deleted_at TIMESTAMPTZ;
