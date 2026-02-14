export interface BriefTemplate {
  id: string
  name: string
  vertical?: string
  sections: {
    objectives: string
    deliverables: string
    kpis: string
    timeline: string
    budget: string
  }
}

export const briefTemplates: BriefTemplate[] = [
  {
    id: 'fashion',
    name: 'Fashion & Beauty',
    vertical: 'fashion',
    sections: {
      objectives: 'Create engaging content showcasing our latest fashion collection, emphasizing style, quality, and brand aesthetic. Drive brand awareness and product sales through authentic creator partnerships.',
      deliverables: 'Create 3-5 high-quality Instagram posts featuring product styling and lifestyle integration. Include 1-2 Reels or Stories showcasing product features and behind-the-scenes content.',
      kpis: 'Target 50K+ total impressions, 5%+ engagement rate, 3%+ click-through rate to product pages. Track UTM-coded links for conversion attribution.',
      timeline: 'Content creation and delivery within 3-4 weeks. Campaign launch aligned with product release schedule.',
      budget: 'Budget allocated for content creation, usage rights, and performance bonuses based on KPI achievement.'
    }
  },
  {
    id: 'tech',
    name: 'Technology & Software',
    vertical: 'tech',
    sections: {
      objectives: 'Generate authentic product reviews and tutorials to drive user acquisition and feature adoption. Build credibility within tech community through trusted creator voices.',
      deliverables: 'Produce 2-3 comprehensive product review videos or articles. Create 1 tutorial or how-to guide demonstrating key features. Include unboxing or first impressions content.',
      kpis: 'Target 100K+ total views, 8%+ engagement rate, 500+ sign-ups or downloads. Measure conversion rate from content to product trial.',
      timeline: 'Content delivery within 2-3 weeks. Launch coordinated with product updates or feature releases.',
      budget: 'Budget covers content production, editing, and performance-based compensation tied to user acquisition metrics.'
    }
  },
  {
    id: 'food',
    name: 'Food & Beverage',
    vertical: 'food',
    sections: {
      objectives: 'Showcase our products through mouth-watering content that highlights taste, quality, and preparation methods. Drive brand awareness and recipe sharing.',
      deliverables: 'Create 4-6 Instagram posts featuring recipe integration and product usage. Produce 2-3 recipe videos or cooking demos. Include product unboxing and taste test content.',
      kpis: 'Target 75K+ total impressions, 6%+ engagement rate, 2%+ click-through to product pages or recipes. Track recipe saves and shares.',
      timeline: 'Content creation and delivery within 3-4 weeks. Seasonal campaigns aligned with product availability.',
      budget: 'Budget includes product samples, content creation fees, and performance bonuses for viral content.'
    }
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Wellness',
    vertical: 'lifestyle',
    sections: {
      objectives: 'Build authentic brand connections through lifestyle integration and wellness-focused content. Drive engagement and community building around our brand values.',
      deliverables: 'Create 5-7 Instagram posts showing product integration into daily life. Produce 2-3 Stories or Reels showcasing wellness routines. Include user-generated content campaigns.',
      kpis: 'Target 60K+ total impressions, 7%+ engagement rate, 4%+ click-through rate. Track community growth and hashtag usage.',
      timeline: 'Content delivery within 4-5 weeks. Campaigns aligned with seasonal wellness themes and brand initiatives.',
      budget: 'Budget covers content creation, product seeding, and community engagement bonuses.'
    }
  },
  {
    id: 'default',
    name: 'General Campaign',
    vertical: undefined,
    sections: {
      objectives: 'Create engaging content that authentically showcases our products and brand values. Drive brand awareness, engagement, and conversions through strategic creator partnerships.',
      deliverables: 'Produce high-quality content across multiple formats and platforms. Include product features, lifestyle integration, and authentic storytelling elements.',
      kpis: 'Target meaningful impressions, engagement rates above industry average, and measurable conversion metrics. Track brand mentions and user-generated content.',
      timeline: 'Content creation and delivery within agreed timeline. Campaign launch coordinated with marketing calendar.',
      budget: 'Budget allocated for content creation, usage rights, and performance-based compensation aligned with campaign objectives.'
    }
  }
]

export function getTemplateByVertical(vertical?: string): BriefTemplate {
  if (!vertical) {
    return briefTemplates.find(t => t.id === 'default') || briefTemplates[4]
  }

  const template = briefTemplates.find(t => t.vertical?.toLowerCase() === vertical.toLowerCase())
  return template || briefTemplates.find(t => t.id === 'default') || briefTemplates[4]
}

export function getAllTemplates(): BriefTemplate[] {
  return briefTemplates
}




