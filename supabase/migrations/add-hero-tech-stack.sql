-- Run once in Supabase SQL Editor if settings table already exists
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS hero_tech_stack JSONB DEFAULT '[]';

-- Optional: seed default stack if empty
UPDATE settings
SET hero_tech_stack = '[
  {"icon":"code","label":"Python"},
  {"icon":"schema","label":"PyTorch"},
  {"icon":"database","label":"PostgreSQL"},
  {"icon":"memory","label":"CUDA"},
  {"icon":"cloud","label":"AWS"},
  {"icon":"box","label":"Docker"},
  {"icon":"api","label":"FastAPI"},
  {"icon":"analytics","label":"TensorFlow"}
]'::jsonb
WHERE hero_tech_stack IS NULL OR hero_tech_stack = '[]'::jsonb;
