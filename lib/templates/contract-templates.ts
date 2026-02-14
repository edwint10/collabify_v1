export interface ContractTemplate {
  id: string
  name: string
  sections: {
    deliverables: string[]
    milestones: Milestone[]
    paymentTerms: PaymentTerms
    timeline: string
  }
}

export interface Milestone {
  description: string
  dueDate: string
  paymentAmount?: number
}

export interface PaymentTerms {
  totalAmount: number
  schedule: 'upfront' | 'milestone' | 'completion' | 'custom'
  method: 'bank_transfer' | 'paypal' | 'stripe' | 'other'
  customSchedule?: {
    description: string
    amount: number
    dueDate: string
  }[]
}

export const defaultContractTemplate: ContractTemplate = {
  id: 'default',
  name: 'Standard Collaboration Contract',
  sections: {
    deliverables: [],
    milestones: [],
    paymentTerms: {
      totalAmount: 0,
      schedule: 'completion',
      method: 'bank_transfer'
    },
    timeline: ''
  }
}

export const contractTemplateStructure = {
  deliverables: {
    label: 'Deliverables',
    description: 'List of work items to be delivered',
    type: 'array'
  },
  milestones: {
    label: 'Milestones',
    description: 'Key milestones with dates and payments',
    type: 'array'
  },
  paymentTerms: {
    label: 'Payment Terms',
    description: 'Payment amount, schedule, and method',
    type: 'object'
  },
  timeline: {
    label: 'Timeline',
    description: 'Overall project timeline',
    type: 'string'
  }
}

export function generateContractText(template: ContractTemplate): string {
  let contractText = `COLLABORATION CONTRACT\n\n`
  contractText += `This Collaboration Contract ("Contract") is entered into on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.\n\n`

  contractText += `1. DELIVERABLES\n\n`
  if (template.sections.deliverables.length > 0) {
    template.sections.deliverables.forEach((deliverable, idx) => {
      contractText += `${idx + 1}. ${deliverable}\n`
    })
  } else {
    contractText += `No deliverables specified.\n`
  }

  contractText += `\n2. MILESTONES\n\n`
  if (template.sections.milestones.length > 0) {
    template.sections.milestones.forEach((milestone, idx) => {
      contractText += `Milestone ${idx + 1}: ${milestone.description}\n`
      contractText += `Due Date: ${milestone.dueDate}\n`
      if (milestone.paymentAmount) {
        contractText += `Payment: $${milestone.paymentAmount.toLocaleString()}\n`
      }
      contractText += `\n`
    })
  } else {
    contractText += `No milestones specified.\n\n`
  }

  contractText += `3. PAYMENT TERMS\n\n`
  contractText += `Total Amount: $${template.sections.paymentTerms.totalAmount.toLocaleString()}\n`
  contractText += `Payment Schedule: ${template.sections.paymentTerms.schedule}\n`
  contractText += `Payment Method: ${template.sections.paymentTerms.method}\n`

  if (template.sections.paymentTerms.customSchedule && template.sections.paymentTerms.customSchedule.length > 0) {
    contractText += `\nCustom Payment Schedule:\n`
    template.sections.paymentTerms.customSchedule.forEach((schedule, idx) => {
      contractText += `${idx + 1}. ${schedule.description}: $${schedule.amount.toLocaleString()} due ${schedule.dueDate}\n`
    })
  }

  contractText += `\n4. TIMELINE\n\n`
  contractText += template.sections.timeline || 'No timeline specified.\n'

  contractText += `\n5. GENERAL TERMS\n\n`
  contractText += `This Contract shall be governed by and construed in accordance with applicable laws. Both parties agree to fulfill their obligations as outlined in this Contract.\n\n`

  contractText += `IN WITNESS WHEREOF, the parties have executed this Contract as of the date first written above.\n\n`

  contractText += `_________________________________          _________________________________\n`
  contractText += `Brand Name                              Creator Name\n\n`
  contractText += `By: _____________________________          By: _____________________________\n\n`
  contractText += `Date: ___________________________          Date: ___________________________\n`

  return contractText
}




