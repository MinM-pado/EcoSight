import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  Flame, 
  FileText, 
  Share2, 
  BookmarkCheck, 
  Check, 
  Compass, 
  Layers, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  UploadCloud,
  AlertCircle,
  Scale
} from 'lucide-react';
import { PrismAnalysisResult } from '../types';
import { TOPIC_PRESETS, TopicPreset } from '../data/presets';
import { MacroIndicatorVerifier } from './MacroIndicatorVerifier';
import { getRelevantMacroIndicators, getRelevantSourceGroundings } from '../data/macroIndicators';

interface PrismAnalysisViewProps {
  currentAnalysis: PrismAnalysisResult | null;
  onRunAnalysis: (topic: string, text: string, sourceUrl?: string) => Promise<void>;
  isLoading: boolean;
  onSaveToKnowledge: (analysis: PrismAnalysisResult) => void;
  onStartRedTeam: (analysis: PrismAnalysisResult, initialQuestion?: string) => void;
  onNavigateToContrast?: (topic: string) => void;
  isSaved: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
}

export const PrismAnalysisView: React.FC<PrismAnalysisViewProps> = ({
  currentAnalysis,
  onRunAnalysis,
  isLoading,
  onSaveToKnowledge,
  onStartRedTeam,
  onNavigateToContrast,
  isSaved,
  errorMessage,
  onClearError,
}) => {
  const [topicInput, setTopicInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSelectPreset = (preset: TopicPreset) => {
    setTopicInput(preset.title);
    setTextInput(preset.sourceSnippet);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() && !textInput.trim()) return;
    onRunAnalysis(topicInput, textInput, urlInput);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTextInput(content);
      if (!topicInput) {
        setTopicInput(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  const handleCopyReport = () => {
    if (!currentAnalysis) return;
    const reportText = `[EcoSight 프리즘 분석 리포트]
■ 주제: ${currentAnalysis.headline}
■ 핵심 메커니즘: ${currentAnalysis.coreMechanism}
■ 거시 분류: ${currentAnalysis.macroCategory} | 성향: ${currentAnalysis.sentiment} | 범위: ${currentAnalysis.scope}

1. 파급 효과 (Ripple Effect)
- 1차 직접 효과: ${currentAnalysis.rippleEffect.level1Direct}
- 2차 전이 효과: ${currentAnalysis.rippleEffect.level2Transmission}
- 3차 도미노 효과: ${currentAnalysis.rippleEffect.level3Domino}

2. 악마의 대변인 (Devil's Advocate)
- 주류 견해: ${currentAnalysis.devilsAdvocate.consensusView}
- 반론 및 리스크: ${currentAnalysis.devilsAdvocate.contrarianRisk}

3. 거시적 맥락 (Structural View)
- 판정: ${currentAnalysis.structuralView.verdict} (${currentAnalysis.structuralView.timeHorizon})
- 핵심 요인: ${currentAnalysis.structuralView.structuralDrivers.join(', ')}

4. 역사적 거울 (Historical Mirror)
- 매칭 사건: ${currentAnalysis.historicalMirror.eventTitle} (${currentAnalysis.historicalMirror.period})
- 배울 교훈: ${currentAnalysis.historicalMirror.lessons}
`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="prism-analysis-view" className="space-y-6">
      {/* Input & Preset Section */}
      <section id="prism-input-section" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                The Prism Analysis <span className="text-xs font-normal text-slate-400">— 4가지 관점 자동 분해</span>
              </h2>
              <p className="text-xs text-slate-400">
                경제 뉴스, 이슈, 보고서 원문을 입력하면 돈의 흐름과 도미노 효과를 해부합니다.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">예시 주제:</span>
            {TOPIC_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className="px-2.5 py-1 text-xs rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 transition whitespace-nowrap"
              >
                {preset.title.slice(0, 16)}...
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="topic-input" className="block text-xs font-medium text-slate-300 mb-1">
              분석할 경제 주제 / 헤드라인 / 키워드 <span className="text-amber-400">*</span>
            </label>
            <input
              id="topic-input"
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="예: 미국 연준 50bp 빅컷 단행과 원/달러 환율 충격"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="text-input" className="text-xs font-medium text-slate-300">
                뉴스 본문 / 관련 텍스트 / 보고서 내용 (선택)
              </label>
              <label className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>텍스트/문서 파일 첨부</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".txt,.md,.json,.csv"
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              id="text-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={3}
              placeholder="분석하고 싶은 기사 원문이나 문맥 메모를 붙여넣으세요. 입력하지 않아도 주제 키워드로 전문 심층 분석이 진행됩니다."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition resize-y"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="w-full sm:w-1/2">
              <input
                id="url-input"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="출처 URL 링크 (선택)"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600"
              />
            </div>

            <button
              id="btn-run-prism"
              type="submit"
              disabled={isLoading || (!topicInput.trim() && !textInput.trim())}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-sm shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>프리즘 4원소 분해 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>프리즘 분석 실행</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start justify-between gap-3 text-red-200 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300 mb-0.5">분석 요청 안내</p>
                <p className="text-red-300/80 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => handleSubmit(e)}
                className="px-3 py-1 rounded-lg bg-red-800/60 hover:bg-red-700/80 text-white font-medium transition cursor-pointer"
              >
                다시 시도
              </button>
              {onClearError && (
                <button
                  type="button"
                  onClick={onClearError}
                  className="text-red-400 hover:text-red-200 p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Analysis Result Card Container */}
      {currentAnalysis && (
        <section id="prism-result-container" className="space-y-6">
          {/* 1. Core Summary Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 relative overflow-hidden shadow-xl">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                  {currentAnalysis.macroCategory}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  currentAnalysis.sentiment === 'Bullish'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : currentAnalysis.sentiment === 'Bearish'
                    ? 'bg-red-500/15 text-red-300 border-red-500/30'
                    : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                }`}>
                  {currentAnalysis.sentiment === 'Bullish' ? '상승/낙관적 (Bullish)' : currentAnalysis.sentiment === 'Bearish' ? '하방/경계 (Bearish)' : '복합/중립적 (Complex)'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
                  {currentAnalysis.scope}
                </span>
                {currentAnalysis.isFallback && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-xs border border-amber-500/30 flex items-center gap-1" title="Gemini AI 트래픽 급증 시 백업 분석 엔진으로 안전하게 분석되었습니다.">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>백업 분석 엔진 가동</span>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {onNavigateToContrast && (
                  <button
                    id="btn-goto-contrast"
                    onClick={() => onNavigateToContrast(currentAnalysis.headline)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="이 주제의 강세론(Bull)과 약세론(Bear)을 1:1 대조 학습합니다."
                  >
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bull vs Bear 대조 학습</span>
                  </button>
                )}
                <button
                  id="btn-copy-report"
                  onClick={handleCopyReport}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                  title="분석 리포트 텍스트 복사"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? '복사 완료' : '리포트 복사'}</span>
                </button>
                <button
                  id="btn-save-knowledge"
                  onClick={() => onSaveToKnowledge(currentAnalysis)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>{isSaved ? '지식 서고 저장됨' : '지식 서고에 보관'}</span>
                </button>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3">
              {currentAnalysis.headline}
            </h3>

            {/* Core Mechanism Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-amber-400">
                <Compass className="w-4 h-4" />
                <span>핵심 자본 흐름 메커니즘 (Money Flow Core)</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {currentAnalysis.coreMechanism}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">영향 섹터:</span>
                <div className="flex flex-wrap gap-1">
                  {currentAnalysis.affectedSectors.map((sector, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">주요 대상국:</span>
                <div className="flex flex-wrap gap-1">
                  {currentAnalysis.geographicFocus.map((geo, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {geo}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* F07. Real-Time Macro Indicators & Grounding Verifier */}
          <MacroIndicatorVerifier
            indicators={currentAnalysis.macroIndicators?.length ? currentAnalysis.macroIndicators : getRelevantMacroIndicators(currentAnalysis.headline)}
            sourceGroundings={currentAnalysis.sourceGroundings?.length ? currentAnalysis.sourceGroundings : getRelevantSourceGroundings(currentAnalysis.headline)}
            topicTitle={currentAnalysis.headline}
            defaultExpanded={true}
          />

          {/* 2. Sub-Component: Ripple Effect (1차/2차/3차 도미노 효과 시각화) */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    Ripple Effect <span className="text-xs font-normal text-slate-400">— 파급 효과 (Why It Matters)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    1차 직접 충격을 넘어 2차 전이 경로와 3차 도미노(나비효과)를 시각화합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Domino Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              {/* Level 1 Node */}
              <div className="rounded-xl bg-slate-950 border border-blue-900/40 p-4 relative overflow-hidden flex flex-col justify-between group hover:border-blue-500/60 transition">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold text-[11px]">
                      1차 직접 효과
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">Direct Impact</span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-100 mb-2">
                    {currentAnalysis.rippleEffect.nodes[0]?.title || '직접 시장 반응'}
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentAnalysis.rippleEffect.nodes[0]?.description || currentAnalysis.rippleEffect.level1Direct}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>지표 직접 변동</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                </div>
              </div>

              {/* Level 2 Node */}
              <div className="rounded-xl bg-slate-950 border border-indigo-900/40 p-4 relative overflow-hidden flex flex-col justify-between group hover:border-indigo-500/60 transition">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-semibold text-[11px]">
                      2차 전이 효과
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">Transmission</span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-100 mb-2">
                    {currentAnalysis.rippleEffect.nodes[1]?.title || '환율·공급망 전이'}
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentAnalysis.rippleEffect.nodes[1]?.description || currentAnalysis.rippleEffect.level2Transmission}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>비용 및 실물 파급</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                </div>
              </div>

              {/* Level 3 Node */}
              <div className="rounded-xl bg-slate-950 border border-amber-900/40 p-4 relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/60 transition">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold text-[11px]">
                      3차 도미노 효과
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">Domino & Butterfly</span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-100 mb-2">
                    {currentAnalysis.rippleEffect.nodes[2]?.title || '의도치 않은 나비효과'}
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentAnalysis.rippleEffect.nodes[2]?.description || currentAnalysis.rippleEffect.level3Domino}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>자산 왜곡 & 부작용</span>
                  <span className="text-amber-400 font-semibold">최종 착지점</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Sub-Component: Devil's Advocate & Structural View (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Devil's Advocate */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      Devil&apos;s Advocate <span className="text-xs font-normal text-slate-400">— 반론 제기</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      주류 의견과 정반대되는 리스크 요인 및 데이터
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      주류(Consensus) 의견
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentAnalysis.devilsAdvocate.consensusView}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>악마의 반론 & 숨은 리스크 (Contrarian Risk)</span>
                    </div>
                    <p className="text-xs text-red-200/90 leading-relaxed">
                      {currentAnalysis.devilsAdvocate.contrarianRisk}
                    </p>
                  </div>
                </div>

                {/* Socratic Questions */}
                <div>
                  <h5 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>불편한 소크라테스식 반박 질문</span>
                  </h5>
                  <div className="space-y-2">
                    {currentAnalysis.devilsAdvocate.uncomfortableQuestions.map((q, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start justify-between gap-2 group hover:border-slate-700"
                      >
                        <span className="flex-1 leading-relaxed">&ldquo;{q}&rdquo;</span>
                        <button
                          onClick={() => onStartRedTeam(currentAnalysis, q)}
                          className="text-[11px] px-2 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 whitespace-nowrap transition"
                          title="이 질문으로 레드팀 토론 시작"
                        >
                          토론하기
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>핵심 감시 지표: {currentAnalysis.devilsAdvocate.riskIndicators.join(', ')}</span>
              </div>
            </div>

            {/* Structural View */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      Structural View <span className="text-xs font-normal text-slate-400">— 거시적 맥락</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      일시적 단기 소음인지 구조적 추세인지 판정
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">EcoSight 진단 결과</span>
                    <span className={`text-base font-bold ${
                      currentAnalysis.structuralView.verdict.includes('구조적')
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}>
                      {currentAnalysis.structuralView.verdict}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block mb-1">예상 시계열</span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-xs text-slate-200 font-mono">
                      {currentAnalysis.structuralView.timeHorizon}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 mb-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentAnalysis.structuralView.explanation}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-slate-300 mb-2">
                    주요 구조적 추동 동인 (Secular Drivers)
                  </h5>
                  <ul className="space-y-1.5">
                    {currentAnalysis.structuralView.structuralDrivers.map((driver, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                <span>&ldquo;가격은 소음이지만 가치와 추세는 인구와 생산성이 결정한다&rdquo;</span>
              </div>
            </div>
          </div>

          {/* 4. Sub-Component: Historical Mirror (역사적 거울 - F02) */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 border border-amber-900/30 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  04
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    Historical Mirror <span className="text-xs font-normal text-amber-400/80">— 역사적 거울 (과거 100년 비교)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    현재 이슈와 유사한 과거 100년 금융 사건을 매칭하여 패턴과 교훈을 추출합니다.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                {currentAnalysis.historicalMirror.period}
              </span>
            </div>

            <div className="mb-4">
              <h5 className="text-lg font-bold text-amber-300 mb-1">
                {currentAnalysis.historicalMirror.eventTitle}
              </h5>
              <p className="text-xs text-slate-400">
                발발 배경: {currentAnalysis.historicalMirror.trigger}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Similarities */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
                <span className="text-xs font-semibold text-emerald-400 block mb-2">
                  공통점 (반복되는 패턴)
                </span>
                <ul className="space-y-2">
                  {currentAnalysis.historicalMirror.similarities.map((item, i) => (
                    <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Differences */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
                <span className="text-xs font-semibold text-amber-400 block mb-2">
                  차이점 (당시와 다른 변수)
                </span>
                <ul className="space-y-2">
                  {currentAnalysis.historicalMirror.differences.map((item, i) => (
                    <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Lessons */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-xs font-bold text-amber-300 block mb-1">
                역사의 결말을 통해 배울 점 (The Lesson)
              </span>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                {currentAnalysis.historicalMirror.lessons}
              </p>
            </div>

            {/* Action to Red Team */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                이 분석 결과를 바탕으로 자신의 투자 가설(Thesis)을 수립하고 레드팀의 반박을 받아보세요.
              </p>
              <button
                id="btn-goto-redteam-with-analysis"
                onClick={() => onStartRedTeam(currentAnalysis)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition"
              >
                <span>내 가설 세우고 레드팀 토론하기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
