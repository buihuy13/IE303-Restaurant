CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    rating REAL,
    review_id UUID,
    review_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL
);

CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_review ON reviews(review_id);
CREATE INDEX idx_reviews_type ON reviews(review_type);
CREATE INDEX idx_reviews_rating ON reviews(rating);