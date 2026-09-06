import React from 'react';
import { 
  Compass, 
  Layers, 
  Swords, 
  BookOpen, 
  ShieldAlert, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles,
  Scale,
  Cpu,
  Zap,
  Server,
  Terminal,
  CreditCard
} from 'lucide-react';
import { BiasBreakerStats, AIEngineConfig } from '../types';

interface HeaderProps {
  activeTab: 'prism' | 'contrast' | 'redteam' | 'knowledge' | 'bias';
  setActiveTab: (tab: 'prism' | 'contrast' | 'redteam' | 'knowledge' | 'bias') => void;
  biasStats: BiasBreakerStats;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
  savedItemCount: number;
  engineConfig: AIEngineConfig;
  onOpenEngineModal: () => void;
  onOpenTierModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  biasStats,
  onExportData,
  onImportData,
  onResetData,
  savedItemCount,
  engineConfig,
  onOpenEngineModal,
  onOpenTierModal,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const totalAnalyzed = biasStats.bullishCount + biasStats.bearishCount + biasStats.neutralCount;
  const bullPct = totalAnalyzed > 0 ? Math.round((biasStats.bullishCount / totalAnalyzed) * 100) : 50;

  const getProviderBadge = () => {
    switch (engineConfig.provider) {
      case 'ollama':
        return {
          icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Ollama (로컬 0원)',
          sub: engineConfig.ollamaModel || 'llama3.1',
          bgColor: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
        };
      case 'lmstudio':
        return {
          icon: <Server className="w-3.5 h-3.5 text-cyan-400" />,
          label: 'LM Studio (로컬 0원)',
          sub: engineConfig.lmStudioModel || 'local-model',
          bgColor: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300',
        };
      case 'custom':
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-purple-400" />,
          label: 'Custom OpenAI 규격',
          sub: engineConfig.customModel || 'custom',
          bgColor: 'bg-purple-950/40 border-purple-500/30 text-purple-300',
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Gemini Cloud',
          sub: '2.5 Flash',
          bgColor: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
        };
    }
  };

  const providerBadge = getProviderBadge();

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Logo & Philosophy */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                EcoSight <span className="text-amber-400 text-sm font-semibold">경제의 눈</span>
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                Flow Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              &ldquo;돈을 쫓지 말고, 돈이 흐르는 길을 보라&rdquo; — 확증 편향 없는 경제 학습 파트너
            </p>
          </div>
        </div>

        {/* Global Quick Stats, AI Engine Switcher & Tools */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
          {/* AI Engine Switcher Button */}
          <button
            id="header-engine-switch-btn"
            onClick={onOpenEngineModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition hover:brightness-110 shadow-sm ${providerBadge.bgColor}`}
            title="클릭하여 AI 엔진 전환 (Google Gemini Cloud ↔ Ollama / LM Studio 로컬 LLM)"
          >
            {providerBadge.icon}
            <div className="text-left leading-tight">
              <div className="font-semibold flex items-center gap-1.5">
                <span>{providerBadge.label}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              </div>
              <div className="text-[10px] opacity-75 font-mono">
                {providerBadge.sub}
              </div>
            </div>
          </button>

          {/* Subscription Tier / Monetization Button */}
          <button
            id="header-tier-plans-btn"
            onClick={onOpenTierModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-emerald-500/15 border border-amber-500/30 text-amber-300 hover:border-amber-400 text-xs font-semibold transition"
            title="티어 1 (로컬 무료) / 티어 2·3 차후 유료 결제 전환 로드맵"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>플랜 & 티어 2·3</span>
            <span className="px-1 py-0.2 text-[9px] rounded bg-amber-500/20 text-amber-300 uppercase font-mono">
              로드맵
            </span>
          </button>

          {/* Quick Bias Status */}
          <div 
            id="header-bias-pill"
            onClick={() => setActiveTab('bias')}
            className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            title="클릭하여 편식 방지 모니터 확인"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${bullPct > 70 || bullPct < 30 ? 'text-amber-400' : 'text-emerald-400'}`} />
            <div className="text-xs">
              <span className="text-slate-400">사고 성향: </span>
              <span className="font-semibold text-slate-200">
                낙관 {bullPct}% / 비관 {100 - bullPct}%
              </span>
            </div>
          </div>

          {/* Backup & Tools */}
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportData}
              accept=".json"
              className="hidden"
              id="file-import-input"
            />
            <button
              id="btn-import-data"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
              title="데이터 불러오기(JSON)"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              id="btn-export-data"
              onClick={onExportData}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
              title="데이터 백업 내보내기(JSON)"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              id="btn-reset-data"
              onClick={onResetData}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 transition"
              title="데이터 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <nav id="main-navigation" className="max-w-7xl mx-auto mt-3 flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 border-t border-slate-800/60 pt-2.5">
        <button
          id="nav-tab-prism"
          onClick={() => setActiveTab('prism')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'prism'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>The Prism Analysis <span className="text-[11px] opacity-75 font-normal">(프리즘 분석)</span></span>
        </button>

        <button
          id="nav-tab-contrast"
          onClick={() => setActiveTab('contrast')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'contrast'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Scale className="w-4 h-4 text-emerald-400" />
          <span>Bull vs Bear <span className="text-[11px] opacity-75 font-normal">(대조 학습)</span></span>
          <span className="px-1.5 py-0.2 text-[10px] rounded bg-amber-500/20 text-amber-300 font-mono">
            New
          </span>
        </button>

        <button
          id="nav-tab-redteam"
          onClick={() => setActiveTab('redteam')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'redteam'
              ? 'bg-red-500/15 text-red-300 border border-red-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Swords className="w-4 h-4 text-red-400" />
          <span>Red Team Chat <span className="text-[11px] opacity-75 font-normal">(레드팀 토론)</span></span>
        </button>

        <button
          id="nav-tab-knowledge"
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'knowledge'
              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>지식 & 연관자료 서고 <span className="text-[11px] opacity-75 font-normal">({savedItemCount})</span></span>
          <span className="px-1.5 py-0.2 text-[10px] rounded bg-blue-500/20 text-blue-300 font-mono">
            자동탐색
          </span>
        </button>

        <button
          id="nav-tab-bias"
          onClick={() => setActiveTab('bias')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'bias'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Bias Breaker <span className="text-[11px] opacity-75 font-normal">(편식 방지)</span></span>
        </button>
      </nav>
    </header>
  );
};
