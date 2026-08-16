-- This is an empty migration.
CREATE INDEX resume_search_text_idx
ON "Resume"
USING GIN (to_tsvector('english', COALESCE("searchText", '')));