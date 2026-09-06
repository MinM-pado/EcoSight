import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Server, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  ExternalLink, 
  Shield, 
  Zap, 
  Layers,
  Sliders,
  DollarSign,
  HelpCircle,
  Check
} from 'lucide-react';
import { AIEngineConfig, AIEngineTestResult, LLMProvider } from '../types';
import { POPULAR_OLLAMA_MODELS, saveEngineConfig } from '../utils/engineConfig';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: AIEngineConfig;
  onSaveConfig: (newConfig: AIEngineConfig) => void;
}

export const AIEngineModal: React.FC<Props> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [activeProvider, setActiveProvider] = useState<LLMProvider>(config.provider);
  const [ollamaEndpoint, setOllamaEndpoint] = useState(config.ollamaEndpoint || 'http://127.0.0.1:11434');
  const [ollamaModel, setOllamaModel] = useState(config.ollamaModel || 'llama3.1');
  const [lmStudioEndpoint, setLmStudioEndpoint] = useState(config.lmStudioEndpoint || 'http://127.0.0.1:1234');
  const [lmStudioModel, setLmStudioModel] = useState(config.lmStudioModel || 'local-model');
  const [customEndpoint, setCustomEndpoint] = useState(config.customEndpoint || 'http://127.0.0.1:11434/v1');
  const [customModel, setCustomModel] = useState(config.customModel || 'llama3.1');
  const [customApiKey, setCustomApiKey] = useState(config.customApiKey || '');
  const [temperature, setTemperature] = useState(config.temperature ?? 0.3);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<AIEngineTestResult | null>(null);

  const isCloudPreview = typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1';

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const testPayload = {
      provider: activeProvider,
      endpoint: 
        activeProvider === 'ollama' ? ollamaEndpoint :
        activeProvider === 'lmstudio' ? lmStudioEndpoint :
        activeProvider === 'custom' ? customEndpoint : undefined,
      model:
        activeProvider === 'ollama' ? ollamaModel :
        activeProvider === 'lmstudio' ? lmStudioModel :
        activeProvider === 'custom' ? customModel : undefined,
      apiKey: activeProvider === 'custom' ? customApiKey : undefined,
    };

    try {
      // First test via backend
      const res = await fetch('/api/test-engine-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });
      const data: AIEngineTestResult = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: '서버 통신 실패: ' + (err.message || '네트워크 오류'),
        guide: 'EcoSight 서버가 정상 구동 중인지 확인해 주세요.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const newConfig: AIEngineConfig = {
      provider: activeProvider,
      ollamaEndpoint,
      ollamaModel,
      lmStudioEndpoint,
      lmStudioModel,
      customEndpoint,
      customModel,
      customApiKey,
      temperature,
    };

    saveEngineConfig(newConfig);
    onSaveConfig(newConfig);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI Engine & Execution Mode</h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  자유 전환
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                로컬 AI(Ollama, LM Studio) 무제한 0원 구동부터 클라우드 무료 티어 및 차후 Pro 구독까지
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer shadow-sm group shrink-0"
            title="창 닫기 (ESC)"
            aria-label="닫기"
          >
            <span className="text-xs font-semibold group-hover:text-amber-300">닫기</span>
            <div className="w-5 h-5 rounded-md bg-slate-700/60 group-hover:bg-amber-500/20 flex items-center justify-center text-slate-300 group-hover:text-amber-300 transition">
              <X className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* Tier Architecture Roadmap Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-200 block">EcoSight 3단계 사고력 & 엔진 로드맵</span>
                <span className="text-[11px] text-slate-400">
                  <strong className="text-emerald-400">Tier 1 Explorer (₩0)</strong> · <strong className="text-amber-400">Tier 2 Strategist (₩9,900/월)</strong> · <strong className="text-purple-400">Tier 3 Decision Maker (₩29,000/월)</strong>
                </span>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-slate-300 font-mono border border-slate-700">
              현재 활성: {activeProvider.toUpperCase()}
            </div>
          </div>

          {/* Engine Selector Cards */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
              실행할 AI 엔진 선택
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Option 1: Gemini Cloud */}
              <div
                onClick={() => { setActiveProvider('gemini'); setTestResult(null); }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  activeProvider === 'gemini'
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Tier 2 Cloud
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-2">Google Gemini</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    기본 탑재 무료 티어. 별도 설치 없이 클라우드 고속 추론 및 4단계 다이어그램 즉시 생성.
                  </p>
                </div>
                <span className="text-[10px] text-amber-400 font-mono mt-2 block">
                  gemini-3.1-flash-lite
                </span>
              </div>

              {/* Option 2: Ollama Local */}
              <div
                onClick={() => { setActiveProvider('ollama'); setTestResult(null); }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  activeProvider === 'ollama'
                    ? 'bg-emerald-500/10 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      🦙
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Tier 1 로컬 0원
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-2">Ollama (Local)</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    내 PC 자원 활용. API 비용 0원, 무제한 토론 및 100% 개인 데이터 오프라인 보호.
                  </p>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono mt-2 block">
                  :11434 / llama3.1
                </span>
              </div>

              {/* Option 3: LM Studio Local */}
              <div
                onClick={() => { setActiveProvider('lmstudio'); setTestResult(null); }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  activeProvider === 'lmstudio'
                    ? 'bg-cyan-500/10 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Server className="w-3.5 h-3.5" />
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Tier 1 로컬 0원
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-2">LM Studio</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    GGUF 양자화 모델 구동. GUI 환경에서 모델을 다운로드하고 로컬 서버 포트로 연동.
                  </p>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono mt-2 block">
                  :1234 / local-model
                </span>
              </div>

              {/* Option 4: Custom / BYOK */}
              <div
                onClick={() => { setActiveProvider('custom'); setTestResult(null); }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  activeProvider === 'custom'
                    ? 'bg-purple-500/10 border-purple-500/60 shadow-md shadow-purple-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Sliders className="w-3.5 h-3.5" />
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      BYOK / 커스텀
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-2">Custom OpenAI</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    vLLM, Text-Gen, 개인 클라우드 또는 OpenAI 규격 엔드포인트 자유 연결.
                  </p>
                </div>
                <span className="text-[10px] text-purple-400 font-mono mt-2 block">
                  OpenAI 호환 규격
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Config Panels */}
          {activeProvider === 'gemini' && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-slate-200">Google Gemini Cloud 엔진 설정</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                현재 플랫폼 백엔드에 안전하게 연결되어 있으며, Google AI Studio의 무료 티어로 구동됩니다.
                EcoSight의 100년 금융 위기 데이터베이스와 프리즘 분석 4단계 프레임워크가 기본 최적화되어 있습니다.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">우선 추론 모델:</span>
                  <span className="font-mono text-amber-300 font-semibold mt-0.5 block">gemini-3.1-flash-lite</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">초고속 응답, 넉넉한 쿼터, 경제 인과 추론</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">자동 페일오버 체인:</span>
                  <span className="font-mono text-emerald-400 font-semibold mt-0.5 block">Flash-Latest → 3.8-Flash</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">서버 과부하 시 무중단 자동 전환</span>
                </div>
              </div>
            </div>
          )}

          {activeProvider === 'ollama' && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
              {isCloudPreview && (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5">
                  <span className="text-base shrink-0">☁️</span>
                  <div className="space-y-1 text-[11px] leading-relaxed">
                    <span className="font-semibold text-emerald-300 block">클라우드 프리뷰 환경 연결 안내:</span>
                    <p className="text-slate-300">
                      현재 웹앱은 클라우드 서버에서 동작 중이므로 내 PC의 <code className="text-emerald-300">127.0.0.1:11434</code>로 직접 통신할 수 없습니다.
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      • 즉시 사용: <strong>[Google Gemini (Cloud)]</strong>를 선택하시면 설정 없이 초고속 추론이 진행됩니다.<br />
                      • 로컬 모델 연결: <code className="text-emerald-400">ngrok http 11434</code> 등으로 생성한 공개 주소를 아래 엔드포인트에 입력해 주세요.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🦙</span>
                  <h4 className="text-xs font-bold text-slate-200">Ollama 로컬 설정 (API 비용 0원)</h4>
                </div>
                <a 
                  href="https://ollama.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                >
                  Ollama 공식 홈페이지 <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Endpoint URL */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Ollama 엔드포인트 URL:
                </label>
                <input
                  type="text"
                  value={ollamaEndpoint}
                  onChange={(e) => setOllamaEndpoint(e.target.value)}
                  placeholder="http://127.0.0.1:11434"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Model selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-400">
                    실행 모델명:
                  </label>
                  <span className="text-[10px] text-slate-500">추천 모델을 클릭하여 바로 선택하세요</span>
                </div>
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3.1 또는 qwen2.5"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none mb-2"
                />

                {/* Model Recommendation Cards with Explanations */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    추천 오픈소스 모델 및 특징:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {POPULAR_OLLAMA_MODELS.map((m) => {
                      const isSelected = ollamaModel === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setOllamaModel(m.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                            isSelected
                              ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-sm'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white font-mono">{m.name}</span>
                              <code className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono border border-slate-800">
                                {m.id}
                              </code>
                            </div>
                            {isSelected ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                선택됨
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 group-hover:text-slate-400">
                                클릭하여 적용
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">
                            {m.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Command Quick Guide */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] space-y-1 font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300 font-semibold">내 PC 터미널 실행 명령어:</span>
                </div>
                <div className="bg-slate-950 p-2 rounded text-emerald-300 select-all">
                  ollama run {ollamaModel || 'llama3.1'}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 브라우저 CORS 허용 시: <code className="text-slate-300">OLLAMA_ORIGINS=&quot;*&quot; ollama serve</code>
                </p>
              </div>
            </div>
          )}

          {activeProvider === 'lmstudio' && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
              {isCloudPreview && (
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2.5">
                  <span className="text-base shrink-0">☁️</span>
                  <div className="space-y-1 text-[11px] leading-relaxed">
                    <span className="font-semibold text-cyan-300 block">클라우드 프리뷰 환경 연결 안내:</span>
                    <p className="text-slate-300">
                      현재 웹앱은 클라우드 서버에서 동작 중이므로 내 PC의 <code className="text-cyan-300">127.0.0.1:1234</code>로 직접 통신할 수 없습니다.
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      • 즉시 사용: <strong>[Google Gemini (Cloud)]</strong>를 선택하시면 설정 없이 초고속 추론이 진행됩니다.<br />
                      • 로컬 모델 연결: <code className="text-cyan-400">ngrok http 1234</code> 등으로 생성한 공개 주소를 아래 엔드포인트에 입력해 주세요.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-200">LM Studio 로컬 설정 (API 비용 0원)</h4>
                </div>
                <a 
                  href="https://lmstudio.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                >
                  LM Studio 홈페이지 <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  LM Studio 로컬 서버 주소:
                </label>
                <input
                  type="text"
                  value={lmStudioEndpoint}
                  onChange={(e) => setLmStudioEndpoint(e.target.value)}
                  placeholder="http://127.0.0.1:1234"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  모델 식별자 (Model ID):
                </label>
                <input
                  type="text"
                  value={lmStudioModel}
                  onChange={(e) => setLmStudioModel(e.target.value)}
                  placeholder="local-model"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  LM Studio에서는 로드된 모델을 기본값 <code className="text-cyan-400">local-model</code>로 호출하면 자동으로 연결됩니다.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <span className="font-semibold text-cyan-300 block">💡 LM Studio 퀵 셋업 가이드:</span>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-400">
                  <li>LM Studio 실행 후 원하는 모델(예: Llama-3.1-8B-Instruct GGUF) 로드</li>
                  <li>좌측 탭에서 <strong>&lsquo;Developer / Local Server&rsquo;</strong> 선택</li>
                  <li><strong>&lsquo;Start Server&rsquo;</strong> 버튼 클릭 (포트 1234 기본)</li>
                </ol>
              </div>
            </div>
          )}

          {activeProvider === 'custom' && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-slate-200">Custom OpenAI 호환 엔드포인트 / BYOK</h4>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  API 엔드포인트 (Base URL):
                </label>
                <input
                  type="text"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="https://api.openai.com/v1 또는 http://localhost:8000/v1"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    모델명 (Model Name):
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="gpt-4o-mini 또는 llama3.1"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    API Key (필요시 입력):
                  </label>
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Temperature Slider */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-200 block">생성 창의성 (Temperature): {temperature}</span>
              <span className="text-[11px] text-slate-400">
                0.2~0.3: 엄격한 경제 메커니즘 &amp; 정확한 JSON 스키마 (권장)
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-32 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Test Result Box */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
              testResult.success
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  {testResult.success ? '연결 성공 (Ready to Analyze)' : '연결 실패 (Check Connection)'}
                </span>
                {testResult.latencyMs !== undefined && (
                  <span className="font-mono text-[11px] opacity-80">
                    지연시간: {testResult.latencyMs}ms
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed">{testResult.message}</p>
              {testResult.guide && (
                <div className="mt-2 p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
                  <strong className="text-amber-300 block mb-0.5">안내 및 해결 방법:</strong>
                  {testResult.guide}
                </div>
              )}
            </div>
          )}

          {/* Tier 3 Decision Maker Future Notice */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs text-purple-300/90 flex items-start gap-2.5">
            <DollarSign className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-200 block mb-0.5">차후 멤버십 확장: Tier 3 Decision Maker (월 29,000원 / 연 23,000원) 준비 안내</strong>
              <p className="text-[11px] leading-relaxed text-purple-300/80">
                헤지펀드 CIO급 심층 비판, Multi-Agent 대결 시뮬레이션(Bull vs Bear 자동 격돌), 정반합 종합 진단서 및 채점 PDF 출력 모듈을 제공하며, 
                상용화 전환 시 모듈러 결제 인터페이스를 통해 안전하게 활성화할 수 있도록 사전 설계되어 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>연결 상태 확인 중...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>연결 테스트</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition cursor-pointer flex items-center gap-1 border border-slate-800"
              title="창 닫기 (ESC)"
            >
              <X className="w-3.5 h-3.5" />
              <span>닫기 (ESC)</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              설정 저장 및 적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
