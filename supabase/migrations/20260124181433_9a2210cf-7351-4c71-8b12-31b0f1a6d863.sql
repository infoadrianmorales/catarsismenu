-- Insert Meta Pixel configuration keys
INSERT INTO config (key, value) 
VALUES 
  ('meta_pixel_id', ''),
  ('meta_pixel_enabled', 'false')
ON CONFLICT (key) DO NOTHING;