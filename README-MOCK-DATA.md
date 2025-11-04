# Mock Data for Testing

This directory contains mock data for testing the Collabify application.

## Files

- `mock-data/users.json` - Contains 50 mock users (25 creators, 25 brands) with realistic data
- `scripts/seed-mock-data.js` - Script to seed mock data into Supabase
- `scripts/seed-mock-data.ts` - TypeScript version of the seeding script

## Usage

### Prerequisites

1. Make sure you have set up your Supabase environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Make sure you have run the database schema in Supabase (see `supabase/schema.sql`)

### Seeding Mock Data

Run the seeding script using npm:

```bash
npm run seed
```

Or directly with Node:

```bash
node scripts/seed-mock-data.js
```

Or with TypeScript (if you have `tsx` installed):

```bash
npx tsx scripts/seed-mock-data.ts
```

## Mock Data Structure

The mock data includes:

- **25 Creators** with:
  - Instagram and TikTok handles
  - Follower counts (ranging from ~30k to ~300k)
  - Bios with relevant keywords
  - Mix of verified and unverified accounts

- **25 Brands** with:
  - Company names
  - Industry verticals (fashion, beauty, tech, food, fitness, travel, lifestyle, gaming, finance, education)
  - Ad spend ranges (from under-1k to over-100k)
  - Bios describing their business
  - Mix of verified and unverified accounts

## User Distribution

- **Creators**: 25 users
  - Verified: 12
  - Unverified: 13

- **Brands**: 25 users
  - Verified: 14
  - Unverified: 11

- **Verticals Covered**:
  - Fashion: 4 brands
  - Beauty: 4 brands
  - Tech: 4 brands
  - Food: 4 brands
  - Fitness: 4 brands
  - Travel: 3 brands
  - Lifestyle: 2 brands
  - Gaming: 2 brands
  - Finance: 2 brands
  - Education: 2 brands

## Testing the Matching Algorithm

After seeding, you can test the matching algorithm by:

1. Logging in as a creator or brand
2. Going to the `/matches` page
3. Swiping through potential matches
4. Testing filters (reach, vertical, verification, etc.)
5. Viewing shortlisted matches

The mock data is designed to test various matching scenarios:
- High reach creators with high budget brands
- Low reach creators with low budget brands
- Vertical matching (fashion creators with fashion brands)
- Verification status filtering
- Profile completeness scoring

