# Collabify

> Where marketers and brands click, trust, and collaborate

Collabify is the first platform built to bring trust, clarity, and speed to brand–creator collaborations.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Form Handling**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd collabify
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
collabify/
├── app/                    # Next.js app router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── role-selection.tsx # Role selection component
├── lib/                   # Utility functions
│   ├── utils.ts          # Utility functions
│   └── supabase/         # Supabase client setup
├── development-plan.md   # Development roadmap
└── epics and stories.txt  # Product requirements
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Current Sprint

**Sprint 1**: Foundation & Profiles
- ✅ Project setup and initialization
- ✅ Role selection (A1)
- 🚧 Creator profile (A2)
- 🚧 Brand profile (A3)

## Features

### MVP (0-6 months)

- [x] Role selection (Content Creator or Business/Brand)
- [ ] Creator profiles with social handles
- [ ] Brand profiles with vertical and budget
- [ ] Profile verification badges
- [ ] Tinder-style swipe matching
- [ ] Basic matching algorithm
- [ ] Search & filters
- [ ] 1:1 messaging
- [ ] Message attachments
- [ ] Campaign builder
- [ ] NDA & contract generation
- [ ] eSign integration

## Contributing

See [development-plan.md](./development-plan.md) for detailed development roadmap.

## License

Private - All rights reserved


