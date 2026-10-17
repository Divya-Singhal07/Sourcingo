import Groq from 'groq-sdk';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatResult {
  message: string;
  chatHistory: ChatMessage[];
  suppliersConsidered: number;
}

interface ManufacturerRow {
  business_id: string;
  monthly_quota: number | null;
  average_delivery_days: number | null;
  locations: unknown;
}

interface BusinessRow {
  id: string;
  name: string | null;
  legal_name: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  role: string | null;
}

interface ContactRow {
  business_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
}

interface VerificationRow {
  business_id: string;
  is_gst_verified: boolean | null;
  is_iso_certified: boolean | null;
  certifications: unknown;
}

interface SupplierSnapshot {
  name: string | null;
  legalName: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  role: string | null;
  monthlyQuota: number | null;
  avgDeliveryDays: number | null;
  locations: string[];
  gstVerified: boolean;
  isoCertified: boolean;
  certifications: string[];
  contacts: Array<{ name: string | null; phone: string | null; email: string | null }>;
}

const MAX_MANUFACTURERS_FETCHED = 1000;
const MAX_SUPPLIERS_IN_PROMPT = 80;
const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;
const ID_CHUNK_SIZE = 100;
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

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

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
      .filter((item) => item.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function fetchByBusinessIds<T>(
  db: SupabaseClient,
  table: string,
  columns: string,
  column: string,
  ids: string[]
): Promise<T[]> {
  if (ids.length === 0) return [];
  const results = await Promise.all(
    chunk(ids, ID_CHUNK_SIZE).map(async (batch) => {
      const { data, error } = await db.from(table).select(columns).in(column, batch);
      if (error) {
        throw new Error(`Failed to load ${table}: ${error.message}`);
      }
      return (data ?? []) as unknown as T[];
    })
  );
  return results.flat();
}

async function fetchSuppliers(): Promise<SupplierSnapshot[]> {
  const db = getSupabase();

  const { data: manufacturerData, error: manufacturerError } = await db
    .from('manufacturers')
    .select('business_id, monthly_quota, average_delivery_days, locations')
    .limit(MAX_MANUFACTURERS_FETCHED);

  if (manufacturerError) {
    throw new Error(`Failed to load manufacturers: ${manufacturerError.message}`);
  }

  const manufacturers = (manufacturerData ?? []) as unknown as ManufacturerRow[];
  const ids = manufacturers.map((m) => m.business_id);

  const [businesses, contacts, verifications] = await Promise.all([
    fetchByBusinessIds<BusinessRow>(
      db,
      'businesses',
      'id, name, legal_name, city, state, country, role',
      'id',
      ids
    ),
    fetchByBusinessIds<ContactRow>(
      db,
      'business_contacts',
      'business_id, name, phone, email',
      'business_id',
      ids
    ),
    fetchByBusinessIds<VerificationRow>(
      db,
      'business_verifications',
      'business_id, is_gst_verified, is_iso_certified, certifications',
      'business_id',
      ids
    ),
  ]);

  const businessById = new Map<string, BusinessRow>();
  for (const business of businesses) businessById.set(business.id, business);

  const contactsById = new Map<string, ContactRow[]>();
  for (const contact of contacts) {
    const list = contactsById.get(contact.business_id) ?? [];
    list.push(contact);
    contactsById.set(contact.business_id, list);
  }

  const verificationById = new Map<string, VerificationRow>();
  for (const verification of verifications) {
    verificationById.set(verification.business_id, verification);
  }

  const suppliers: SupplierSnapshot[] = [];
  for (const manufacturer of manufacturers) {
    const business = businessById.get(manufacturer.business_id);
    if (!business) continue;
    const verification = verificationById.get(manufacturer.business_id);
    suppliers.push({
      name: business.name,
      legalName: business.legal_name,
      city: business.city,
      state: business.state,
      country: business.country,
      role: business.role,
      monthlyQuota: manufacturer.monthly_quota,
      avgDeliveryDays: manufacturer.average_delivery_days,
      locations: toStringArray(manufacturer.locations),
      gstVerified: verification?.is_gst_verified === true,
      isoCertified: verification?.is_iso_certified === true,
      certifications: toStringArray(verification?.certifications),
      contacts: (contactsById.get(manufacturer.business_id) ?? []).map((c) => ({
        name: c.name,
        phone: c.phone,
        email: c.email,
      })),
    });
  }

  return suppliers;
}

function rankSuppliers(suppliers: SupplierSnapshot[], query: string): SupplierSnapshot[] {
  const terms = Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((term) => term.length >= 3)
    )
  );

  const scored = suppliers.map((supplier) => {
    const haystack = [
      supplier.name,
      supplier.legalName,
      supplier.city,
      supplier.state,
      supplier.country,
      supplier.locations.join(' '),
      supplier.certifications.join(' '),
      supplier.isoCertified ? 'iso' : '',
      supplier.gstVerified ? 'gst' : '',
    ]
      .filter((part): part is string => typeof part === 'string')
      .join(' ')
      .toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (haystack.includes(term)) score += 1;
    }
    return { supplier, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aDays = a.supplier.avgDeliveryDays ?? Number.MAX_SAFE_INTEGER;
    const bDays = b.supplier.avgDeliveryDays ?? Number.MAX_SAFE_INTEGER;
    return aDays - bDays;
  });

  return scored.map((entry) => entry.supplier);
}

