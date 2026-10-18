import { Router, type Request, type RequestHandler, type Response } from 'express';
import { runChat, type ChatMessage } from '../services/chatService.js';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 50;

function parseHistory(raw: unknown): ChatMessage[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > MAX_HISTORY_ITEMS) return null;

  const parsed: ChatMessage[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) return null;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    parsed.push({ role, content });
  }
  return parsed;
}

export function createChatRouter(requireAuth?: RequestHandler): Router {
  const router = Router();
  const guards: RequestHandler[] = requireAuth ? [requireAuth] : [];

  router.post('/', ...guards, async (req: Request, res: Response): Promise<void> => {
    const body = (req.body ?? {}) as {
      message?: unknown;
      chatHistory?: unknown;
      userProfile?: unknown;
    };

    if (typeof body.message !== 'string' || body.message.trim().length === 0) {
      res.status(400).json({ error: '`message` is required and must be a non-empty string.' });
      return;
    }

    const message = body.message.trim();
    if (message.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({ error: `\`message\` must be at most ${MAX_MESSAGE_LENGTH} characters.` });
      return;
    }

    const chatHistory = parseHistory(body.chatHistory);
    if (chatHistory === null) {
      res.status(400).json({
        error: `\`chatHistory\` must be an array of at most ${MAX_HISTORY_ITEMS} objects shaped like { role: "user" | "assistant", content: string }.`,
      });
      return;
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const userProfile =
      typeof body.userProfile === 'object' && body.userProfile !== null
        ? (body.userProfile as Record<string, unknown>)
        : undefined;

    try {
      const result = await runChat(message, chatHistory, {
        userProfile,
        token,
      });
      res.status(200).json({
        message: result.message,
        chatHistory: result.chatHistory,
        suppliersConsidered: result.suppliersConsidered,
      });
    } catch (error) {
      console.error('POST /api/chat failed:', error);
      res.status(500).json({ error: 'Unable to process your request right now. Please try again.' });
    }
  });

  return router;
}

export default createChatRouter();