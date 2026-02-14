export interface MessageTemplate {
  id: string
  name: string
  content: string
  variables: string[]
}

export const messageTemplates: MessageTemplate[] = [
  {
    id: 'propose-collaboration',
    name: 'Propose Collaboration',
    content: `Hi! I'm interested in collaborating with you on a campaign. 

I'd like to discuss:
• Campaign Title: {title}
• Budget Range: {budget}
• Timeline: {timeline}

Looking forward to hearing from you!`,
    variables: ['title', 'budget', 'timeline']
  },
  {
    id: 'request-budget',
    name: 'Request Budget Info',
    content: `Hello! I'm interested in learning more about your campaign budget.

Could you share:
• Budget Range: {budget}
• Timeline: {timeline}

Thank you!`,
    variables: ['budget', 'timeline']
  },
  {
    id: 'timeline-inquiry',
    name: 'Timeline Inquiry',
    content: `Hi there! I'd like to discuss the timeline for this collaboration.

Expected Timeline: {timeline}

Please let me know if this works for you.`,
    variables: ['timeline']
  },
  {
    id: 'portfolio-showcase',
    name: 'Portfolio Showcase',
    content: `Hello! I'd love to share my portfolio with you and discuss how we can work together.

I specialize in:
• {niche}
• Reach: {reach}

Let me know if you'd like to see some examples of my work!`,
    variables: ['niche', 'reach']
  },
  {
    id: 'quick-intro',
    name: 'Quick Introduction',
    content: `Hi! I'm {name} and I'm excited about the possibility of collaborating with you.

I bring:
• {expertise}
• {reach} followers

Let's discuss how we can create something amazing together!`,
    variables: ['name', 'expertise', 'reach']
  }
]

export function replaceTemplateVariables(
  template: MessageTemplate,
  variables: Record<string, string>
): string {
  let content = template.content

  template.variables.forEach(variable => {
    const value = variables[variable] || `{${variable}}`
    content = content.replace(new RegExp(`\\{${variable}\\}`, 'g'), value)
  })

  return content
}

export function getTemplateById(id: string): MessageTemplate | undefined {
  return messageTemplates.find(template => template.id === id)
}




