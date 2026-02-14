export interface NDAVariables {
  brand_name: string
  creator_name: string
  term: string
  date: string
}

export const ndaTemplate = `
NON-DISCLOSURE AGREEMENT (NDA)

This Non-Disclosure Agreement ("Agreement") is entered into on {date} between:

{brand_name} ("Disclosing Party")
and
{creator_name} ("Receiving Party")

1. CONFIDENTIAL INFORMATION

For purposes of this Agreement, "Confidential Information" shall mean all non-public, proprietary, or confidential information disclosed by the Disclosing Party to the Receiving Party, whether orally, in writing, or in any other form, including but not limited to:

- Business plans, strategies, and financial information
- Product information, designs, and specifications
- Marketing strategies and customer information
- Technical data, know-how, and trade secrets
- Any other information marked as confidential or proprietary

2. OBLIGATIONS OF RECEIVING PARTY

The Receiving Party agrees to:

a) Hold and maintain the Confidential Information in strict confidence
b) Not disclose the Confidential Information to any third party without prior written consent
c) Use the Confidential Information solely for the purpose of evaluating potential business collaboration
d) Take reasonable precautions to protect the confidentiality of the Confidential Information
e) Not use the Confidential Information for any purpose other than as contemplated by this Agreement

3. EXCEPTIONS

The obligations set forth in this Agreement shall not apply to information that:

a) Is or becomes publicly available through no breach of this Agreement
b) Was rightfully known by the Receiving Party prior to disclosure
c) Is independently developed by the Receiving Party without use of the Confidential Information
d) Is rightfully received from a third party without breach of any confidentiality obligation

4. TERM

This Agreement shall remain in effect for a period of {term} from the date of execution, unless terminated earlier by mutual written consent of both parties.

5. RETURN OF MATERIALS

Upon termination of this Agreement or upon request by the Disclosing Party, the Receiving Party shall promptly return or destroy all documents, materials, and other tangible manifestations of the Confidential Information.

6. NO GRANT OF RIGHTS

This Agreement does not grant the Receiving Party any rights, title, or interest in or to the Confidential Information, and all such rights remain with the Disclosing Party.

7. REMEDIES

The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party, and that monetary damages may not be sufficient. Therefore, the Disclosing Party shall be entitled to seek injunctive relief and other equitable remedies in addition to any other remedies available at law.

8. GENERAL PROVISIONS

a) This Agreement constitutes the entire agreement between the parties concerning the subject matter herein
b) This Agreement may not be modified except in writing signed by both parties
c) This Agreement shall be governed by and construed in accordance with applicable laws
d) If any provision of this Agreement is found to be unenforceable, the remaining provisions shall remain in full force and effect

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_________________________________          _________________________________
{brand_name}                              {creator_name}

By: _____________________________          By: _____________________________

Date: ___________________________          Date: ___________________________
`

export function replaceNDAVariables(template: string, variables: NDAVariables): string {
  let result = template
  result = result.replace(/\{brand_name\}/g, variables.brand_name)
  result = result.replace(/\{creator_name\}/g, variables.creator_name)
  result = result.replace(/\{term\}/g, variables.term)
  result = result.replace(/\{date\}/g, variables.date)
  return result
}




