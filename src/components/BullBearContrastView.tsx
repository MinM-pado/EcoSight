import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  BookMarked, 
  Swords, 
  RefreshCw,
  Search,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { BullBearComparisonResult, PrismAnalysisResult } from '../types';
import { MacroIndicatorVerifier } from './MacroIndicatorVerifier';
import { getRelevantMacroIndicators, getRelevantSourceGroundings } from '../data/macroIndicators';

interface BullBearContrastViewProps {
  currentContrast: BullBearComparisonResult | null;
  onRunContrast: (topic: string, context?: string) => void;
  isLoading: boolean;
  onSaveToKnowledge: (result: BullBearComparisonResult) => void;
  onStartRedTeamWithThesis: (topic: string, thesis: string) => void;
  onJumpToPrism: (topic: string) => void;
  currentPrismTopic?: string;
  isSaved?: boolean;
}

const PRESET_TOPICS = [
  { label: '기준금리 인하와 유동성', topic: '미국 연준 기준금리 인하와 글로벌 유동성 재편' },
  { label: '빅테크 AI 투자 버블론', topic: '빅테크 AI 인프라 CAPEX와 밸류에이션 버블 논쟁' },
  { label: '중국 부양책과 디플레이션', topic: '중국 경기 부양책과 부동산 디플레이션 위기' },
  { label: '비트코인과 글로벌 화폐', topic: '비트코인 현물 ETF 제도권 편입과 가치저장 수단 논쟁' },
  { label: '원자재와 관세 인플레이션', topic: '미국 보호무역 고율 관세와 글로벌 원자재 공급망 분절' }
];

