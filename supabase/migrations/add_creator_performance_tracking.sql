-- Add creator performance tracking tables

-- Campaign creators table (links creators to campaigns)
CREATE TABLE IF NOT EXISTS campaign_creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'completed', 'cancelled')),
  earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, creator_id)
);

-- Performance metrics table (tracks campaign performance data)
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_creator_id UUID NOT NULL REFERENCES campaign_creators(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_creator_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_creators_campaign_id ON campaign_creators(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_creators_creator_id ON campaign_creators(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaign_creators_status ON campaign_creators(status);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_campaign_creator_id ON performance_metrics(campaign_creator_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON performance_metrics(date);

-- Trigger to update updated_at
CREATE TRIGGER update_campaign_creators_updated_at BEFORE UPDATE ON campaign_creators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at BEFORE UPDATE ON performance_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


