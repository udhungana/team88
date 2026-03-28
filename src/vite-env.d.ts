/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PERPLEXITY_API_KEY?: string;
  /** Default https://api.perplexity.ai */
  readonly VITE_PERPLEXITY_BASE_URL?: string;
  /** Default sonar */
  readonly VITE_PERPLEXITY_MODEL?: string;
  /** Best for conversational chat replies. Default sonar-pro */
  readonly VITE_PERPLEXITY_MODEL_CHAT?: string;
  /** Best for strict JSON/instruction adherence. Default sonar-reasoning-pro */
  readonly VITE_PERPLEXITY_MODEL_STRUCTURED?: string;

  readonly VITE_OPENAI_API_KEY?: string;
  /** Default https://api.openai.com/v1 — use OpenAI-compatible endpoints if needed */
  readonly VITE_OPENAI_BASE_URL?: string;
  /** Default gpt-4o-mini */
  readonly VITE_OPENAI_MODEL?: string;
}
