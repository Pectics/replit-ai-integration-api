const NOW_SEC = Math.floor(Date.now() / 1000);

export interface OpenAIModel {
  id: string;
  object: "model";
  created: number;
  owned_by: string;
}

export interface AnthropicModel {
  type: "model";
  id: string;
  display_name: string;
  created_at: string;
}

export interface GeminiModel {
  name: string;
  version: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
}

function oai(id: string, created = NOW_SEC): OpenAIModel {
  return { id, object: "model", created, owned_by: "openai" };
}

function anth(id: string, displayName: string, createdAt: string): AnthropicModel {
  return { type: "model", id, display_name: displayName, created_at: createdAt };
}

function gem(
  shortName: string,
  version: string,
  displayName: string,
  description: string,
  inputLimit: number,
  outputLimit: number,
  methods: string[],
): GeminiModel {
  return {
    name: `models/${shortName}`,
    version,
    displayName,
    description,
    inputTokenLimit: inputLimit,
    outputTokenLimit: outputLimit,
    supportedGenerationMethods: methods,
  };
}

const CONTENT_METHODS = ["generateContent", "streamGenerateContent", "countTokens"];
const IMAGE_METHODS = ["generateContent", "streamGenerateContent"];

export const OPENAI_MODELS: OpenAIModel[] = [
  oai("gpt-5.2"),
  oai("gpt-5.3-codex"),
  oai("gpt-5.2-codex"),
  oai("gpt-5.1"),
  oai("gpt-5"),
  oai("gpt-5-mini"),
  oai("gpt-5-nano"),
  oai("gpt-4.1"),
  oai("gpt-4.1-mini"),
  oai("gpt-4.1-nano"),
  oai("gpt-4o"),
  oai("gpt-4o-mini"),
  oai("o4-mini"),
  oai("o3"),
  oai("o3-mini"),
  oai("gpt-image-1"),
  oai("gpt-audio"),
  oai("gpt-audio-mini"),
  oai("gpt-4o-mini-transcribe"),
];

export const ANTHROPIC_MODELS: AnthropicModel[] = [
  anth("claude-opus-4-6", "Claude Opus 4.6", "2025-05-14T00:00:00Z"),
  anth("claude-opus-4-5", "Claude Opus 4.5", "2025-04-09T00:00:00Z"),
  anth("claude-opus-4-1", "Claude Opus 4.1", "2025-02-19T00:00:00Z"),
  anth("claude-sonnet-4-6", "Claude Sonnet 4.6", "2025-05-14T00:00:00Z"),
  anth("claude-sonnet-4-5", "Claude Sonnet 4.5", "2025-04-09T00:00:00Z"),
  anth("claude-haiku-4-5", "Claude Haiku 4.5", "2025-02-19T00:00:00Z"),
];

export const GEMINI_MODELS: GeminiModel[] = [
  gem("gemini-3.1-pro-preview", "3.1", "Gemini 3.1 Pro Preview", "Latest and most powerful model for agentic workflows.", 1048576, 65536, CONTENT_METHODS),
  gem("gemini-3-pro-preview", "3.0", "Gemini 3 Pro Preview", "Powerful model for agentic workflows and vibe-coding.", 1048576, 65536, CONTENT_METHODS),
  gem("gemini-3-flash-preview", "3.0", "Gemini 3 Flash Preview", "Hybrid reasoning model for daily use and high-volume tasks.", 1048576, 65536, CONTENT_METHODS),
  gem("gemini-3-pro-image-preview", "3.0", "Gemini 3 Pro Image Preview", "Thinking model for high-quality image generation.", 32768, 8192, IMAGE_METHODS),
  gem("gemini-2.5-pro", "2.5", "Gemini 2.5 Pro", "Excels at coding and complex reasoning tasks.", 1048576, 65536, CONTENT_METHODS),
  gem("gemini-2.5-flash", "2.5", "Gemini 2.5 Flash", "Hybrid reasoning model for daily use and high-volume tasks.", 1048576, 65536, CONTENT_METHODS),
  gem("gemini-2.5-flash-image", "2.5", "Gemini 2.5 Flash Image", "Native image generation model for ultra-fast image generation.", 32768, 8192, IMAGE_METHODS),
];

export function findOpenAIModel(id: string): OpenAIModel | undefined {
  return OPENAI_MODELS.find((m) => m.id === id);
}

export function findAnthropicModel(id: string): AnthropicModel | undefined {
  return ANTHROPIC_MODELS.find((m) => m.id === id);
}

export function findGeminiModel(nameOrShortName: string): GeminiModel | undefined {
  const normalized = nameOrShortName.startsWith("models/")
    ? nameOrShortName
    : `models/${nameOrShortName}`;
  return GEMINI_MODELS.find((m) => m.name === normalized);
}
