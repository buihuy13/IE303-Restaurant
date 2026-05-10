CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    rating REAL,
    review_id UUID NOT NULL,
    review_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_review INTEGER,
    user_id UUID NOT NULL
);

CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_review ON reviews(review_id);
CREATE INDEX idx_reviews_type ON reviews(review_type);
CREATE INDEX idx_reviews_rating ON reviews(rating);