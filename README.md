# Boffo — Demand Validation Engine

Next.js 14 (App Router) rewrite of the Boffo single-page site.

## Stack

- **Next.js 14** — App Router, TypeScript
- **CSS** — Global stylesheet (`app/globals.css`), no Tailwind
- **Fonts** — Google Fonts (Share Tech Mono, VT323, Syncopate, Space Mono)

## Project Structure

```
boffo-nextjs/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── globals.css         # All styles (converted from inline HTML)
│   ├── page.tsx            # Home — hero + validate input
│   ├── report/
│   │   └── page.tsx        # Loading state + validation report
│   ├── about/page.tsx
│   ├── services/page.tsx
│   ├── technology/page.tsx
│   └── contact/page.tsx
├── components/
│   ├── Nav.tsx             # Sticky nav with glitch logo
│   ├── Footer.tsx
│   └── Modal.tsx           # Stripe payment modal
├── lib/
│   └── data.ts             # Shared types, constants, pitch data, score generator
├── next.config.js
├── tsconfig.json
└── package.json
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. User enters a pain point on the home page and clicks **VALIDATE**
2. The idea is stored in `sessionStorage` and the user is routed to `/report`
3. The report page runs a simulated loading sequence, then generates random (mock) VC scores and picks a random pitch template
4. The $1 supporter modal adds entries to local React state (no real Stripe integration yet)

## Connecting Real Stripe

Replace the `processPayment` function in `components/Modal.tsx` with a call to your API route:

```ts
// app/api/checkout/route.ts
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { name, email } = await req.json()
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency: 'usd', product_data: { name: 'Visionary Supporter' }, unit_amount: 100 }, quantity: 1 }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/report?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/report`,
    customer_email: email,
    metadata: { supporter_name: name },
  })
  return Response.json({ url: session.url })
}
```

## Connecting Real AI Validation

Replace the `generateScores()` call in `app/report/page.tsx` with a fetch to your API route that calls GPT-4 / Claude with your fine-tuned prompt and returns structured scores.

## Environment Variables

```env
NEXT_PUBLIC_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```
