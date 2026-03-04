-- Add social_links JSONB column to creator_profiles
ALTER TABLE creator_profiles
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Add social_links JSONB column to brand_profiles
ALTER TABLE brand_profiles
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN creator_profiles.social_links IS 'JSON object storing social media profile URLs: {instagram, tiktok, youtube, twitter, linkedin, website}';
COMMENT ON COLUMN brand_profiles.social_links IS 'JSON object storing social media profile URLs: {instagram, tiktok, youtube, twitter, linkedin, website}';
