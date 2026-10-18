import Groq from 'groq-sdk';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface UserProfileContext {
  userId?: string;
  name?: string;
  companyName?: string;
  role?: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  industry?: string;
  description?: string;
  preferredCategories?: string[];
  preferredReach?: string;
  [key: string]: unknown;
}

export interface ChatResult {
  message: string;
  chatHistory: ChatMessage[];
  suppliersConsidered: number;
}

interface ProductDetail {
  name: string;
  category: string;
  material: string | null;
  unitPrice: number | null;
  priceUnit: string | null;
  moq: number;
  leadTimeDays: number | null;
  certifications: string[];
  sampleAvailable: boolean;
  valueProposition: string | null;
  description: string | null;
}

export interface SupplierSnapshot {
  id: string;
  name: string;
  legalName: string | null;
  role: string;
  city: string | null;
  state: string | null;
  country: string | null;
  industry: string | null;
  description: string | null;
  rating: number;
  ratingCount: number;
  certifications: string[];
  locations: string[];
  avgDeliveryDays: number | null;
  monthlyQuota: number | null;
  products: ProductDetail[];
  contacts?: Array<{ name: string | null; phone: string | null; email: string | null }>;
}

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 20;
const DEFAULT_MODEL = 'openai/gpt-oss-120b';

let groqClient: Groq | null = null;
let supabaseClient: SupabaseClient | null = null;

function getGroq(): Groq {
  if (groqClient) return groqClient;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }
  groqClient = new Groq({ apiKey });
  return groqClient;
}

function getSupabase(): SupabaseClient {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and a Supabase key must be set');
  }
  supabaseClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabaseClient;
}

