# Run Log: Catalog Expansion + Contacts Update

- **Date:** 2026-06-17
- **Task class:** Standard
- **Branch:** main
- **Skill:** /improve (plan + execute)
- **Files changed:** src/data.ts, src/components/Header.tsx, src/components/FeedbackSection.tsx, src/components/SuccessState.tsx, src/App.tsx, index.html, public/images/products/ (6 new .jpg, 4 .webp deleted)

## What was done

### 1. Catalog expanded from 4 to 7 products
- Added: Anthracite by ton, Coal DG (Lugansk), Debris removal service
- Updated all descriptions with SEO keywords (марки угля, породы дров, фракции, сферы применения)
- Prices updated: from 600 RUB/bag, from 9000 RUB/ton (per client request)

### 2. Real stock photos downloaded
- 6 photos from Wikimedia Commons (CC-licensed): coal lumps, steinkohle, coal lump, firewood in Russia, sand pile, rubble
- Old 11-15KB .webp placeholders deleted
- All images 94-352KB, real photographs

### 3. Contacts updated
- Removed WhatsApp everywhere
- Added MTS number: +7 (988) 994-68-96
- Updated Telegram link to https://t.me/ugol_donbassa
- Address changed to: ул. Углегорская, 1 (was Промышленная 14)
- Updated in: Header (desktop + mobile), Footer, FeedbackSection, SuccessState, index.html schema

### 4. SEO improvements
- index.html title/meta updated with full product range
- JSON-LD schema: added contactPoint with both phones, sameAs Telegram
- Product descriptions include target keywords for local SEO

## Verification
- `npm run lint` (tsc --noEmit): PASS
- `npm run build` (vite build): PASS, 4.66s
- No remaining .webp references in source code

## Outcome
DONE — all changes verified.
