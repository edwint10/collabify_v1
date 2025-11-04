# Collabify Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Supabase account (optional for MVP - using localStorage for now)

### Installation Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Set Up Environment Variables** (Optional for MVP)
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Open in Browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## ✅ What's Implemented

### Sprint 1 Features (Completed)

- ✅ **Project Setup**
  - Next.js 14 with TypeScript
  - Tailwind CSS configured
  - shadcn/ui components installed
  - Supabase client setup (ready for integration)

- ✅ **A1 - Role Selection** (2 SP)
  - Beautiful role selection UI
  - Creator/Brand selection
  - Role persistence in localStorage
  - Navigation to profile creation

- ✅ **A2 - Creator Profile Form** (5 SP)
  - Instagram and TikTok handle inputs
  - Follower count inputs (mock verification)
  - Bio textarea
  - Form validation with React Hook Form + Zod
  - Saves to localStorage (ready for Supabase integration)

- ✅ **A3 - Brand Profile Form** (3 SP)
  - Company name input
  - Industry vertical dropdown
  - Ad spend range selector
  - Bio textarea
  - Form validation
  - Saves to localStorage (ready for Supabase integration)

- ✅ **Basic Dashboard**
  - Placeholder dashboard page
  - Role-based welcome message
  - Ready for future features

## 📁 Project Structure

```
collabify/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page with role selection
│   ├── dashboard/          # Dashboard page
│   └── profile/[role]/     # Profile creation pages
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── role-selection.tsx  # Role selection component
│   └── profile/            # Profile forms
├── lib/
│   ├── utils.ts           # Utility functions
│   └── supabase/          # Supabase client setup
└── supabase/
    └── schema.sql         # Database schema (ready to run)
```

## 🎯 Next Steps

### Immediate Next Steps (Sprint 2)

1. **Set up Supabase Database**
   - Create a Supabase project
   - Run `supabase/schema.sql` in Supabase SQL editor
   - Update `.env.local` with your credentials

2. **Integrate Supabase**
   - Update profile forms to save to Supabase
   - Create user records on profile creation
   - Fetch profiles from database

3. **A4 - Profile Verification Badge**
   - Add verification badge UI component
   - Admin verification interface

4. **M1 - Admin Dashboard Foundation**
   - Basic admin routing
   - User list view

### Development Commands

```bash
# Development
npm run dev          # Start dev server on :3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check that all environment variables are set if using Supabase

### TypeScript Errors
- Run `npm run build` to see type errors
- Ensure all imports are correct

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check that `globals.css` is imported in `layout.tsx`

## 📝 Notes

- Currently using localStorage for data persistence (MVP)
- Supabase integration is ready but not connected
- All forms are functional and validated
- UI is responsive and follows design system

## 🎨 Design System

- **Colors**: Primary blue (#3B82F6), Secondary gray
- **Components**: shadcn/ui based
- **Icons**: Lucide React
- **Typography**: Inter font family

---

**Status**: ✅ Sprint 1 Complete - Foundation & Profiles  
**Next**: Sprint 2 - Profile Completion & Verification


