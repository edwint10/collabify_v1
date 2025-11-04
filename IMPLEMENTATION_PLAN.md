# Collabify Implementation Plan

## 🎯 Goal: Complete MVP (0-6 months)

This plan breaks down all remaining work into actionable sprints with clear dependencies and priorities.

---

## 📋 Implementation Overview

### Current Status
- ✅ Sprint 1 Complete: Foundation & Profile Forms (A1, A2, A3)
- 🔄 **Next**: Sprint 2 - Supabase Integration & Profile Completion

### Total MVP Work Remaining
- **~104 Story Points** across **24 stories**
- **Estimated Timeline**: 10-12 sprints (20-24 weeks)

---

## 🚀 Sprint-by-Sprint Implementation Plan

---

## **Sprint 2 (Weeks 1-2): Supabase Integration & Profile Completion**

**Goal**: Connect forms to database, complete profile features  
**Target SP**: 15-17  
**Priority**: Critical - Foundation for all other features

### Tasks

#### 1. Supabase Connection Setup
- [ ] **Add environment variables** to `.env.local`
  - Set `NEXT_PUBLIC_SUPABASE_URL`
  - Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  
- [ ] **Create API utilities**
  - `lib/api/users.ts` - User CRUD operations
  - `lib/api/profiles.ts` - Profile CRUD operations
  
- [ ] **Update profile forms to use Supabase**
  - Modify `components/profile/creator-profile-form.tsx`
  - Modify `components/profile/brand-profile-form.tsx`
  - Replace localStorage with Supabase calls
  - Add error handling and loading states

#### 2. User & Profile Creation Flow
- [ ] **Create user record on role selection**
  - Update `components/role-selection.tsx`
  - Create user in database with selected role
  - Store user ID in session/localStorage
  
- [ ] **Save creator profile to database**
  - Save to `creator_profiles` table
  - Link to user record
  - Handle form submission errors
  
- [ ] **Save brand profile to database**
  - Save to `brand_profiles` table
  - Link to user record
  - Handle form submission errors

#### 3. A4 - Profile Verification Badge (2 SP)
- [ ] **Create verification badge component**
  - `components/ui/verification-badge.tsx`
  - Display "Verified" badge when `users.verified = true`
  - Add to profile cards and detail pages
  
- [ ] **Admin verification interface** (Basic)
  - Create admin page: `app/admin/verify/page.tsx`
  - List users with verification toggle
  - Update `users.verified` field

#### 4. Profile Display & Edit
- [ ] **Create profile view pages**
  - `app/profile/[userId]/page.tsx` - Public profile view
  - Fetch and display creator/brand profile
  
- [ ] **Add profile editing**
  - Add edit button to profile
  - Pre-fill form with existing data
  - Update profile in database

**Deliverables**:
- ✅ Profiles save to Supabase
- ✅ Users can view their profiles
- ✅ Admin can verify profiles
- ✅ Verified badges display

**Estimated Time**: 2 weeks  
**Story Points**: ~15 SP

---

## **Sprint 3 (Weeks 3-4): Matching Engine Foundation**

**Goal**: Build matching algorithm and swipe UI foundation  
**Target SP**: 16-18  
**Dependencies**: Sprint 2 complete

### Tasks

#### 1. B2 - Basic Matching Algorithm (5 SP)
- [ ] **Design matching algorithm**
  - Define scoring weights:
    - Vertical match: 30%
    - Reach/budget match: 25%
    - Tags/interests: 20%
    - Verification: 15%
    - Profile completeness: 10%
  
- [ ] **Create matching service**
  - `lib/services/matching.ts`
  - `calculateMatchScore(creator, brand)` function
  - `findMatchesForUser(userId, role)` function
  - Return ranked list of matches
  
- [ ] **Create API endpoint**
  - `app/api/matches/route.ts`
  - GET `/api/matches?userId=xxx&role=creator`
  - Returns ranked matches
  
- [ ] **Test matching algorithm**
  - Create test users with different profiles
  - Verify ranking logic
  - Test edge cases

#### 2. B1 - Tinder-style Swipe UI (5 SP)
- [ ] **Install swipe library**
  - `npm install react-tinder-card` or similar
  - Or build custom swipe with touch events
  
