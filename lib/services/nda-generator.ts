import { ndaTemplate, replaceNDAVariables, type NDAVariables } from '@/lib/templates/nda-template'

export interface NDAData {
  brandName: string
  creatorName: string
  term: string
}

export function generateNDA(data: NDAData): string {
  const variables: NDAVariables = {
    brand_name: data.brandName,
    creator_name: data.creatorName,
    term: data.term,
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return replaceNDAVariables(ndaTemplate, variables)
}

export function generateNDAText(template: string, variables: NDAVariables): string {
  return replaceNDAVariables(template, variables)
}




