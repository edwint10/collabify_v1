import { getTemplateByVertical } from '@/lib/data/brief-templates'
import type { CampaignFormData } from '@/components/campaigns/campaign-form'

export interface GeneratedBrief {
  objectives: string
  deliverables: string[]
  kpis: string[]
  timeline: string
  budget: string
}

export function generateBrief(
  title: string,
  deliverables: string[],
  vertical?: string
): GeneratedBrief {
  const template = getTemplateByVertical(vertical)

  // Customize template sections based on provided inputs
  const objectives = template.sections.objectives
    .replace(/\{title\}/g, title)
    .replace(/\{deliverables\}/g, deliverables.join(', '))

  const deliverablesText = deliverables.length > 0
    ? deliverables.map((d, idx) => `${idx + 1}. ${d}`).join('\n')
    : template.sections.deliverables

  // Generate KPIs based on deliverables
  const kpis = deliverables.length > 0
    ? [
        `Target ${deliverables.length * 10}K+ total impressions across all content`,
        `Achieve 5%+ average engagement rate`,
        `Generate ${deliverables.length * 2}+ brand mentions and user interactions`,
        `Drive measurable conversion metrics aligned with campaign objectives`
      ]
    : template.sections.kpis.split('. ').filter(k => k.trim() !== '')

  const timeline = template.sections.timeline

  const budget = template.sections.budget

  return {
    objectives,
    deliverables: deliverables.length > 0 ? deliverables : [deliverablesText],
    kpis,
    timeline,
    budget
  }
}

export function enhanceBriefWithTitle(
  title: string,
  existingBrief: Partial<CampaignFormData>
): Partial<CampaignFormData> {
  // Extract vertical from title if possible (simple keyword matching)
  const titleLower = title.toLowerCase()
  let vertical: string | undefined

  if (titleLower.includes('fashion') || titleLower.includes('beauty') || titleLower.includes('style')) {
    vertical = 'fashion'
  } else if (titleLower.includes('tech') || titleLower.includes('software') || titleLower.includes('app')) {
    vertical = 'tech'
  } else if (titleLower.includes('food') || titleLower.includes('recipe') || titleLower.includes('cooking')) {
    vertical = 'food'
  } else if (titleLower.includes('wellness') || titleLower.includes('lifestyle') || titleLower.includes('health')) {
    vertical = 'lifestyle'
  }

  const generatedBrief = generateBrief(title, existingBrief.deliverables || [], vertical)

  return {
    ...existingBrief,
    title,
    deliverables: generatedBrief.deliverables,
    kpis: generatedBrief.kpis,
    timeline: existingBrief.timeline || generatedBrief.timeline,
    budget: existingBrief.budget || (generatedBrief.budget ? parseFloat(generatedBrief.budget.replace(/[^0-9.]/g, '')) : undefined)
  }
}


