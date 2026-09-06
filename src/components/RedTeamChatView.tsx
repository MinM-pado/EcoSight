import React, { useState, useRef, useEffect } from 'react';
import { 
  Swords, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Award, 
  AlertOctagon, 
  CheckCircle2, 
  RotateCcw, 
  BookmarkCheck, 
  Share2,
  HelpCircle,
  TrendingDown,
  FileCheck,
  GraduationCap,
  Scale,
  Flame,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { RedTeamSession, RedTeamMessage, PrismAnalysisResult, SocraticLevel } from '../types';
import { MacroIndicatorVerifier } from './MacroIndicatorVerifier';
import { getRelevantMacroIndicators, getRelevantSourceGroundings } from '../data/macroIndicators';

interface RedTeamChatViewProps {
  currentSession: RedTeamSession;
  onSendMessage: (userText: string) => Promise<void>;
  onEvaluateThesis: () => Promise<void>;
  onResetSession: () => void;
  onSaveSessionToKnowledge: (session: RedTeamSession) => void;
  isEvaluating: boolean;
  isSending: boolean;
  currentAnalysis: PrismAnalysisResult | null;
  socraticLevel?: SocraticLevel;
  onChangeSocraticLevel?: (level: SocraticLevel) => void;
}

export const RedTeamChatView: React.FC<RedTeamChatViewProps> = ({
  currentSession,
  onSendMessage,
  onEvaluateThesis,
  onResetSession,
  onSaveSessionToKnowledge,
  isEvaluating,
  isSending,
  currentAnalysis,
  socraticLevel = 'standard',
  onChangeSocraticLevel,
}) => {
  const [inputText, setInputText] = useState('');
  const [thesisDraft, setThesisDraft] = useState(currentSession.userThesis || '');
  const [showMacroVerifier, setShowMacroVerifier] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession.messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const text = inputText;
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent triggering submit during CJK / Korean IME composition
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartWithThesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thesisDraft.trim() || isSending) return;
    onSendMessage(thesisDraft);
  };

  const hasStarted = currentSession.messages.length > 0;
  const currentLevel = currentSession.socraticLevel || socraticLevel || 'standard';

  // Get relevant macro indicators for topic
  const topicTitle = currentSession.topic || currentAnalysis?.headline || '거시 경제 토론';
  const indicators = currentAnalysis?.macroIndicators?.length 
    ? currentAnalysis.macroIndicators 
    : getRelevantMacroIndicators(topicTitle);
  const sourceGroundings = currentAnalysis?.sourceGroundings?.length 
    ? currentAnalysis.sourceGroundings 
    : getRelevantSourceGroundings(topicTitle);

  return (
    <div id="redteam-chat-view" className="space-y-6">
      {/* Top Description Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-900/40 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Red Team Chat <span className="text-xs font-normal text-red-400">— 소크라테스식 반론 토론</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                F06 수위 조절 탑재
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              투자자의 확증 편향을 깨뜨리기 위해 당신의 논리에 끊임없이 &ldquo;왜?&rdquo;를 묻고 반박하는 AI 레드팀 파트너입니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={() => setShowMacroVerifier(!showMacroVerifier)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              showMacroVerifier 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="토론에 참고할 거시 지표 및 출처 검증 패널 토글"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>거시 지표 검증 {showMacroVerifier ? '닫기' : '열기'}</span>
          </button>

          {hasStarted && (
            <>
              <button
                id="btn-evaluate-thesis"
                onClick={onEvaluateThesis}
                disabled={isEvaluating || currentSession.messages.length < 2}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>논리 채점 중...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5" />
                    <span>토론 채점 & 리포트 발행</span>
                  </>
                )}
              </button>

              <button
                id="btn-save-redteam-knowledge"
                onClick={() => onSaveSessionToKnowledge(currentSession)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                title="토론 내역을 지식 서고에 보관"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>서고 보관</span>
              </button>

              <button
                id="btn-reset-redteam"
                onClick={onResetSession}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
                title="새 토론 시작"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* F06: Socratic Level Controller (수위 조절 바) */}
      <div id="socratic-level-controller" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-red-400" />
              소크라테스 반론 강도 제어 (Socratic Level)
            </span>
            <span className="text-[11px] text-slate-400 hidden md:inline">
              학습자의 수준에 맞춰 AI 레드팀의 질문 수위와 공격성을 즉시 전환합니다.
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            현재 모드: <strong className="text-white capitalize">{currentLevel}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Level 1: Guided */}
          <button
            id="btn-socratic-guided"
            onClick={() => onChangeSocraticLevel && onChangeSocraticLevel('guided')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              currentLevel === 'guided'
                ? 'bg-blue-950/40 border-blue-500/60 shadow-md ring-1 ring-blue-500/30'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  입문자 (Guided Mode)
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  난이도: 1단계
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                친절한 힌트와 기초 개념 멘토링. 비전공자도 알기 쉬운 일상 속 비유로 논리적 허점을 부드럽게 짚어줍니다.
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span>온화한 소크라테스식 문답</span>
              {currentLevel === 'guided' && <span className="text-blue-400 font-bold">적용 중 ✓</span>}
            </div>
          </button>

          {/* Level 2: Standard */}
          <button
            id="btn-socratic-standard"
            onClick={() => onChangeSocraticLevel && onChangeSocraticLevel('standard')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              currentLevel === 'standard'
                ? 'bg-amber-950/30 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" />
                  중급자 (Standard Mode)
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  난이도: 2단계
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                데이터 중심의 객관적 리스크 조명. 실제 거시 지표 추이와 역사적 선례를 바탕으로 균형 잡힌 반론을 제시합니다.
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span>균형 잡힌 애널리스트 톤</span>
              {currentLevel === 'standard' && <span className="text-amber-400 font-bold">적용 중 ✓</span>}
            </div>
          </button>

          {/* Level 3: Expert / Devil's Advocate */}
          <button
            id="btn-socratic-expert"
            onClick={() => onChangeSocraticLevel && onChangeSocraticLevel('expert')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              currentLevel === 'expert'
                ? 'bg-red-950/40 border-red-500/60 shadow-md ring-1 ring-red-500/30'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-400" />
                  전문가 (Devil&apos;s Advocate)
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                  난이도: 3단계
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                헤지펀드 CIO의 집요한 맹점 정밀 타격. 선반영 리스크, 테일 리스크, 역마진 시나리오를 정면으로 추궁합니다.
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span>공격적 악마의 대변인</span>
              {currentLevel === 'expert' && <span className="text-red-400 font-bold">적용 중 ✓</span>}
            </div>
          </button>
        </div>
      </div>

      {/* Embedded Macro Indicator Verifier (Collapsible or Toggled) */}
      {showMacroVerifier && (
        <MacroIndicatorVerifier
          indicators={indicators}
          sourceGroundings={sourceGroundings}
          topicTitle={topicTitle}
          defaultExpanded={true}
        />
      )}

      {/* Main Chat Interface */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col h-[680px] shadow-xl overflow-hidden">
        {/* Topic Context Indicator */}
        <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <span className="text-slate-500 font-mono">TOPIC:</span>
            <span className="font-medium text-slate-200 truncate">
              {currentSession.topic || (currentAnalysis ? currentAnalysis.headline : '자유 경제 논제')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${
              currentLevel === 'guided' 
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                : currentLevel === 'expert'
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {currentLevel === 'guided' ? 'Guided (입문)' : currentLevel === 'expert' ? "Devil's Advocate (전문가)" : 'Standard (중급)'}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Socratic Active
            </span>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {!hasStarted ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                <Swords className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  당신의 경제 견해(Thesis)를 제시하십시오
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  &ldquo;금리 인하로 부동산이 폭등할 것이다&rdquo;, &ldquo;AI 반도체 수요는 과잉 설비다&rdquo; 등 당신의 가설을 작성하면, AI 레드팀이 즉시 허점과 반론을 공격합니다.
                </p>
              </div>

              {/* Thesis Form */}
              <form onSubmit={handleStartWithThesis} className="w-full space-y-3">
                <textarea
                  value={thesisDraft}
                  onChange={(e) => setThesisDraft(e.target.value)}
                  placeholder="예: 미국 연준이 금리를 내려도 고용 둔화와 기업 실적 둔화로 인해 증시는 일시 반등 후 하락할 것으로 봅니다. 신흥국으로의 자금 이동도 제한적일 것입니다."
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition resize-none"
                />
                <button
                  type="submit"
                  disabled={!thesisDraft.trim() || isSending}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-red-950 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  <span>[{currentLevel.toUpperCase()}] 레드팀과 토론 개시하기</span>
                </button>
              </form>
            </div>
          ) : (
            <>
              {currentSession.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-slate-800 text-slate-100 border border-slate-700'
                        : 'bg-red-950/30 text-slate-200 border border-red-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold opacity-75">
                      {msg.role === 'user' ? (
                        <span className="text-slate-400">사용자 가설 (Thesis)</span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1">
                          <Swords className="w-3 h-3" />
                          <span>AI 레드팀 반론 (Antithesis)</span>
                        </span>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className="text-[10px] text-slate-500 mt-2 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-red-950/30 border border-red-900/40 rounded-2xl p-4 text-xs text-red-300 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>[{currentLevel.toUpperCase()}] 레드팀이 당신의 논리적 맹점을 분석하여 반박하는 중...</span>
                  </div>
                </div>
              )}

              {/* Evaluation Critique Result if present */}
              {currentSession.critiqueSummary && (
                <div id="redteam-critique-card" className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-red-950/40 via-slate-950 to-slate-950 border border-red-800/60 shadow-xl">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-red-900/40">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <h4 className="text-sm font-bold text-white">
                        레드팀 토론 평가 및 논리 견고성 리포트
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                      <span>논리 견고성:</span>
                      <span>{currentSession.critiqueSummary.thesisScore} / 100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Strengths */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/40">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>탁월했던 통찰 & 논리적 강점</span>
                      </span>
                      <ul className="space-y-1.5">
                        {currentSession.critiqueSummary.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                            <span className="text-emerald-400">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Blind spots */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-red-900/40">
                      <span className="text-xs font-semibold text-red-400 flex items-center gap-1.5 mb-2">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>보강해야 할 사각지대 (Blind Spots)</span>
                      </span>
                      <ul className="space-y-1.5">
                        {currentSession.critiqueSummary.blindSpots.map((b, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                            <span className="text-red-400">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40">
                    <span className="text-xs font-bold text-amber-300 block mb-1">
                      최종 종합 지혜 (Synthesis)
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {currentSession.critiqueSummary.finalSynthesis}
                    </p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Chat Input Bar */}
        {hasStarted && (
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-slate-950/95 border-t border-slate-800 flex flex-col gap-2">
            <div className="flex items-end gap-2.5">
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={`[${currentLevel.toUpperCase()}] 레드팀의 반론에 논리적 근거 및 거시경제 지표 데이터를 들어 재반박하십시오... (Shift+Enter로 줄바꿈)`}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition resize-none min-h-[64px] max-h-[180px] overflow-y-auto leading-relaxed"
                />
              </div>
              <button
                id="btn-send-redteam-chat"
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-red-950/40 transition cursor-pointer min-h-[64px] min-w-[76px] self-end"
                title="반박 전송 (Enter)"
              >
                {isSending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>반박</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span className="flex items-center gap-1 text-slate-400">
                <span>💡 <strong>Shift + Enter</strong> 줄바꿈 &bull; <strong>Enter</strong> 논리 제출</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {inputText.length > 0 && `${inputText.length.toLocaleString()}자 입력 중`}
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