export function cleanToPlainMessage(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Remove code block wrappers
  cleaned = cleaned.replace(/```[a-zA-Z]*\n?/g, '').replace(/\n?```/g, '');

  // Remove bold and italic markdown markers
  cleaned = cleaned.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*\n]+)\*/g, '$1');
  cleaned = cleaned.replace(/___([^_]+)___/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/_([^_\n]+)_/g, '$1');

  // Remove inline code backticks
  cleaned = cleaned.replace(/`([^`\n]+)`/g, '$1');

  // Convert markdown headings (### Title -> TITLE:)
  cleaned = cleaned.replace(/^#{1,6}\s*(.+)$/gm, (_match, title) => {
    const trimmed = title.trim();
    return trimmed.endsWith(':') ? trimmed.toUpperCase() : trimmed.toUpperCase() + ':';
  });

  // Remove markdown table divider rows (e.g. |---|---|)
  cleaned = cleaned.replace(/^\s*\|?\s*[-:]+[-|\s:]*\|?\s*$/gm, '');

  // Convert markdown table rows into clean separated text
  cleaned = cleaned.replace(/^\s*\|(.+)\|\s*$/gm, (_match, row) => {
    const cells = row.split('|').map((c: string) => c.trim()).filter(Boolean);
    return cells.join('  •  ');
  });

  // Remove double colons like TITLE::
  cleaned = cleaned.replace(/:+:$/gm, ':');

  // Normalize blank lines (max 2 consecutive newlines)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

export async function fetchAllProfilesAndSuppliers(): Promise<{
  suppliers: SupplierSnapshot[];
  allBusinesses: any[];
  allProfiles: any[];
}> {
  const db = getSupabase();

  const [bizRes, prodRes, profRes] = await Promise.all([
    db.from('businesses').select('*').order('created_at', { ascending: false }),
    db.from('products').select('*').eq('is_active', true),
    db.from('profiles').select('*').limit(50),
  ]);

  const businesses = bizRes.data ?? [];
  const products = prodRes.data ?? [];
  const allProfiles = profRes.data ?? [];

  // Group products by manufacturer_id (matching businesses.id)
  const productsByMfg = new Map<string, any[]>();
  for (const product of products) {
    const mfgId = product.manufacturer_id;
    if (!mfgId) continue;
    const list = productsByMfg.get(mfgId) ?? [];
    list.push(product);
    productsByMfg.set(mfgId, list);
  }

  const suppliers: SupplierSnapshot[] = [];

  for (const biz of businesses) {
    const mfgProducts = productsByMfg.get(biz.id) ?? [];
    const certSet = new Set<string>();

    for (const prod of mfgProducts) {
      if (Array.isArray(prod.certifications)) {
        for (const cert of prod.certifications) {
          if (cert && typeof cert === 'string') certSet.add(cert.trim());
        }
      }
    }

    const productDetails: ProductDetail[] = mfgProducts.map((p) => ({
      name: p.name,
      category: p.category,
      material: p.material ?? null,
      unitPrice: p.unit_price ?? null,
      priceUnit: p.price_unit ?? 'INR / unit',
      moq: p.moq ?? 1,
      leadTimeDays: p.lead_time_days ?? null,
      certifications: Array.isArray(p.certifications) ? p.certifications : [],
      sampleAvailable: p.sample_available ?? true,
      valueProposition: p.value_proposition ?? null,
      description: p.description ?? null,
    }));

    // Calculate average delivery days across products if available
    let avgDeliveryDays: number | null = null;
    const leadTimes = productDetails
      .map((p) => p.leadTimeDays)
      .filter((d): d is number => typeof d === 'number' && d > 0);
    if (leadTimes.length > 0) {
      avgDeliveryDays = Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length);
    }

    suppliers.push({
      id: biz.id,
      name: biz.name || biz.legal_name || 'Verified Partner',
      legalName: biz.legal_name ?? null,
      role: biz.role || 'manufacturer',
      city: biz.city ?? null,
      state: biz.state ?? null,
      country: biz.country ?? 'India',
      industry: biz.industry ?? null,
      description: biz.description ?? null,
      rating: biz.rating ?? 0,
      ratingCount: biz.rating_count ?? 0,
      certifications: Array.from(certSet),
      locations: [biz.city, biz.state, biz.country].filter(Boolean) as string[],
      avgDeliveryDays,
      monthlyQuota: null,
      products: productDetails,
      contacts: [],
    });
  }

  return { suppliers, allBusinesses: businesses, allProfiles };
}

export async function resolveUserProfile(
  userProfileInput?: UserProfileContext | null,
  token?: string
): Promise<UserProfileContext | null> {
  let resolved: UserProfileContext = { ...(userProfileInput ?? {}) };

  if (token) {
    try {
      const db = getSupabase();
      const { data: { user } } = await db.auth.getUser(token);

      if (user) {
        resolved.userId = user.id;
        resolved.email = resolved.email || user.email;

        // Fetch user profile row
        const { data: profile } = await db
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          resolved.role = resolved.role || profile.role;
          if (profile.display_name && !resolved.name) {
            resolved.name = profile.display_name;
          }
          if (profile.city && !resolved.city) resolved.city = profile.city;
          if (profile.state && !resolved.state) resolved.state = profile.state;
        }

        // Fetch user business details if registered
        const { data: business } = await db
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (business) {
          resolved.companyName = resolved.companyName || business.name || business.legal_name;
          resolved.legalName = business.legal_name;
          resolved.city = resolved.city || business.city;
          resolved.state = resolved.state || business.state;
          resolved.country = resolved.country || business.country;
          resolved.industry = resolved.industry || business.industry;
          resolved.description = resolved.description || business.description;
        }
      }
    } catch (e) {
      console.warn('Could not enrich user profile from token:', e);
    }
  }

  const hasAnyData = Boolean(
    resolved.name || resolved.companyName || resolved.role || resolved.email || resolved.city
  );

  return hasAnyData ? resolved : null;
}

function buildSystemPrompt(
  suppliers: SupplierSnapshot[],
  allBusinesses: any[],
  userProfile?: UserProfileContext | null
): string {
  const supplierLines = suppliers.map((supplier, index) => {
    const locationStr = [supplier.city, supplier.state, supplier.country].filter(Boolean).join(', ');
    const certStr = supplier.certifications.length > 0 ? supplier.certifications.join(', ') : 'Verified OEM';
    const productsList = supplier.products
      .map(
        (p) =>
          `  - Product: ${p.name} | Category: ${p.category} | Material: ${p.material || 'Standard'} | Unit Price: ${p.unitPrice ? 'INR ' + p.unitPrice + ' ' + (p.priceUnit || '') : 'Quotation on RFQ'} | MOQ: ${p.moq} units | Lead Time: ${p.leadTimeDays ? p.leadTimeDays + ' days' : 'Standard'} | Value: ${p.valueProposition || 'High precision'}`
      )
      .join('\n');

    return [
      `${index + 1}. ${supplier.name} (${supplier.legalName || supplier.name})`,
      `   Role: ${supplier.role}`,
      `   Location: ${locationStr}`,
      `   Certifications: ${certStr}`,
      `   Average Delivery: ${supplier.avgDeliveryDays ? supplier.avgDeliveryDays + ' days' : 'Varies by spec'}`,
      `   Products & Capacities:`,
      productsList || '   - Custom manufacturing on RFQ submission.',
    ].join('\n');
  });

  const userProfileSection = userProfile
    ? [
        'ACTIVE USER PROFILE (The person chatting with you):',
        `- User Name: ${userProfile.name || 'Executive'}`,
        `- Company: ${userProfile.companyName || 'Not specified'}`,
        `- Account Role: ${userProfile.role ? userProfile.role.toUpperCase() : 'BUYER'}`,
        `- Email: ${userProfile.email || 'Confidential'}`,
        userProfile.city || userProfile.state ? `- Location: ${[userProfile.city, userProfile.state, userProfile.country].filter(Boolean).join(', ')}` : null,
        userProfile.industry ? `- Industry Focus: ${userProfile.industry}` : null,
        userProfile.description ? `- Business Profile: ${userProfile.description}` : null,
        '',
        'USER PROFILE INSTRUCTIONS:',
        '- You have complete access to the user profile above.',
        '- Tailor all suggestions, partner comparisons, and sourcing recommendations directly to the user company and role.',
        '- When the user asks about their profile (e.g. "What is my profile?", "Who am I?"), report their details accurately and politely.',
        '- Address the user professionally by name or company name when natural.',
      ].filter(Boolean).join('\n')
    : [
        'ACTIVE USER PROFILE:',
        '- Guest / Prospective Enterprise Buyer.',
        '- When the user asks for suggestions, offer to match them with verified suppliers based on their parts, materials, or target delivery specs.',
      ].join('\n');

  return [
    'You are SoGo, the Sourcingo AI procurement advisor — an expert supply chain and industrial matchmaking intelligence.',
    'Your mission: help users find, compare, and shortlist verified manufacturers, understand specs, and make strategic sourcing decisions using live Sourcingo profile data.',
    '',
    userProfileSection,
    '',
    'CRITICAL MESSAGE FORMATTING RULES (STRICTLY ENFORCED):',
    '- Provide a clean, properly formatted, human-readable message in PLAIN TEXT.',
    '- ABSOLUTELY DO NOT USE RAW MARKDOWN SYNTAX:',
    '  * Never output asterisks for bold or italic (NO **word**, NO *word*).',
    '  * Never output markdown headers with hashtags (NO #, NO ##, NO ###).',
    '  * Never output backticks or code blocks (NO ```, NO `code`).',
    '  * Never output markdown tables with pipe dividers (NO |---|---|).',
    '- TO STRUCTURE YOUR MESSAGE PROPERLY, USE ONLY:',
    '  * Clean conversational paragraphs with standard punctuation.',
    '  * UPPERCASE section headers followed by a colon (e.g. RECOMMENDATIONS:, COMPARISON SUMMARY:, NEXT STEPS:, SPECIFICATIONS:).',
    '  * Simple bullet points starting with a hyphen and a space (- item).',
    '  * Numbered lists using standard numerals (1. , 2. ).',
    '- Keep responses crisp, executive-grade, highly articulate, and easy to read.',
    '',
    'SUPPLIER DATABASE KNOWLEDGE RULES:',
    '- Base your answers on the live Sourcingo manufacturer and product profiles below.',
    '- Cite exact suppliers, verified certifications (e.g. ISO 9001, IATF 16949), unit prices, MOQs, and lead times from the database.',
    '- Proactively recommend the 2-3 most relevant verified suppliers whenever the user asks for suggestions or describes parts/materials.',
    '- If comparing multiple suppliers, present a clear side-by-side comparison using clean bullet points and end with a concise "RECOMMENDED PICK:".',
    '',
    `LIVE DATABASE PROFILES (${suppliers.length} Verified Manufacturers in Sourcingo):`,
    supplierLines.join('\n\n'),
  ].join('\n');
}