export const BullBearContrastView: React.FC<BullBearContrastViewProps> = ({
  currentContrast,
  onRunContrast,
  isLoading,
  onSaveToKnowledge,
  onStartRedTeamWithThesis,
  onJumpToPrism,
  currentPrismTopic,
  isSaved = false,
}) => {
  const [inputTopic, setInputTopic] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'both' | 'bull' | 'bear'>('both');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTopic.trim()) return;
    onRunContrast(inputTopic.trim());
  };

  const handleSelectPreset = (topic: string) => {
    setInputTopic(topic);
    setSelectedPreset(topic);
    onRunContrast(topic);
  };

  return (
    <div id="bull-bear-contrast-view" className="space-y-6">
      {/* Top Banner & Introduction */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-rose-500/20 border border-slate-700/60 flex items-center justify-center text-amber-400 shadow-lg">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Bull vs Bear 대조 학습
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                  Dialectic Contrast
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                확증 편향을 깨뜨리기 위해 동일한 뉴스에 대한 <strong className="text-emerald-300 font-semibold">극단의 강세론(Bull)</strong>과 <strong className="text-rose-300 font-semibold">날카로운 약세론(Bear)</strong>을 의도적으로 1:1 대조합니다.
              </p>
            </div>
          </div>

          {currentPrismTopic && currentPrismTopic !== currentContrast?.topic && (
            <button
              id="btn-sync-prism-topic"
              onClick={() => {
                setInputTopic(currentPrismTopic);
                onRunContrast(currentPrismTopic);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title="현재 프리즘 분석에서 분석 중인 주제를 즉시 대조 분석합니다."
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>현재 분석 주제 대조하기: <span className="font-semibold text-white truncate max-w-[150px] inline-block align-bottom">{currentPrismTopic}</span></span>
            </button>
          )}
        </div>

        {/* Topic Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-contrast-topic"
                type="text"
                value={inputTopic}
                onChange={(e) => setInputTopic(e.target.value)}
                placeholder="비교 분석하고 싶은 뉴스 주제나 경제 화두를 입력하세요 (예: 미국 기준금리 인하, 엔비디아 실적, 금값 신고가)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <button
              id="btn-run-contrast"
              type="submit"
              disabled={isLoading || !inputTopic.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>대조 추론 중...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  <span>강세 vs 약세 대조 분석</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> 추천 대조 주제:
            </span>
            {PRESET_TOPICS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelectPreset(preset.topic)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  selectedPreset === preset.topic
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* Loading State Skeleton */}
      {isLoading && (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-400 animate-pulse">
            <Scale className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-200">
              AI 헤지펀드 매크로 데스크가 양 진영의 논리를 대칭 분석하고 있습니다
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              낙관론자의 상승 동력과 비관론자의 하방 뇌관, 자본 이동 벡터 및 쟁점을 입체적으로 도출 중입니다...
            </p>
          </div>
        </div>
      )}

      {/* Main Contrast Result */}
      {!isLoading && currentContrast && (
        <div id="contrast-content-wrapper" className="space-y-6">
          {/* Topic Overview Banner */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-400">대조 분석 주제</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {new Date(currentContrast.timestamp).toLocaleDateString('ko-KR')}
                </span>
                {currentContrast.isFallback && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    백업 매크로 엔진
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {currentContrast.topic}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                {currentContrast.overview}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                id="btn-save-contrast-knowledge"
                onClick={() => onSaveToKnowledge(currentContrast)}
                disabled={isSaved}
                className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-default'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>{isSaved ? '서고에 보관됨' : '지식 서고에 저장'}</span>
              </button>
              <button
                id="btn-jump-to-prism"
                onClick={() => onJumpToPrism(currentContrast.topic)}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition cursor-pointer"
                title="이 주제를 프리즘 4원소 및 100년 금융사 거울 분석으로 이동"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>프리즘 심층 해부</span>
              </button>
            </div>
          </div>

          {/* F07: Real-time Macro Indicator & Source Grounding Verification */}
          <MacroIndicatorVerifier
            indicators={currentContrast.macroIndicators?.length ? currentContrast.macroIndicators : getRelevantMacroIndicators(currentContrast.topic)}
            sourceGroundings={currentContrast.sourceGroundings?.length ? currentContrast.sourceGroundings : getRelevantSourceGroundings(currentContrast.topic)}
            topicTitle={currentContrast.topic}
            defaultExpanded={true}
          />

          {/* Responsive Layout Breakpoint Switcher (Mobile Tab / Desktop Dual View) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Scale className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold text-white">대조 뷰 모드 설정:</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                화면 크기에 따라 탭 전환 또는 상하/병렬로 자유롭게 비교할 수 있습니다.
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode('both')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  viewMode === 'both'
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="강세론과 약세론을 모두 표시합니다"
              >
                <span>양방향 종합 비교</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('bull')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  viewMode === 'bull'
                    ? 'bg-emerald-950/80 text-emerald-300 shadow-sm border border-emerald-700/60'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
                title="강세론(Bull) 카드만 집중 표시합니다"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>강세론만</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('bear')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  viewMode === 'bear'
                    ? 'bg-rose-950/80 text-rose-300 shadow-sm border border-rose-700/60'
                    : 'text-slate-400 hover:text-rose-300'
                }`}
                title="약세론(Bear) 카드만 집중 표시합니다"
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>약세론만</span>
              </button>
            </div>
          </div>

          {/* Responsive Contrast Grid: 1-col on mobile/tablet or single-tab, 2-col on lg screen */}
          <div className={`grid gap-6 min-w-0 w-full ${
            viewMode === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-3xl mx-auto'
          }`}>
            {/* Left: Bullish (황소 / 강세론) */}
            {(viewMode === 'both' || viewMode === 'bull') && (
              <div 
                id="card-bullish-perspective"
                className="rounded-2xl bg-gradient-to-b from-emerald-950/30 via-slate-900/90 to-slate-900 p-4 sm:p-6 border border-emerald-800/50 shadow-xl space-y-5 flex flex-col justify-between relative overflow-hidden min-w-0 w-full"
              >
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-4 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-900/50 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block truncate">
                          THE BULLISH SCENARIO
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-white truncate">
                          강세론 (황소 진영 관점)
                        </h4>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 shrink-0">
                      성장 & 팽창
                    </span>
                  </div>

                  {/* Core Thesis */}
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-1 min-w-0">
                    <span className="text-[11px] font-semibold text-emerald-300 uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> 핵심 상승 가설
                    </span>
                    <p className="text-sm text-slate-100 leading-relaxed font-medium break-words">
                      &ldquo;{currentContrast.bullish.thesis}&rdquo;
                    </p>
                  </div>

                  {/* Catalysts */}
                  <div className="space-y-2 min-w-0">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      상승을 정당화하는 3대 핵심 촉매
                    </span>
                    <ul className="space-y-2 min-w-0">
                      {currentContrast.bullish.catalysts.map((cat, idx) => (
                        <li 
                          key={idx}
                          className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed flex items-start gap-2 min-w-0"
                        >
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono">
                            {idx + 1}
                          </span>
                          <span className="break-words min-w-0 flex-1">{cat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Capital Flow */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 min-w-0">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 shrink-0" /> 자본 이동 벡터 (Capital Flow)
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed break-words">
                      {currentContrast.bullish.capitalFlow}
                    </p>
                  </div>

                  {/* Beneficiary Assets */}
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-xs font-semibold text-slate-400">
                      수혜 자산 및 섹터:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentContrast.bullish.favoredAssets.map((asset, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs bg-emerald-950/60 text-emerald-200 border border-emerald-700/50 font-medium break-words"
                        >
                          {asset}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Leading Indicators */}
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-xs font-semibold text-slate-400">
                      강세론자가 주목하는 선행 지표:
                    </span>
                    <div className="space-y-1">
                      {currentContrast.bullish.keyIndicators.map((ind, idx) => (
                        <div key={idx} className="text-xs text-slate-300 flex items-center gap-1.5 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <span className="break-words min-w-0">{ind}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Potential Outlook */}
                  <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/40 text-xs text-emerald-300 break-words">
                    <strong className="text-emerald-200">업사이드 기대 전망: </strong>
                    {currentContrast.bullish.potentialOutlook}
                  </div>
                </div>

                {/* Action */}
                <div className="pt-3 border-t border-emerald-900/40 mt-4">
                  <button
                    id="btn-redteam-bullish"
                    onClick={() => onStartRedTeamWithThesis(currentContrast.topic, currentContrast.bullish.thesis)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 border border-emerald-700/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Swords className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>이 강세론 가설로 레드팀 공격받기</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* Right: Bearish (곰 / 약세론) */}
            {(viewMode === 'both' || viewMode === 'bear') && (
              <div 
                id="card-bearish-perspective"
                className="rounded-2xl bg-gradient-to-b from-rose-950/30 via-slate-900/90 to-slate-900 p-4 sm:p-6 border border-rose-800/50 shadow-xl space-y-5 flex flex-col justify-between relative overflow-hidden min-w-0 w-full"
              >
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-4 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-rose-900/50 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                        <TrendingDown className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block truncate">
                          THE BEARISH SCENARIO
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-white truncate">
                          약세론 (곰 진영 관점)
                        </h4>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30 shrink-0">
                      리스크 & 수축
                    </span>
                  </div>

                  {/* Core Thesis */}
                  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 space-y-1 min-w-0">
                    <span className="text-[11px] font-semibold text-rose-300 uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> 핵심 하방 가설
                    </span>
                    <p className="text-sm text-slate-100 leading-relaxed font-medium break-words">
                      &ldquo;{currentContrast.bearish.thesis}&rdquo;
                    </p>
                  </div>

                  {/* Catalysts (Downside Risks) */}
                  <div className="space-y-2 min-w-0">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      하락을 촉발할 3대 핵심 위험 뇌관
                    </span>
                    <ul className="space-y-2 min-w-0">
                      {currentContrast.bearish.catalysts.map((cat, idx) => (
                        <li 
                          key={idx}
                          className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed flex items-start gap-2 min-w-0"
                        >
                          <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono">
                            {idx + 1}
                          </span>
                          <span className="break-words min-w-0 flex-1">{cat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Capital Flow */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 min-w-0">
                    <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 shrink-0" /> 자본 유출 및 피신 경로 (Contagion)
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed break-words">
                      {currentContrast.bearish.capitalFlow}
                    </p>
                  </div>

                  {/* Vulnerable Assets */}
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-xs font-semibold text-slate-400">
                      방어 수혜 자산 또는 위험 노출 자산:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentContrast.bearish.favoredAssets.map((asset, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs bg-rose-950/60 text-rose-200 border border-rose-700/50 font-medium break-words"
                        >
                          {asset}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Risk Indicators */}
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-xs font-semibold text-slate-400">
                      약세론자가 경고하는 위험 신호:
                    </span>
                    <div className="space-y-1">
                      {currentContrast.bearish.keyIndicators.map((ind, idx) => (
                        <div key={idx} className="text-xs text-slate-300 flex items-center gap-1.5 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                          <span className="break-words min-w-0">{ind}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Potential Outlook */}
                  <div className="p-3 rounded-lg bg-rose-900/20 border border-rose-800/40 text-xs text-rose-300 break-words">
                    <strong className="text-rose-200">다운사이드 위험 전망: </strong>
                    {currentContrast.bearish.potentialOutlook}
                  </div>
                </div>

                {/* Action */}
                <div className="pt-3 border-t border-rose-900/40 mt-4">
                  <button
                    id="btn-redteam-bearish"
                    onClick={() => onStartRedTeamWithThesis(currentContrast.topic, currentContrast.bearish.thesis)}
                    className="w-full py-2 px-3 rounded-xl bg-rose-900/40 hover:bg-rose-800/50 text-rose-300 border border-rose-700/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Swords className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>이 약세론 가설로 레드팀 공격받기</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom: Dialectic Synthesis & Pivot Triggers */}
          <div 
            id="card-dialectic-synthesis"
            className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-800/40 shadow-xl space-y-5"
          >
            <div className="flex items-center gap-2.5 pb-2 border-b border-indigo-900/40">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  대조 학습 종합: 정반합(Synthesis) 매트릭스
                </h4>
                <p className="text-xs text-indigo-300/80">
                  어느 한쪽에 휩쓸리지 않고 시장의 승패를 결정지을 핵심 쟁점과 분기점을 해독합니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Core Controversy */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-900/40 space-y-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> 정면 충돌 본질 쟁점 (Core Controversy)
                </span>
                <p className="text-sm font-medium text-slate-100 leading-relaxed">
                  &ldquo;{currentContrast.coreControversy}&rdquo;
                </p>
              </div>

              {/* Decisive Pivot Triggers */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-900/40 space-y-2">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> 승패를 가를 결정적 분기 트리거 (Triggers to Watch)
                </span>
                <ul className="space-y-1.5">
                  {currentContrast.pivotTriggers.map((trig, idx) => (
                    <li key={idx} className="text-xs text-slate-200 flex items-start gap-1.5">
                      <span className="text-indigo-400 font-bold mt-0.5">•</span>
                      <span>{trig}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Strategic Dialectic Takeaway */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-1.5">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" /> 학습자를 위한 입체적 전략적 시사점
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {currentContrast.dialecticTakeaway}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