- [ ] **Create swipe card component**
  - `components/matching/swipe-card.tsx`
  - Display user profile (photo, name, metrics)
  - Show key information (followers, vertical, budget)
  
- [ ] **Create swipe container**
  - `components/matching/swipe-container.tsx`
  - Stack of cards
  - Swipe left/right handlers
  - Shortlist button
  
- [ ] **Create matches page**
  - `app/matches/page.tsx`
  - Fetch matches using API
  - Display swipe interface
  - Show shortlisted matches
  
- [ ] **Implement swipe actions**
  - Swipe right = shortlist
  - Swipe left = reject
  - Save to `matches` table with status
  - Update match score

#### 3. B3 - Search & Filters (3 SP)
- [ ] **Create filter component**
  - `components/matching/filters.tsx`
  - Filter by: reach, niche, rate, verification
  - Filter by vertical (for creators)
  - Filter by budget range (for brands)
  
- [ ] **Add filter UI**
  - Dropdowns for each filter
  - Range sliders for reach/budget
  - Checkboxes for verification
  
- [ ] **Implement filter logic**
  - Update matches query based on filters
  - Update URL parameters
  - Sync filters with URL state
  
- [ ] **Add search functionality**
  - Search by name, handle, company
  - Full-text search on profiles

**Deliverables**:
- ✅ Users can see ranked matches
- ✅ Swipe UI functional
- ✅ Shortlist saves to database
- ✅ Filters work and persist in URL

**Estimated Time**: 2 weeks  
**Story Points**: ~13 SP

---

## **Sprint 4 (Weeks 5-6): Messaging Core**

**Goal**: Enable 1:1 messaging between users  
**Target SP**: 18-20  
**Dependencies**: Sprint 3 complete (matches exist)

### Tasks

#### 1. C1 - 1:1 Messaging (8 SP)
- [ ] **Set up Supabase Realtime**
  - Enable Realtime on `messages` table
  - Configure channel subscriptions
  
- [ ] **Create conversation creation**
  - Auto-create conversation when match is shortlisted
  - Create `conversation` record linked to match
  
- [ ] **Build message thread UI**
  - `components/messaging/message-thread.tsx`
  - Display messages in chronological order
  - Show sender name and avatar
  - Show timestamps
  
- [ ] **Build message input**
  - `components/messaging/message-input.tsx`
  - Text input with send button
  - Handle message submission
  - Save to `messages` table
  
- [ ] **Create conversation list**
  - `components/messaging/conversation-list.tsx`
  - List all conversations for user
  - Show last message preview
  - Show unread count
  
- [ ] **Implement real-time updates**
  - Subscribe to message channel
  - Update UI when new message arrives
  - Mark messages as read
  
- [ ] **Create messaging page**
  - `app/messages/page.tsx` - List of conversations
  - `app/messages/[conversationId]/page.tsx` - Message thread
  
- [ ] **Add unread counts**
  - Track unread messages per conversation
  - Display badge with count
  - Mark as read when viewed

#### 2. C2 - Message Attachments (3 SP)
- [ ] **Set up Supabase Storage**
  - Create `message-attachments` bucket
  - Configure public access
  
- [ ] **Create file upload component**
  - `components/messaging/file-upload.tsx`
  - Drag & drop or click to upload
  - Support images and files
  - Show upload progress
  
- [ ] **Handle file uploads**
  - Upload to Supabase Storage
  - Get public URL
  - Save URL to `messages.attachments` JSONB field
  
- [ ] **Display attachments**
  - Show image previews in messages
  - Show file download links
  - Add download functionality

#### 3. C3 - Message Templates (2 SP)
- [ ] **Create template system**
  - `lib/data/message-templates.ts`
  - Define template structure (title, budget, timeline)
  
- [ ] **Build template dropdown**
  - `components/messaging/template-selector.tsx`
  - Dropdown with template options
  - Pre-fill message with template
  
- [ ] **Add template variables**
  - Replace placeholders with actual values
  - Allow user to edit before sending

**Deliverables**:
- ✅ Users can send messages
- ✅ Real-time message updates
- ✅ File attachments work
- ✅ Message templates available

