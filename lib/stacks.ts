export type Layer = "frontend" | "backend" | "dns" | "repo" | "domain";

export interface StackOption {
  id: string;
  layer: Layer;
  name: string;
  cost: string;
  freeLimit: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  pros: string[];
  cons: string[];
  whenToPick: string;
  recommended?: boolean;
  tag?: string;
}

export const STACKS: StackOption[] = [
  // Frontend
  { id: "vercel", layer: "frontend", name: "Vercel", cost: "₱0 Hobby", freeLimit: "100GB bandwidth/mo, 6000 build min", difficulty: 1, pros: ["Easiest Next.js deploy, Git push = live", "Free SSL + previews per PR"], cons: ["Bandwidth overage paid", "Vendor lock basics"], whenToPick: "Default for all 4 archetypes. Stay here.", recommended: true, tag: "Recommended" },
  { id: "netlify", layer: "frontend", name: "Netlify", cost: "₱0 Starter", freeLimit: "100GB bandwidth, 300 build min", difficulty: 1, pros: ["Great forms + identity", "Easy static sites"], cons: ["Next.js ISR weaker than Vercel"], whenToPick: "Pick if you need built-in forms for booking/showcase and hate code." },
  { id: "cf-pages", layer: "frontend", name: "Cloudflare Pages", cost: "₱0, unlimited bandwidth", freeLimit: "Unlimited requests, 500 builds/mo", difficulty: 2, pros: ["Cheapest at scale, fast in PH", "Free SSL + DDoS"], cons: ["Next.js needs adapter, no Node server"], whenToPick: "Pick for photo portfolio / menu site that is mostly static." },
  { id: "amplify", layer: "frontend", name: "AWS Amplify", cost: "Pay-per-use, ~₱0 start", freeLimit: "1000 build min, 15GB hosting free 12mo", difficulty: 4, pros: ["Full AWS ecosystem, scales to millions", "CI/CD + auth + storage"], cons: ["Console overwhelms beginners", "Billing surprises if misconfigured"], whenToPick: "Grow-later only. Start Vercel, migrate when you hire a dev." },
  // Backend
  { id: "convex", layer: "backend", name: "Convex", cost: "₱0 starter", freeLimit: "~1M function calls/mo", difficulty: 1, pros: ["Realtime DB, no SQL to learn", "One npx convex dev and done"], cons: ["Not SQL — excel people adjust"], whenToPick: "Default. Orders, bookings, XP all fit.", recommended: true, tag: "Recommended" },
  { id: "supabase", layer: "backend", name: "Supabase", cost: "₱0 free", freeLimit: "500MB Postgres, 50k MAU", difficulty: 2, pros: ["Real Postgres + auth + storage", "Spreadsheet-like table UI"], cons: ["Row limits pause project if idle"], whenToPick: "Pick if you think in Excel/SQL or need heavy reports." },
  { id: "firebase", layer: "backend", name: "Firebase", cost: "₱0 Spark", freeLimit: "1GB Firestore, 10GB hosting", difficulty: 2, pros: ["Auth easiest, Google login 5 min", "Good mobile later"], cons: ["Costs spike with reads"], whenToPick: "Pick if you live in Google Sheets/Android world." },
  { id: "aws-serverless", layer: "backend", name: "AWS Lambda + DynamoDB", cost: "Near-₱0 at small scale", freeLimit: "1M Lambda req + 25GB Dynamo free", difficulty: 5, pros: ["Infinite scale, PH region ap-southeast-1", "Fits enterprise procurement"], cons: ["IAM + VPC learning cliff"], whenToPick: "Grow-later for hospital/NGO scale. Not day-1." },
  // DNS / Domain
  { id: "cloudflare-dns", layer: "dns", name: "Cloudflare DNS", cost: "₱0", freeLimit: "Unlimited DNS + DDoS", difficulty: 1, pros: ["Free, fastest DNS in PH", "One-click Vercel SSL"], cons: ["Nameserver change scares first-timers"], whenToPick: "Default. We guide NS switch in 3 steps.", recommended: true, tag: "Recommended" },
  { id: "namecheap-dns", layer: "dns", name: "Namecheap BasicDNS", cost: "₱0 with domain", freeLimit: "Included", difficulty: 1, pros: ["No move needed if bought there", "Good enough to start"], cons: ["Slower + no WAF"], whenToPick: "Stay here for week 1, move to Cloudflare later." },
  { id: "route53", layer: "dns", name: "Route 53", cost: "$0.50/mo per zone", freeLimit: "No free tier", difficulty: 3, pros: ["Best if 100% AWS", "Health checks"], cons: ["Paid, overkill for small"], whenToPick: "Only if you chose AWS Amplify/serverless." },
  { id: "namecheap-domain", layer: "domain", name: "Namecheap .com", cost: "~₱600/yr", freeLimit: "First-year promo often", difficulty: 1, pros: ["Cheap, PH cards accepted", "Free WhoisGuard"], cons: ["Renewal higher than promo"], whenToPick: "Default registrar. Buy here, point NS to Cloudflare.", recommended: true, tag: "Recommended" },
  { id: "cf-registrar", layer: "domain", name: "Cloudflare Registrar", cost: "At-cost (~₱550/yr .com)", freeLimit: "No markup", difficulty: 2, pros: ["Cheapest renewals", "No upsell"], cons: ["Must use Cloudflare DNS"], whenToPick: "Pick on renewal to save yearly." },
  { id: "github", layer: "repo", name: "GitHub", cost: "₱0", freeLimit: "Unlimited public/private repos", difficulty: 1, pros: ["Vercel 1-click connect", "Free Actions minutes"], cons: ["None for starters"], whenToPick: "Default. Required for Vercel/Netlify deploy.", recommended: true, tag: "Recommended" },
];

export type Budget = "tipid" | "standard" | "scale";
export type Archetype = "sell" | "teach" | "serve" | "showcase";

export function recommendStack(archetype: Archetype, budget: Budget) {
  if (budget === "scale") return { frontend: "amplify", backend: "aws-serverless", dns: "route53", why: "Scale mode: AWS pays off only after product-market fit. Start Vercel+Convex, migrate later." };
  if (archetype === "showcase") return { frontend: "cf-pages", backend: "convex", dns: "cloudflare-dns", why: "Portfolio is static + gallery. Cloudflare Pages = unlimited bandwidth free. Convex only for contact form." };
  if (archetype === "teach") return { frontend: "vercel", backend: "supabase", dns: "cloudflare-dns", why: "School data fits tables. Supabase looks like Excel for teachers; Vercel hosts Next.js." };
  return { frontend: "vercel", backend: "convex", dns: "cloudflare-dns", why: "Tipid default: Vercel + Convex + Cloudflare = ₱0 until you grow. GitHub connects all." };
}

export const GLOSSARY: Record<string, string> = {
  Frontend: "What visitors see. Vercel puts it online.",
  Backend: "Where orders/bookings save. Convex/Supabase = online Excel.",
  DNS: "Phonebook that turns your .com into computer address.",
  Deploy: "Push code to Vercel and get a live link.",
  Prompt: "Instruction you type. Be specific: who, what, price.",
};