export function sanitizeHistory(history: ChatMessage[]): ChatMessage[] {
  return history
    .filter(
      (entry) =>
        (entry.role === 'user' || entry.role === 'assistant') &&
        typeof entry.content === 'string' &&
        entry.content.trim().length > 0
    )
    .map((entry) => ({
      role: entry.role,
      content: entry.content.slice(0, MAX_MESSAGE_LENGTH),
    }))
    .slice(-MAX_HISTORY_MESSAGES);
}

export async function runChat(
  message: string,
  chatHistory: ChatMessage[],
  options?: {
    userProfile?: UserProfileContext | null;
    token?: string;
  }
): Promise<ChatResult> {
  const history = sanitizeHistory(chatHistory);

  // 1. Fetch live database profiles (businesses, products, verifications)
  const { suppliers, allBusinesses } = await fetchAllProfilesAndSuppliers();

  // 2. Resolve active user profile from token and client payload
  const userProfile = await resolveUserProfile(options?.userProfile, options?.token);

  // 3. Build system prompt with all profile data and plain text formatting instructions
  const systemPrompt = buildSystemPrompt(suppliers, allBusinesses, userProfile);

  // 4. Request completion from Groq
  const completion = await getGroq().chat.completions.create({
    model: process.env.GROQ_MODEL || DEFAULT_MODEL,
    temperature: 0.3,
    max_tokens: 2500,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history.map((entry) => ({ role: entry.role, content: entry.content })),
      { role: 'user', content: message.slice(0, MAX_MESSAGE_LENGTH) },
    ],
  });

  const rawReply = completion.choices[0]?.message?.content?.trim();

  // If reasoning model exhausted tokens or returned empty, check reasoning or fallback
  let candidateReply = rawReply;
  if (!candidateReply) {
    const reasoning = (completion.choices[0]?.message as any)?.reasoning;
    if (reasoning && typeof reasoning === 'string') {
      candidateReply = reasoning.slice(-800);
    } else {
      candidateReply = 'I have evaluated your profile against our verified manufacturers in the database. Please specify which material or component you are looking to source.';
    }
  }

  // 5. Enforce 100% plain text without markdown artifacts
  const cleanedReply = cleanToPlainMessage(candidateReply);

  const updatedHistory: ChatMessage[] = sanitizeHistory([
    ...history,
    { role: 'user', content: message },
    { role: 'assistant', content: cleanedReply },
  ]);

  return {
    message: cleanedReply,
    chatHistory: updatedHistory,
    suppliersConsidered: suppliers.length,
  };
}