**Estimated Time**: 2 weeks  
**Story Points**: ~13 SP

---

## **Sprint 5 (Weeks 7-8): Campaign Builder**

**Goal**: Enable brands to create campaigns  
**Target SP**: 11-13  
**Dependencies**: Profiles complete

### Tasks

#### 1. F1 - One-page Campaign Builder (5 SP)
- [ ] **Create campaign form**
  - `components/campaigns/campaign-form.tsx`
  - Fields: title, deliverables, KPIs, budget, timeline
  - Save as draft functionality
  
- [ ] **Create campaign builder page**
  - `app/campaigns/new/page.tsx`
  - Full-page form
  - Preview mode
  
- [ ] **Implement draft saving**
  - Auto-save drafts to `campaigns` table
  - Status: 'draft', 'active', 'completed'
  - Load existing drafts
  
- [ ] **Add campaign preview**
  - Preview mode shows formatted brief
  - Print-friendly view
  
- [ ] **Create campaign list**
  - `app/campaigns/page.tsx`
  - List all campaigns for brand
  - Filter by status

#### 2. F2 - Auto-generate Brief (3 SP)
- [ ] **Create brief generator**
  - `lib/services/brief-generator.ts`
  - Rule-based template system
  - Generate from title + deliverable
  
- [ ] **Add auto-generate button**
  - Button in campaign form
  - Fills in structured brief
  - User can edit generated content
  
- [ ] **Add brief templates**
  - Different templates per vertical
  - Customizable sections

**Deliverables**:
- ✅ Brands can create campaigns
- ✅ Drafts save automatically
- ✅ Briefs auto-generate
- ✅ Campaign list view

**Estimated Time**: 2 weeks  
**Story Points**: ~8 SP

---

## **Sprint 6 (Weeks 9-10): Contracts & NDAs**

**Goal**: Enable contract generation and signing  
**Target SP**: 16-18  
**Dependencies**: Campaigns exist (F1)

### Tasks

#### 1. D1 - Simple NDA Generator (4 SP)
- [ ] **Create NDA template**
  - `lib/templates/nda-template.ts`
  - Template with placeholders
  - Variables: brand_name, creator_name, term
  
- [ ] **Build NDA generator**
  - `lib/services/nda-generator.ts`
  - Replace placeholders with actual values
  - Generate text content
  
- [ ] **Add PDF generation**
  - Install `jspdf` or similar
  - Convert NDA text to PDF
  - Download PDF
  
- [ ] **Integrate into messaging**
  - Add "Generate NDA" button in conversation
  - Store NDA in `contracts` table
  - Link to conversation

#### 2. D2 - Contract Templates (5 SP)
- [ ] **Create contract template system**
  - `lib/templates/contract-templates.ts`
  - Template structure (deliverables, milestones, payment terms)
  
- [ ] **Build contract editor**
  - `components/contracts/contract-editor.tsx`
  - Editable fields
  - Save template versions
  
- [ ] **Create contract management**
  - `app/contracts/page.tsx`
  - List all contracts
  - Edit, duplicate, delete templates

#### 3. D3 - eSign Integration (5 SP)
- [ ] **Research eSign options**
  - Evaluate DocuSign API
  - Evaluate custom eSign solution
  - Decide on approach (custom for MVP)
  
- [ ] **Build custom eSign flow**
  - `components/contracts/signature-pad.tsx`
  - Canvas for signature drawing
  - Save signature as image
  
- [ ] **Create signature flow**
  - `app/contracts/[contractId]/sign/page.tsx`
  - Display contract
  - Signature pad
  - Timestamp recording
  
- [ ] **Update contract status**
  - Set `signed_by_creator` and `signed_by_brand`
  - Set `signed_at` timestamp
  - Notify other party when signed

**Deliverables**:
- ✅ Users can generate NDAs
- ✅ Contract templates editable
- ✅ Electronic signing works
- ✅ Signed contracts stored

**Estimated Time**: 2 weeks  
**Story Points**: ~14 SP

---

## **Sprint 7 (Weeks 11-12): Payments & Escrow (Beta)**

