import { recipeImportDraftSchema, type RecipeImportDraft } from '@family-recipe/shared';

export type ImportErrorCode = 'ai_not_configured' | 'ai_upstream_error' | 'import_unparseable';

export class ImportError extends Error {
  readonly code: ImportErrorCode;

  constructor(code: ImportErrorCode) {
    super(code);
    this.name = 'ImportError';
    this.code = code;
  }
}

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';
const TIMEOUT_MS = 15000;

const SYSTEM_PROMPT = [
  'You extract structured recipe data from pasted text.',
  'Return ONLY a JSON object (no markdown, no prose) with exactly these keys:',
  '- "name": string',
  '- "description": string (short, may be empty)',
  '- "ingredients": array of {"name": string, "quantity": string, "unit": string optional}',
  '- "instructions": string (all steps as one string)',
  'Optional keys: "cuisine": string, "prepTime": number (minutes),',
  '"cookTime": number (minutes), "servings": number,',
  '"difficulty": "easy" | "medium" | "hard".',
].join('\n');

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : undefined;
}

function extractJsonObject(content: string): string {
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new ImportError('import_unparseable');
  }
  return content.slice(start, end + 1);
}

function extractContent(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined;

  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return undefined;

  const first = choices[0];
  if (typeof first !== 'object' || first === null) return undefined;

  const message = (first as { message?: unknown }).message;
  if (typeof message !== 'object' || message === null) return undefined;

  const content = (message as { content?: unknown }).content;
  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    return content
      .map((part) =>
        typeof part === 'object' &&
        part !== null &&
        typeof (part as { text?: unknown }).text === 'string'
          ? (part as { text: string }).text
          : '',
      )
      .join('');
  }

  return undefined;
}

function toPositiveInt(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  if (typeof value === 'string') {
    const match = value.match(/\d+/);
    if (match) {
      const n = Number(match[0]);
      if (Number.isInteger(n) && n > 0) return n;
    }
  }
  return undefined;
}

function toDifficulty(value: unknown): 'easy' | 'medium' | 'hard' | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'easy' || normalized === 'medium' || normalized === 'hard') {
    return normalized;
  }
  return undefined;
}

function toIngredient(value: unknown): { name: string; quantity: string; unit?: string } {
  if (typeof value === 'object' && value !== null) {
    const obj = value as { name?: unknown; quantity?: unknown; unit?: unknown };
    const name = typeof obj.name === 'string' ? obj.name.trim() : '';
    const quantity = typeof obj.quantity === 'string' ? obj.quantity : '';
    const unit =
      typeof obj.unit === 'string' && obj.unit.trim() !== '' ? obj.unit.trim() : undefined;
    return { name, quantity, ...(unit !== undefined ? { unit } : {}) };
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const match = trimmed.match(/^([\d\s./½¼¾]+)\s*([a-zA-Z.]+)?\s*(.*)$/);
    if (match && match[3].trim() !== '') {
      return {
        name: match[3].trim(),
        quantity: match[1].trim(),
        ...(match[2] ? { unit: match[2].trim() } : {}),
      };
    }
    return { name: trimmed, quantity: '' };
  }

  return { name: '', quantity: '' };
}

function normalizeDraft(raw: unknown): Record<string, unknown> {
  if (typeof raw !== 'object' || raw === null) {
    throw new ImportError('import_unparseable');
  }

  const obj = raw as Record<string, unknown>;
  const name = typeof obj.name === 'string' ? obj.name.trim() : '';
  const description = typeof obj.description === 'string' ? obj.description.trim() : '';
  const instructions = typeof obj.instructions === 'string' ? obj.instructions.trim() : '';

  const ingredients = Array.isArray(obj.ingredients)
    ? obj.ingredients.map(toIngredient).filter((ingredient) => ingredient.name !== '')
    : [];

  const result: Record<string, unknown> = {
    name,
    description: description !== '' ? description : name,
    ingredients,
    instructions,
  };

  const cuisine =
    typeof obj.cuisine === 'string' && obj.cuisine.trim() !== '' ? obj.cuisine.trim() : undefined;
  const prepTime = toPositiveInt(obj.prepTime);
  const cookTime = toPositiveInt(obj.cookTime);
  const servings = toPositiveInt(obj.servings);
  const difficulty = toDifficulty(obj.difficulty);

  if (cuisine !== undefined) result.cuisine = cuisine;
  if (prepTime !== undefined) result.prepTime = prepTime;
  if (cookTime !== undefined) result.cookTime = cookTime;
  if (servings !== undefined) result.servings = servings;
  if (difficulty !== undefined) result.difficulty = difficulty;

  return result;
}

export async function importRecipeDraft(text: string): Promise<RecipeImportDraft> {
  const apiKey = readEnv('AI_API_KEY');
  if (!apiKey) {
    throw new ImportError('ai_not_configured');
  }

  const baseUrl = readEnv('AI_API_BASE_URL') ?? DEFAULT_BASE_URL;
  const model = readEnv('AI_API_MODEL') ?? DEFAULT_MODEL;

  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ImportError('ai_upstream_error');
  }

  if (!response.ok) {
    throw new ImportError('ai_upstream_error');
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ImportError('ai_upstream_error');
  }

  const content = extractContent(payload);
  if (!content) {
    throw new ImportError('import_unparseable');
  }

  let raw: unknown;
  try {
    raw = JSON.parse(extractJsonObject(content));
  } catch {
    throw new ImportError('import_unparseable');
  }

  const normalized = normalizeDraft(raw);
  const result = recipeImportDraftSchema.safeParse(normalized);
  if (!result.success) {
    throw new ImportError('import_unparseable');
  }

  return result.data;
}
