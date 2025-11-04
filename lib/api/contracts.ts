import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export interface ContractData {
  campaign_id?: string
  type: 'nda' | 'contract'
  template_id?: string
  version?: number
  content: string
  signed_by_creator?: boolean
  signed_by_brand?: boolean
  signed_at?: string
}

export interface SignatureData {
  signature: string // base64 image
  name: string
  signed_at: string
}

export async function createContract(campaignId: string | undefined, contractData: ContractData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const insertData: any = {
    type: contractData.type,
    content: contractData.content,
    version: contractData.version || 1
  }

  if (campaignId) {
    insertData.campaign_id = campaignId
  }

  if (contractData.template_id) {
    insertData.template_id = contractData.template_id
  }

  const { data, error } = await supabase
    .from('contracts')
    .insert([insertData])
    .select()
    .single()

  if (error) {
    console.error('Error creating contract:', error)
    throw new Error(`Failed to create contract: ${error.message}`)
  }

  return data
}

export async function getContract(contractId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .single()

  if (error) {
    console.error('Error fetching contract:', error)
    throw new Error(`Failed to fetch contract: ${error.message}`)
  }

  return data
}

export async function getContractsForCampaign(campaignId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contracts:', error)
    throw new Error(`Failed to fetch contracts: ${error.message}`)
  }

  return data || []
}

export async function getContractsForUser(userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Get user to determine role
  const { getUser } = await import('@/lib/api/users')
  const user = await getUser(userId)
  if (!user) {
    return []
  }

  const contracts: any[] = []

  // For brands: Get contracts linked to their campaigns
  if (user.role === 'brand') {
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id')
      .eq('brand_id', userId)

    if (campaigns && campaigns.length > 0) {
      const campaignIds = campaigns.map(c => c.id)
      const { data: campaignContracts } = await supabase
        .from('contracts')
        .select('*')
        .in('campaign_id', campaignIds)
        .order('created_at', { ascending: false })

      if (campaignContracts) {
        contracts.push(...campaignContracts)
      }
    }
  }

  // Get contracts without campaign_id (NDAs from conversations, templates)
  // For both creators and brands, we'll show all contracts without campaign_id
  // In a production system, you'd want to filter these based on matches/conversations
  const { data: contractsWithoutCampaign } = await supabase
    .from('contracts')
    .select('*')
    .is('campaign_id', null)
    .order('created_at', { ascending: false })

  if (contractsWithoutCampaign) {
    contracts.push(...contractsWithoutCampaign)
  }

  // Remove duplicates (in case a contract appears in both queries)
  const uniqueContracts = contracts.filter((contract, index, self) =>
    index === self.findIndex(c => c.id === contract.id)
  )

  // Sort by created_at descending
  uniqueContracts.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return dateB - dateA
  })

  return uniqueContracts
}

export async function updateContract(contractId: string, contractData: Partial<ContractData>) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const updateData: any = {
    updated_at: new Date().toISOString()
  }

  if (contractData.content !== undefined) updateData.content = contractData.content
  if (contractData.version !== undefined) updateData.version = contractData.version
  if (contractData.signed_by_creator !== undefined) updateData.signed_by_creator = contractData.signed_by_creator
  if (contractData.signed_by_brand !== undefined) updateData.signed_by_brand = contractData.signed_by_brand
  if (contractData.signed_at !== undefined) updateData.signed_at = contractData.signed_at

  const { data, error } = await supabase
    .from('contracts')
    .update(updateData)
    .eq('id', contractId)
    .select()
    .single()

  if (error) {
    console.error('Error updating contract:', error)
    throw new Error(`Failed to update contract: ${error.message}`)
  }

  return data
}

export async function signContract(contractId: string, userId: string, role: 'creator' | 'brand', signatureData: SignatureData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Get contract to verify it exists
  const contract = await getContract(contractId)

  // Update signature status based on role
  const updateData: any = {
    updated_at: new Date().toISOString()
  }

  if (role === 'creator') {
    updateData.signed_by_creator = true
  } else {
    updateData.signed_by_brand = true
  }

  // Set signed_at if both parties have signed or if this is the first signature
  if ((role === 'creator' && contract.signed_by_brand) || 
      (role === 'brand' && contract.signed_by_creator)) {
    updateData.signed_at = new Date().toISOString()
  }

  // Store signature in content (we'll append signature info to the contract content)
  // In a real system, you might want a separate signatures table
  const signatureInfo = `\n\n--- SIGNATURE ---\n${signatureData.name}\n${signatureData.signed_at}\nSignature: ${signatureData.signature.substring(0, 50)}...`

  updateData.content = contract.content + signatureInfo

  const { data, error } = await supabase
    .from('contracts')
    .update(updateData)
    .eq('id', contractId)
    .select()
    .single()

  if (error) {
    console.error('Error signing contract:', error)
    throw new Error(`Failed to sign contract: ${error.message}`)
  }

  return data
}

// Contract Templates (stored in contracts table with template_id = null and no campaign_id)
export interface ContractTemplateData {
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

export async function createContractTemplate(userId: string, templateData: ContractTemplateData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Store template as a contract with type='contract', no campaign_id, and template data in content
  const content = JSON.stringify(templateData)

  const { data, error } = await supabase
    .from('contracts')
    .insert([{
      type: 'contract',
      content: content,
      version: 1
      // No campaign_id means it's a template
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating contract template:', error)
    throw new Error(`Failed to create contract template: ${error.message}`)
  }

  return data
}

export async function getContractTemplates(userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Get all contracts that are templates (no campaign_id, type='contract')
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('type', 'contract')
    .is('campaign_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contract templates:', error)
    throw new Error(`Failed to fetch contract templates: ${error.message}`)
  }

  return data || []
}

export async function updateContractTemplate(templateId: string, templateData: Partial<ContractTemplateData>) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Get existing template
  const existing = await getContract(templateId)

  // Merge template data
  const existingData = JSON.parse(existing.content || '{}')
  const updatedData = { ...existingData, ...templateData }
  const content = JSON.stringify(updatedData)

  const { data, error } = await supabase
    .from('contracts')
    .update({
      content,
      updated_at: new Date().toISOString()
    })
    .eq('id', templateId)
    .select()
    .single()

  if (error) {
    console.error('Error updating contract template:', error)
    throw new Error(`Failed to update contract template: ${error.message}`)
  }

  return data
}

export async function deleteContractTemplate(templateId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', templateId)
    .is('campaign_id', null) // Only delete templates

  if (error) {
    console.error('Error deleting contract template:', error)
    throw new Error(`Failed to delete contract template: ${error.message}`)
  }

  return { success: true }
}

