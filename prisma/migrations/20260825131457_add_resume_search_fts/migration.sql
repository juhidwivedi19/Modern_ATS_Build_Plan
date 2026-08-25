CREATE INDEX "Resume_searchText_fts_idx"
ON "Resume"
USING GIN (
  to_tsvector('english', COALESCE("searchText", ''))
);