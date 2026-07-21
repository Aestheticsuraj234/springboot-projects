ALTER TABLE photos
    ADD COLUMN parent_photo_id UUID REFERENCES photos (id) ON DELETE SET NULL,
    ADD COLUMN ai_transform_type VARCHAR(50);

CREATE INDEX idx_photos_parent_photo_id ON photos (parent_photo_id);
