import { ImportError, importRecipeDraft } from './recipeImport';

const ENV_KEYS = ['AI_API_KEY', 'AI_API_BASE_URL', 'AI_API_MODEL'] as const;

function mockFetchResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
}

function completionResponse(content: string) {
  return mockFetchResponse(200, { choices: [{ message: { content } }] });
}

describe('importRecipeDraft', () => {
  const fetchMock = jest.fn();
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) savedEnv[key] = process.env[key];
    process.env.AI_API_KEY = 'test-key';
    delete process.env.AI_API_BASE_URL;
    delete process.env.AI_API_MODEL;
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[key];
    }
  });

  it('throws ai_not_configured when AI_API_KEY is missing', async () => {
    delete process.env.AI_API_KEY;

    const promise = importRecipeDraft('a recipe');
    await expect(promise).rejects.toBeInstanceOf(ImportError);
    await expect(promise).rejects.toMatchObject({ code: 'ai_not_configured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws ai_upstream_error when the provider request fails', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    await expect(importRecipeDraft('a recipe')).rejects.toMatchObject({
      code: 'ai_upstream_error',
    });
  });

  it('throws ai_upstream_error on a non-2xx response', async () => {
    fetchMock.mockResolvedValue(mockFetchResponse(500, { error: 'boom' }));

    await expect(importRecipeDraft('a recipe')).rejects.toMatchObject({
      code: 'ai_upstream_error',
    });
  });

  it('throws import_unparseable when the content is not a JSON object', async () => {
    fetchMock.mockResolvedValue(completionResponse('no recipe here'));

    await expect(importRecipeDraft('a recipe')).rejects.toMatchObject({
      code: 'import_unparseable',
    });
  });

  it('throws import_unparseable when the draft has no ingredients', async () => {
    fetchMock.mockResolvedValue(
      completionResponse(
        JSON.stringify({
          name: 'Pancakes',
          description: 'Fluffy',
          ingredients: [],
          instructions: 'Mix',
        }),
      ),
    );

    await expect(importRecipeDraft('a recipe')).rejects.toMatchObject({
      code: 'import_unparseable',
    });
  });

  it('extracts a full draft and normalizes the model output', async () => {
    fetchMock.mockResolvedValue(
      completionResponse(
        JSON.stringify({
          name: 'Pancakes',
          description: '',
          ingredients: ['2 cups flour', { name: 'Egg', quantity: '2' }],
          instructions: 'Mix and fry',
          prepTime: '10 minutes',
          cookTime: 5,
          servings: '4',
          difficulty: 'Easy',
          cuisine: 'American',
        }),
      ),
    );

    const draft = await importRecipeDraft('a recipe');

    expect(draft).toEqual({
      name: 'Pancakes',
      description: 'Pancakes',
      ingredients: [
        { name: 'flour', quantity: '2', unit: 'cups' },
        { name: 'Egg', quantity: '2' },
      ],
      instructions: 'Mix and fry',
      prepTime: 10,
      cookTime: 5,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'American',
    });
  });

  it('sends an OpenAI-shaped request with json_object and a timeout', async () => {
    fetchMock.mockResolvedValue(
      completionResponse(
        JSON.stringify({
          name: 'Pancakes',
          description: 'Fluffy',
          ingredients: [{ name: 'Flour', quantity: '2 cups' }],
          instructions: 'Mix',
        }),
      ),
    );

    await importRecipeDraft('a recipe');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect(init.headers.Authorization).toBe('Bearer test-key');
    expect(JSON.parse(init.body)).toMatchObject({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
    });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});
