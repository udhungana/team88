/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY?: string;
  /** Default https://api.openai.com/v1 — use OpenAI-compatible endpoints if needed */
  readonly VITE_OPENAI_BASE_URL?: string;
  /** Default gpt-4o-mini */
  readonly VITE_OPENAI_MODEL?: string;
}