**Goal**: Enable escrow payments  
**Target SP**: 16-18  
**Dependencies**: Contracts signed (D3)

### Tasks

#### 1. E1 - Payment Integration (Stripe Sandbox) (8 SP)
- [ ] **Set up Stripe**
  - Create Stripe account
  - Get API keys (test mode)
  - Install Stripe SDK: `npm install @stripe/stripe-js`
  
- [ ] **Create payment API**
  - `app/api/payments/create-intent/route.ts`
  - Create payment intent
  - Return client secret
  
- [ ] **Build payment flow UI**
  - `components/payments/payment-form.tsx`
  - Stripe Elements integration
  - Card input
  
- [ ] **Create escrow record**
  - Save to `escrows` table
  - Link to campaign
  - Status: 'funded'
  - Store Stripe payment intent ID

#### 2. E2 - Escrow Workflow (8 SP)
- [ ] **Create deliverable marking**
  - `components/campaigns/mark-deliverable.tsx`
  - Creator marks work as delivered
  - Update campaign status
  
- [ ] **Build approval/dispute flow**
  - `app/campaigns/[campaignId]/review/page.tsx`
  - Brand can approve or dispute
  - Upload evidence for disputes
  
- [ ] **Implement release flow**
  - `app/api/payments/release/route.ts`
  - Release funds to creator
  - Update escrow status to 'released'
  
- [ ] **Implement refund flow**
  - `app/api/payments/refund/route.ts`
  - Refund to brand
  - Update escrow status to 'refunded'
  
- [ ] **Add status tracking**
  - Visual status indicators
  - Timeline view of escrow flow

**Deliverables**:
- ✅ Brands can fund escrow
- ✅ Creators can mark deliverables
- ✅ Funds can be released/refunded
- ✅ Escrow status tracked

**Estimated Time**: 2 weeks  
**Story Points**: ~16 SP

---

## **Sprint 8 (Weeks 13-14): Admin & Analytics**

**Goal**: Build admin tools and analytics  
**Target SP**: 13-15  
**Dependencies**: Features exist to monitor

### Tasks

#### 1. M1 - Admin Dashboard (8 SP)
- [ ] **Create admin layout**
  - `app/admin/layout.tsx`
  - Admin navigation
  - Protected routes (basic check)
  
- [ ] **Build user management**
  - `app/admin/users/page.tsx`
  - List all users with filters
  - CRUD operations
  - Verification toggle
  
- [ ] **Create deals view**
  - `app/admin/deals/page.tsx`
  - List active campaigns
  - Show escrow balances
  - Filter by status
  
- [ ] **Build disputes view**
  - `app/admin/disputes/page.tsx`
  - List all disputes
  - Review evidence
  - Resolve disputes
  
- [ ] **Add CSV export**
  - Export users, deals, transactions
  - Download functionality

#### 2. M2 - Product Analytics Dashboard (5 SP)
- [ ] **Set up analytics tracking**
  - Install analytics library (PostHog, Mixpanel, or custom)
  - Track key events:
    - User signups
    - Profile completions
    - Matches created
    - Messages sent
    - Campaigns created
    - Contracts signed
  
- [ ] **Create analytics dashboard**
  - `app/admin/analytics/page.tsx`
  - DAU/MAU metrics
  - Conversion funnel
  - Cohort retention
  
- [ ] **Add charts**
  - Use Chart.js or Recharts
  - Visualize metrics
  - Date range filters

**Deliverables**:
- ✅ Admin can manage users
- ✅ Admin can view deals & disputes
- ✅ Analytics dashboard functional
- ✅ Key metrics tracked

**Estimated Time**: 2 weeks  
**Story Points**: ~13 SP

---

## **Sprint 9 (Weeks 15-16): Growth Features**

**Goal**: Add onboarding and referral system  
**Target SP**: 11-13  
**Dependencies**: Core features complete

### Tasks

#### 1. L1 - Closed Beta Onboarding Flow (3 SP)
- [ ] **Create onboarding steps**
  - `app/onboarding/page.tsx`
  - Multi-step wizard:
    1. Role selection
    2. Profile creation
    3. First campaign (brands) or portfolio (creators)
    4. Welcome/tour
  
