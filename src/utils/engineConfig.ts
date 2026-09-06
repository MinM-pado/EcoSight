import { AIEngineConfig, LLMProvider } from '../types';

export const ENGINE_STORAGE_KEY = 'ecosight_ai_engine_config';

export const DEFAULT_ENGINE_CONFIG: AIEngineConfig = {
  provider: 'gemini',
  ollamaEndpoint: 'http://127.0.0.1:11434',
  ollamaModel: 'llama3.1',
  lmStudioEndpoint: 'http://127.0.0.1:1234',
  lmStudioModel: 'local-model',
  customEndpoint: 'http://127.0.0.1:11434/v1',
  customModel: 'llama3.1',
  customApiKey: '',
  temperature: 0.3,
};

export const POPULAR_OLLAMA_MODELS = [
  { id: 'llama3.1', name: 'Llama 3.1 (8B)', desc: 'Meta 오픈소스. 레드팀 비판 논박 및 다단계 추론 강력' },
  { id: 'qwen2.5', name: 'Qwen 2.5 (7B/14B)', desc: '알리바바 오픈소스. 뛰어난 한국어 이해도 및 엄격한 JSON 스키마' },
  { id: 'gemma2', name: 'Gemma 2 (9B)', desc: '구글 DeepMind. 높은 학술·경제 개념 정밀도' },
  { id: 'deepseek-r1', name: 'DeepSeek R1 (7B/8B)', desc: '체인 오브 소트(CoT) 심층 추론 및 맹점 반박' },
  { id: 'mistral', name: 'Mistral (7B)', desc: '초고속 경량 응답 및 유연한 문맥' }
];

export function loadEngineConfig(): AIEngineConfig {
  try {
    const saved = localStorage.getItem(ENGINE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_ENGINE_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load engine config from localStorage:', e);
  }
  return DEFAULT_ENGINE_CONFIG;
}

export function saveEngineConfig(config: AIEngineConfig): void {
  try {
    localStorage.setItem(ENGINE_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save engine config to localStorage:', e);
  }
}

export function getActiveEngineSummary(config: AIEngineConfig): {
  badgeName: string;
  badgeColor: string;
  badgeDetail: string;
  isLocal: boolean;
} {
  switch (config.provider) {
    case 'ollama':
      return {
        badgeName: 'Ollama (Local)',
        badgeColor: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300',
        badgeDetail: config.ollamaModel,
        isLocal: true,
      };
    case 'lmstudio':
      return {
        badgeName: 'LM Studio (Local)',
        badgeColor: 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300',
        badgeDetail: config.lmStudioModel,
        isLocal: true,
      };
    case 'custom':
      return {
        badgeName: 'Custom/BYOK',
        badgeColor: 'border-purple-500/40 bg-purple-500/20 text-purple-300',
        badgeDetail: config.customModel || 'Custom Endpoint',
        isLocal: config.customEndpoint.includes('localhost') || config.customEndpoint.includes('127.0.0.1'),
      };
    case 'gemini':
    default:
      return {
        badgeName: 'Gemini (Cloud)',
        badgeColor: 'border-amber-500/40 bg-amber-500/20 text-amber-300',
        badgeDetail: 'Free Tier (Zero Setup)',
        isLocal: false,
      };
  }
}