function buildSystemPrompt(suppliers: SupplierSnapshot[], totalCount: number): string {
  const lines = suppliers.map((supplier, index) => `${index + 1}. ${JSON.stringify(supplier)}`);

  return [
    'You are Sourcingo Assistant, a procurement advisor for Sourcingo, a managed B2B manufacturing marketplace in India.',
    'You help buyers find, filter, compare and shortlist verified manufacturers.',
    '',
    'Rules:',
    '- Answer using ONLY the supplier data below for any claim about specific suppliers (location, certifications, delivery days, quota, contacts).',
    '- Never invent suppliers, numbers, certifications or contact details. If the data does not contain a match, say so plainly and suggest how the buyer could broaden the search.',
    '- When filtering, apply every condition the user states (for example city, ISO certification, delivery days) and name the suppliers that match.',
    '- avgDeliveryDays is the average delivery time in days (lower is faster). monthlyQuota is monthly production capacity (higher means better for high-volume orders).',
    '- When comparing suppliers, present a concise Markdown table followed by a short recommendation with reasoning.',
    '- Keep answers focused and scannable. Use Markdown formatting. Share contact details only when the user asks for them.',
    '- For general procurement questions that do not depend on the data (negotiation, RFQs, logistics, quality checks), give practical advice and make clear it is general guidance.',
    '',
    `Live supplier snapshot (${suppliers.length} of ${totalCount} manufacturers shown, ordered by relevance to the latest question):`,
    lines.length > 0 ? lines.join('\n') : 'No manufacturers are currently available in the database.',
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

export async function runChat(message: string, chatHistory: ChatMessage[]): Promise<ChatResult> {
  const history = sanitizeHistory(chatHistory);
  const allSuppliers = await fetchSuppliers();

  const relevanceQuery = [message, ...history.filter((h) => h.role === 'user').slice(-2).map((h) => h.content)].join(' ');
  const topSuppliers = rankSuppliers(allSuppliers, relevanceQuery).slice(0, MAX_SUPPLIERS_IN_PROMPT);

  const systemPrompt = buildSystemPrompt(topSuppliers, allSuppliers.length);

  const completion = await getGroq().chat.completions.create({
    model: process.env.GROQ_MODEL || DEFAULT_MODEL,
    temperature: 0.3,
    max_tokens: 1500,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history.map((entry) => ({ role: entry.role, content: entry.content })),
      { role: 'user', content: message.slice(0, MAX_MESSAGE_LENGTH) },
    ],
  });

  const reply = completion.choices[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error('The AI returned an empty response');
  }

  const updatedHistory: ChatMessage[] = sanitizeHistory([
    ...history,
    { role: 'user', content: message },
    { role: 'assistant', content: reply },
  ]);

  return {
    message: reply,
    chatHistory: updatedHistory,
    suppliersConsidered: topSuppliers.length,
  };
}