- [ ] **Add progress tracking**
  - Save progress to localStorage/database
  - Resume from last step
  - Progress indicator
  
- [ ] **Add invite code flow**
  - `app/invite/[code]/page.tsx`
  - Validate invite code
  - Store referral relationship

#### 2. L2 - Referral/Invite System (5 SP)
- [ ] **Create invite system**
  - `lib/services/invites.ts`
  - Generate unique invite codes
  - Track referrals
  
- [ ] **Build invite UI**
  - `app/invite/page.tsx`
  - Generate invite link
  - Share functionality
  
- [ ] **Create referral dashboard**
  - `app/invite/dashboard/page.tsx`
  - Show invite stats
  - Track conversions
  - Affiliate credits

#### 3. E3 - Transaction Ledger (3 SP)
- [ ] **Create transaction ledger**
  - `app/admin/transactions/page.tsx`
  - List all transactions
  - Show fees calculated
  - Filter by date, deal, user
  
- [ ] **Add fee calculation**
  - Calculate platform fee (e.g., 5%)
  - Display in ledger
  - Generate receipts

**Deliverables**:
- ✅ Onboarding flow complete
- ✅ Invite system functional
- ✅ Transaction ledger viewable
- ✅ Fees calculated

**Estimated Time**: 2 weeks  
**Story Points**: ~11 SP

---

## **Sprint 10 (Weeks 17-18): Security & Compliance**

**Goal**: Add security features and contract storage  
**Target SP**: 13-15  
**Dependencies**: Contracts exist

### Tasks

#### 1. K1 - Data Privacy & Security (8 SP)
- [ ] **Encrypt sensitive fields**
  - Encrypt PII in database
  - Use Supabase encryption or custom
  - Encrypt contract contents
  
- [ ] **Add OWASP protections**
  - Input validation
  - XSS protection
  - CSRF tokens
  - Rate limiting on API routes
  
- [ ] **Add security headers**
  - Configure Next.js security headers
  - HTTPS enforcement
  - Content Security Policy

#### 2. K2 - Contract Versioning & Storage (5 SP)
- [ ] **Implement version tracking**
  - Add version number to contracts
  - Store each version separately
  - Link versions together
  
- [ ] **Set up immutable storage**
  - Use Supabase Storage or S3
  - Store signed contracts as PDFs
  - Create audit log
  
- [ ] **Create version history**
  - `app/contracts/[contractId]/versions/page.tsx`
  - View all versions
  - Download specific version

**Deliverables**:
- ✅ Sensitive data encrypted
- ✅ Security best practices implemented
- ✅ Contract versions tracked
- ✅ Audit log created

**Estimated Time**: 2 weeks  
**Story Points**: ~13 SP

---

## **Sprint 11 (Weeks 19-20): Testing & Polish**

**Goal**: End-to-end testing and bug fixes  
**Target SP**: Variable  
**Dependencies**: All features complete

### Tasks

#### 1. End-to-End Testing
- [ ] **Test critical user flows**
  - Role selection → Profile → Match → Message → Contract → Payment
  - Test both creator and brand flows
  - Test edge cases
  
- [ ] **Fix bugs**
  - Fix any discovered issues
  - Improve error handling
  - Add loading states where missing

#### 2. Performance Optimization
- [ ] **Optimize database queries**
  - Add missing indexes
  - Optimize N+1 queries
  - Add query caching where appropriate
  
- [ ] **Optimize frontend**
  - Code splitting
  - Image optimization
  - Bundle size reduction

#### 3. UI/UX Improvements
- [ ] **Polish UI**
  - Consistent spacing and typography
  - Improve mobile responsiveness
  - Add animations/transitions
  
- [ ] **Improve error messages**
  - Clear, helpful error messages
  - Success notifications
  - Form validation improvements

#### 4. Documentation
- [ ] **Update README**
  - Add setup instructions
  - Add environment variables
  - Add deployment guide
  
- [ ] **Code documentation**
  - Add JSDoc comments
  - Document API routes
  - Document components

**Deliverables**:
- ✅ All features tested
- ✅ Performance optimized
- ✅ UI polished
- ✅ Documentation complete

**Estimated Time**: 2 weeks

---

## **Sprint 12 (Weeks 21-22): Launch Prep**

**Goal**: Prepare for beta launch  
**Target SP**: Variable

### Tasks

#### 1. Beta Launch Preparation
- [ ] **Set up production environment**
  - Configure production Supabase
  - Set up production domain
  - Configure environment variables
  
- [ ] **Deploy to production**
  - Deploy to Vercel
  - Test production build
  - Verify all features work
  
- [ ] **Onboard beta users**
  - Create invite codes
  - Send invitations
  - Monitor onboarding

#### 2. Monitoring & Support
- [ ] **Set up error tracking**
  - Sentry or similar
  - Monitor errors
  - Set up alerts
  
- [ ] **Set up analytics**
  - Production analytics
  - Track key metrics
  - Monitor user behavior

#### 3. Launch Marketing
- [ ] **Prepare launch materials**
  - Landing page
  - Product screenshots
  - Demo video (optional)

**Deliverables**:
- ✅ Production deployed
- ✅ Beta users onboarded
- ✅ Monitoring active
- ✅ Ready for launch

**Estimated Time**: 2 weeks

---

## 📊 Implementation Summary

### Sprint Breakdown
| Sprint | Focus | SP | Duration |
|--------|-------|----|---------| 
| 1 | ✅ Foundation & Profiles | 10 | 2 weeks (Done) |
| 2 | Supabase Integration & Verification | 15 | 2 weeks |
| 3 | Matching Engine | 13 | 2 weeks |
| 4 | Messaging | 13 | 2 weeks |
| 5 | Campaign Builder | 8 | 2 weeks |
| 6 | Contracts & NDAs | 14 | 2 weeks |
| 7 | Payments & Escrow | 16 | 2 weeks |
| 8 | Admin & Analytics | 13 | 2 weeks |
| 9 | Growth Features | 11 | 2 weeks |
| 10 | Security & Compliance | 13 | 2 weeks |
| 11 | Testing & Polish | Variable | 2 weeks |
| 12 | Launch Prep | Variable | 2 weeks |

**Total**: 24 weeks (6 months) to complete MVP

---

## 🎯 Critical Path

The critical path for MVP completion:

1. **Sprint 2**: Supabase Integration (Blocks everything)
2. **Sprint 3**: Matching Engine (Core feature)
3. **Sprint 4**: Messaging (Core feature)
4. **Sprint 5**: Campaign Builder (Enables contracts)
5. **Sprint 6**: Contracts (Enables payments)
6. **Sprint 7**: Payments (Core feature)

**Parallel Work** (can be done alongside):
- Sprint 8: Admin & Analytics
- Sprint 9: Growth Features
- Sprint 10: Security & Compliance

---

## 🚦 Quick Start Checklist

### Immediate Next Steps (Today)
- [ ] Set up Supabase project
- [ ] Run SQL schema in Supabase
- [ ] Add Supabase credentials to `.env.local`
- [ ] Test Supabase connection

### This Week
- [ ] Create API utilities for users/profiles
- [ ] Update profile forms to save to Supabase
- [ ] Test user/profile creation flow
- [ ] Build verification badge component

### This Month
- [ ] Complete Sprint 2 (Supabase Integration)
- [ ] Complete Sprint 3 (Matching Engine)
- [ ] Start Sprint 4 (Messaging)

---

## 📝 Notes

- **No Authentication**: All features work without login (per requirements)
- **Supabase First**: Connect database before building features
- **Test Early**: Test each feature as you build it
- **Iterate**: Don't wait for perfection, ship and improve

---

## 🎉 Success Criteria

MVP is complete when:
- ✅ Users can create profiles (Creator/Brand)
- ✅ Users can find and match with each other
- ✅ Users can message each other
- ✅ Brands can create campaigns
- ✅ Users can generate and sign contracts
- ✅ Payments can be held in escrow
- ✅ Admin can manage platform
- ✅ Analytics are tracked

---

**Last Updated**: Sprint 1 Complete  
**Next Sprint**: Sprint 2 - Supabase Integration  
**Status**: Ready to begin implementation

