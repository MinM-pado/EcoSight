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
  BarChart3,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Check,
  Stamp,
  Sliders,
  Eye,
  Palette,
  Edit3
} from 'lucide-react';
import { RedTeamSession, RedTeamMessage, PrismAnalysisResult, SocraticLevel } from '../types';
import { MacroIndicatorVerifier } from './MacroIndicatorVerifier';
import { getRelevantMacroIndicators, getRelevantSourceGroundings } from '../data/macroIndicators';
import { MarkdownRenderer } from './MarkdownRenderer';

interface RedTeamChatViewProps {
  currentSession: RedTeamSession;
  onSendMessage: (userText: string) => Promise<void>;
  onEvaluateThesis: () => Promise<void>;
  onResetSession: () => void;
  onSaveSessionToKnowledge: (session: RedTeamSession) => void;
  onNavigateToKnowledge?: () => void;
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
  onNavigateToKnowledge,
  isEvaluating,
  isSending,
  currentAnalysis,
  socraticLevel = 'standard',
  onChangeSocraticLevel,
}) => {
  const [inputText, setInputText] = useState('');
  const [thesisDraft, setThesisDraft] = useState(currentSession.userThesis || '');
  const [showMacroVerifier, setShowMacroVerifier] = useState(false);
  const [hasSavedReport, setHasSavedReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Watermark & Emphasis Phrases configuration state
  const DEFAULT_WATERMARK = {
    enabled: true,
    phrase: '돈을 쫓지 말고, 돈이 흐르는 길을 보라 • ECOSIGHT RED TEAM',
    style: 'diagonal' as 'diagonal' | 'center' | 'subtle-stamp' | 'banner',
    opacity: 0.08,
    colorTone: 'red' as 'red' | 'blue' | 'amber' | 'emerald',
  };

  const WATERMARK_PRESETS = [
    {
      id: 'flow-of-money',
      title: '돈을 쫓지 말고, 돈이 흐르는 길을 보라',
      badge: 'EcoSight 정수',
      text: '돈을 쫓지 말고, 돈이 흐르는 길을 보라 • ECOSIGHT RED TEAM',
      description: '시장 단기 소음을 걷어내고 자본과 유동성의 거시적 물줄기를 직시하는 시각',
    },
    {
      id: 'bias-breaker',
      title: '확증 편향을 깨는 사고력 훈련소',
      badge: '핵심 철학',
      text: 'BREAK CONFIRMATION BIAS • 확증 편향 제거와 입체적 사고 훈련',
      description: '자신의 상승/하락 편향을 해체하고 360도 전방위 리스크를 입체적으로 점검',
    },
    {
      id: 'socratic-question',
      title: 'QUESTION EVERYTHING (소크라테스식 반문)',
      badge: '소크라테스',
      text: 'QUESTION EVERYTHING • SOCRATIC RED TEAM DIALECTIC',
      description: '모두가 동의하는 합의(Consensus)에 끝없이 의문을 제기하는 날카로운 지적 태도',
    },
    {
      id: 'synthesis-conviction',
      title: '정반합(Synthesis) — 맹점을 깨고 더 높은 확신으로',
      badge: '정반합',
      text: '정반합(SYNTHESIS) • 흔들리지 않는 확신(CONVICTION)의 완성',
      description: '반론과의 충돌을 거쳐 취약한 가설을 단단한 투자/전략적 확신으로 승화',
    },
    {
      id: 'blind-spot-check',
      title: '내가 틀릴 수 있는 핵심 지표는 무엇인가?',
      badge: '사각지대',
      text: 'WHAT IF I AM WRONG? • 반대편 리스크와 사각지대 상시 점검',
      description: '상승장에서도 하방 위험 지표를, 공포 속에서도 잠재적 반등 동력을 찾는 규율',
    },
  ];

  const [watermarkConfig, setWatermarkConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('ecosight_redteam_watermark_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_WATERMARK;
  });

  const [showWatermarkModal, setShowWatermarkModal] = useState(false);
  const [tempWatermark, setTempWatermark] = useState(watermarkConfig);
  const [customPhraseInput, setCustomPhraseInput] = useState(watermarkConfig.phrase);

  const handleSaveWatermark = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...tempWatermark,
      phrase: customPhraseInput.trim() || DEFAULT_WATERMARK.phrase,
    };
    setWatermarkConfig(updated);
    try {
      localStorage.setItem('ecosight_redteam_watermark_settings', JSON.stringify(updated));
    } catch (err) {}
    setShowWatermarkModal(false);
  };

  const handleResetWatermark = () => {
    setTempWatermark(DEFAULT_WATERMARK);
    setCustomPhraseInput(DEFAULT_WATERMARK.phrase);
    setWatermarkConfig(DEFAULT_WATERMARK);
    try {
      localStorage.removeItem('ecosight_redteam_watermark_settings');
    } catch (err) {}
  };

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
              확증 편향을 깨뜨리기 위해 당신의 논리에 끊임없이 &ldquo;왜?&rdquo;를 묻고 사각지대를 공격하는 AI 레드팀 파트너입니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
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
                title="토론을 매듭짓고 논리 강건성 점수, 사각지대, 정반합 재건 가설이 담긴 종합 진단 리포트를 발행합니다."
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>정반합 진단서 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5" />
                    <span>토론 종료 및 정반합 리포트 발행</span>
                  </>
                )}
              </button>

              <button
                id="btn-save-redteam-knowledge"
                onClick={() => {
                  onSaveSessionToKnowledge(currentSession);
                  setHasSavedReport(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  hasSavedReport 
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
                title="토론 내역 및 정반합 진단서를 지식 서고에 보관"
              >
                {hasSavedReport ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>서고 보관됨 ✓</span>
                  </>
                ) : (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>서고 보관</span>
                  </>
                )}
              </button>

              <button
                id="btn-reset-redteam"
                onClick={() => {
                  setHasSavedReport(false);
                  onResetSession();
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
                title="새 토론 시작"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* EcoSight 3-Step Socratic Dialectic Architecture (소크라테스식 3단계 사고 훈련 지향점) */}
      <div id="socratic-3step-framework" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              소크라테스식 레드팀 토론의 3단계 지향점
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            &ldquo;토론의 끝은 말싸움의 승리가 아닌, 시장 소음에 흔들리지 않는 <strong>확신(Conviction)</strong>을 얻는 순간입니다.&rdquo;
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-black border border-amber-500/30">1</span>
                  생각의 균열과 맹점 발견
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                  Aha Moment
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                논리의 승패가 아닙니다. 상대의 반론을 통해 스스로 &ldquo;아, 내가 이 거시 지표나 반대편 리스크를 놓치고 있었구나&rdquo;를 깨닫는 첫 번째 결말입니다.
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>가설의 사각지대(Blind Spots) 인지</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-blue-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-black border border-blue-500/30">2</span>
                  정반합(Synthesis) 논리 재건
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold">
                  가설 고도화
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                초기 주장을 무조건 철회하지 않고 반론을 흡수합니다. &ldquo;리스크 A·B가 존재하나, 조건 C 충족 시 유효하다&rdquo;와 같이 훨씬 더 단단한 가설로 진화시킵니다.
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span>충돌을 거쳐 업그레이드된 논리 방어벽</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-black border border-emerald-500/30">3</span>
                  종합 진단 리포트 & 서고 저장
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                  확신(Conviction)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                논리가 충분히 다듬어졌을 때 토론을 매듭짓습니다. 논리 강건성 점수(0~100), 핵심 맹점 요약, 최종 진화 가설을 서고에 영구 아카이빙합니다.
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 flex items-center gap-1">
              <BookmarkCheck className="w-3 h-3 text-emerald-400" />
              <span>시장 노이즈 시 복기할 나만의 가설 레포트</span>
            </div>
          </div>
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
            {/* Quick 1-click Watermark ON/OFF Toggle */}
            <button
              id="btn-toggle-watermark-quick"
              onClick={() => {
                const next = !watermarkConfig.enabled;
                const updated = { ...watermarkConfig, enabled: next };
                setWatermarkConfig(updated);
                try {
                  localStorage.setItem('ecosight_redteam_watermark_settings', JSON.stringify(updated));
                } catch (e) {}
              }}
              className={`px-2 py-1 rounded-lg text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                watermarkConfig.enabled
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
              }`}
              title={watermarkConfig.enabled ? "워터마크 끄기 (클릭 시 배경 문구 즉시 숨김)" : "워터마크 켜기 (클릭 시 배경 문구 투영)"}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${watermarkConfig.enabled ? 'bg-red-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{watermarkConfig.enabled ? '워터마크 ON' : '워터마크 OFF'}</span>
            </button>

            <button
              id="btn-open-watermark-settings"
              onClick={() => {
                setTempWatermark(watermarkConfig);
                setCustomPhraseInput(watermarkConfig.phrase);
                setShowWatermarkModal(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="토론 배경 워터마크 & 핵심 철학 강조구문 상세 설정"
            >
              <Stamp className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">문구·스타일 설정</span>
              <span className="sm:hidden">설정</span>
            </button>

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

        {/* Message Log with Background Watermark */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative">
          {/* Watermark & Emphasis Phrase Layer */}
          {watermarkConfig.enabled && (
            <div 
              aria-hidden="true" 
              className="pointer-events-none select-none absolute inset-0 z-0 overflow-hidden flex items-center justify-center p-6 transition-opacity duration-300"
              style={{ opacity: watermarkConfig.opacity }}
            >
              {watermarkConfig.style === 'diagonal' && (
                <div className="w-[160%] -rotate-12 flex flex-col gap-10 sm:gap-14 items-center justify-center text-center">
                  {Array.from({ length: 6 }).map((_, rIdx) => (
                    <div 
                      key={rIdx} 
                      className={`whitespace-nowrap font-black uppercase tracking-[0.25em] text-xs sm:text-sm md:text-base flex items-center gap-8 ${
                        watermarkConfig.colorTone === 'red' ? 'text-red-400' :
                        watermarkConfig.colorTone === 'blue' ? 'text-blue-400' :
                        watermarkConfig.colorTone === 'amber' ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      <span>{watermarkConfig.phrase}</span>
                      <span className="opacity-40">✦</span>
                      <span>{watermarkConfig.phrase}</span>
                      <span className="opacity-40">✦</span>
                      <span>{watermarkConfig.phrase}</span>
                    </div>
                  ))}
                </div>
              )}

              {watermarkConfig.style === 'center' && (
                <div className="flex flex-col items-center justify-center text-center max-w-xl space-y-4">
                  <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-dashed flex items-center justify-center ${
                    watermarkConfig.colorTone === 'red' ? 'border-red-500/60 text-red-400' :
                    watermarkConfig.colorTone === 'blue' ? 'border-blue-500/60 text-blue-400' :
                    watermarkConfig.colorTone === 'amber' ? 'border-amber-500/60 text-amber-400' : 'border-emerald-500/60 text-emerald-400'
                  }`}>
                    <Swords className="w-16 h-16 sm:w-20 sm:h-20" />
                  </div>
                  <span className={`text-sm sm:text-base md:text-lg font-black uppercase tracking-widest block px-6 py-2 rounded-2xl border-2 ${
                    watermarkConfig.colorTone === 'red' ? 'border-red-500 text-red-400' :
                    watermarkConfig.colorTone === 'blue' ? 'border-blue-500 text-blue-400' :
                    watermarkConfig.colorTone === 'amber' ? 'border-amber-500 text-amber-400' : 'border-emerald-500 text-emerald-400'
                  }`}>
                    {watermarkConfig.phrase}
                  </span>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                    ECOSIGHT DIALECTIC RED TEAM • BIAS BREAKER
                  </span>
                </div>
              )}

              {watermarkConfig.style === 'subtle-stamp' && (
                <div className="w-full h-full relative">
                  <div className={`absolute top-6 left-6 -rotate-12 border-2 border-dashed px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                    watermarkConfig.colorTone === 'red' ? 'border-red-500 text-red-400' :
                    watermarkConfig.colorTone === 'blue' ? 'border-blue-500 text-blue-400' :
                    watermarkConfig.colorTone === 'amber' ? 'border-amber-500 text-amber-400' : 'border-emerald-500 text-emerald-400'
                  }`}>
                    [ VERIFIED SOCRATIC RED TEAM ]
                  </div>
                  <div className={`absolute bottom-8 right-8 rotate-6 border-2 border-dashed px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest ${
                    watermarkConfig.colorTone === 'red' ? 'border-red-500 text-red-400' :
                    watermarkConfig.colorTone === 'blue' ? 'border-blue-500 text-blue-400' :
                    watermarkConfig.colorTone === 'amber' ? 'border-amber-500 text-amber-400' : 'border-emerald-500 text-emerald-400'
                  }`}>
                    {watermarkConfig.phrase}
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 text-sm sm:text-base font-black tracking-widest uppercase opacity-70 text-slate-300">
                    BREAK CONFIRMATION BIAS
                  </div>
                </div>
              )}

              {watermarkConfig.style === 'banner' && (
                <div className="w-full flex flex-col justify-between h-full py-8">
                  <div className={`w-full py-2.5 border-y border-dashed text-center font-black text-xs sm:text-sm tracking-[0.2em] uppercase ${
                    watermarkConfig.colorTone === 'red' ? 'border-red-500 text-red-400' :
                    watermarkConfig.colorTone === 'blue' ? 'border-blue-500 text-blue-400' :
                    watermarkConfig.colorTone === 'amber' ? 'border-amber-500 text-amber-400' : 'border-emerald-500 text-emerald-400'
                  }`}>
                    {watermarkConfig.phrase}
                  </div>
                  <div className={`w-full py-2.5 border-y border-dashed text-center font-black text-xs sm:text-sm tracking-[0.2em] uppercase ${
                    watermarkConfig.colorTone === 'red' ? 'border-red-500 text-red-400' :
                    watermarkConfig.colorTone === 'blue' ? 'border-blue-500 text-blue-400' :
                    watermarkConfig.colorTone === 'amber' ? 'border-amber-500 text-amber-400' : 'border-emerald-500 text-emerald-400'
                  }`}>
                    {watermarkConfig.phrase}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Elevated Chat Content Wrapper */}
          <div className="relative z-10 space-y-4">
          {!hasStarted ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto p-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 shadow-inner">
                <Swords className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  당신의 경제 견해(Thesis)를 제시하십시오
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                  &ldquo;금리 인하로 부동산이 폭등할 것이다&rdquo;, &ldquo;AI 반도체 수요는 과잉 설비다&rdquo; 등 당신의 가설을 작성하면, AI 레드팀이 즉시 사각지대와 반론을 공격합니다.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-amber-300/90 font-medium">
                  <Scale className="w-3.5 h-3.5" />
                  <span>목표: 말싸움 승리가 아닌 &lsquo;정반합(Synthesis)&rsquo;을 통한 흔들리지 않는 확신(Conviction) 완성</span>
                </div>
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
                    <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold opacity-75">
                      {msg.role === 'user' ? (
                        <span className="text-slate-400">사용자 가설 (Thesis)</span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1">
                          <Swords className="w-3 h-3" />
                          <span>AI 레드팀 반론 (Antithesis)</span>
                        </span>
                      )}
                    </div>
                    <MarkdownRenderer content={msg.content} isUser={msg.role === 'user'} />
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

              {/* Evaluation Critique Result (EcoSight 3-Step Socratic Synthesis Diagnostic Report) */}
              {currentSession.critiqueSummary && (
                <div id="redteam-critique-card" className="mt-8 rounded-2xl bg-gradient-to-br from-red-950/50 via-slate-950 to-slate-900 border-2 border-amber-500/40 shadow-2xl p-5 sm:p-7 space-y-6">
                  {/* Card Header with Score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40 shrink-0 mt-0.5">
                        <Award className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white flex items-center gap-2">
                            EcoSight 소크라테스식 정반합 종합 진단서
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Synthesis Report
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          단순 승패를 넘어선 확증 편향 극복과 생각의 지평 확장 (3-Step Dialectic Completion)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">논리 강건성 점수</div>
                        <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                          {currentSession.critiqueSummary.thesisScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                        </div>
                      </div>
                      <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold ${
                        currentSession.critiqueSummary.thesisScore >= 85
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : currentSession.critiqueSummary.thesisScore >= 70
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {currentSession.critiqueSummary.thesisScore >= 85
                          ? '기관급 강건성'
                          : currentSession.critiqueSummary.thesisScore >= 70
                            ? '견고한 분석 프레임'
                            : '사각지대 보완 필요'}
                      </div>
                    </div>
                  </div>

                  {/* Score Analysis Commentary if available */}
                  {currentSession.critiqueSummary.scoreAnalysis && (
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                        <Scale className="w-3.5 h-3.5 text-amber-400" />
                        <span>논리 강건성 평가 소견 (반론 대응 능력 및 데이터 기반 논리성):</span>
                      </span>
                      <div className="pl-5 text-slate-200">
                        <MarkdownRenderer content={currentSession.critiqueSummary.scoreAnalysis} />
                      </div>
                    </div>
                  )}

                  {/* Step 1: Blind Spot Discovery & Strengths */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/40 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>시장의 소음을 이겨낸 논리 강점 (Strengths)</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            유효 통찰
                          </span>
                        </div>
                        <ul className="space-y-2 mt-2">
                          {currentSession.critiqueSummary.strengths.map((s, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                              <div className="leading-relaxed flex-1">
                                <MarkdownRenderer content={s} />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Step 1: Blind spots */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-red-900/50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                            <AlertOctagon className="w-4 h-4 text-red-400" />
                            <span>1단계: 생각의 균열과 맹점 (Blind Spots)</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20 font-semibold">
                            Aha Moment
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2">
                          토론을 통해 스스로 자각하게 된 사각지대 및 간과했던 리스크:
                        </p>
                        <ul className="space-y-2">
                          {currentSession.critiqueSummary.blindSpots.map((b, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-red-400 font-bold shrink-0 mt-0.5">!</span>
                              <div className="leading-relaxed flex-1">
                                <MarkdownRenderer content={b} />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Evolved Thesis through Thesis-Antithesis-Synthesis */}
                  <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-950 border border-blue-800/50">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-blue-300 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-black border border-blue-500/30">2</span>
                        정반합(Thesis-Antithesis-Synthesis) 논리 재건 가설
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                        진화된 가설 (Evolved Thesis)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      원초 가설을 일방적으로 폐기하지 않고, 레드팀의 반론을 흡수하여 리스크 조건을 상수로 품은 업그레이드 가설입니다:
                    </p>
                    <div className="p-3.5 rounded-lg bg-slate-950/80 border border-blue-500/30 text-xs sm:text-sm text-blue-100 font-medium leading-relaxed italic">
                      <MarkdownRenderer content={currentSession.critiqueSummary.evolvedThesis || '반론과 리스크를 흡수하여 한 단계 더 단단하게 재구축된 종합 가설'} />
                    </div>
                  </div>

                  {/* Step 3: Final Synthesis Report */}
                  <div className="p-4 sm:p-5 rounded-xl bg-amber-950/30 border border-amber-800/50">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-black border border-amber-500/30">3</span>
                        최종 종합 지혜 레포트 (Synthesis & Conviction)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                        시장 복기 가이드
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      <MarkdownRenderer content={currentSession.critiqueSummary.finalSynthesis} />
                    </div>
                  </div>

                  {/* Report Card Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          onSaveSessionToKnowledge(currentSession);
                          setHasSavedReport(true);
                        }}
                        className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer ${
                          hasSavedReport
                            ? 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/40'
                            : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-950/40'
                        }`}
                      >
                        {hasSavedReport ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300" />
                            <span>지식 서고에 정반합 리포트 보관 완료 ✓</span>
                          </>
                        ) : (
                          <>
                            <BookmarkCheck className="w-4 h-4" />
                            <span>지식 서고(Knowledge Hub)에 정반합 리포트 영구 보관</span>
                          </>
                        )}
                      </button>

                      {onNavigateToKnowledge && (
                        <button
                          onClick={onNavigateToKnowledge}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span>지식 서고에서 복기</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setHasSavedReport(false);
                        onResetSession();
                      }}
                      className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-800 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>새로운 가설로 도전하기</span>
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
          </div>
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

      {/* Modal: Watermark & Emphasis Phrases Settings */}
      {showWatermarkModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                  <Stamp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    토론 워터마크 &amp; 핵심 철학 강조구문 설정
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    토론 배경에 EcoSight의 시각을 은은하게 투영하거나, 원하는 가설을 워터마크로 투영합니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWatermarkModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWatermark} className="space-y-5 text-xs">
              {/* Toggle ON/OFF */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white block">워터마크 활성화</span>
                  <span className="text-xs text-slate-400">토론창 배경에 시각적 철학 문구 투영 여부</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTempWatermark(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    tempWatermark.enabled ? 'bg-red-600' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform transform shadow-md ${
                      tempWatermark.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Preset Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>공식 철학 강조구문 프리셋 선택</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {WATERMARK_PRESETS.map((preset) => {
                    const isSelected = customPhraseInput === preset.text;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setCustomPhraseInput(preset.text);
                          setTempWatermark(prev => ({ ...prev, phrase: preset.text }));
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-red-950/40 border-red-500/80 ring-1 ring-red-500/40 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white line-clamp-1">{preset.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>워터마크 문구 직접 편집 (Custom Phrase)</span>
                </label>
                <textarea
                  value={customPhraseInput}
                  onChange={(e) => {
                    setCustomPhraseInput(e.target.value);
                    setTempWatermark(prev => ({ ...prev, phrase: e.target.value }));
                  }}
                  rows={2}
                  placeholder="예: 돈을 쫓지 말고, 돈이 흐르는 길을 보라 • ECOSIGHT RED TEAM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 transition resize-none leading-relaxed"
                />
              </div>

              {/* Style & Density Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Style */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <span>워터마크 스타일</span>
                  </label>
                  <select
                    value={tempWatermark.style}
                    onChange={(e) => setTempWatermark(prev => ({ ...prev, style: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="diagonal">📐 대각선 반복 스탬프 (Diagonal)</option>
                    <option value="center">🎯 중앙 엠블럼 워터마크 (Center)</option>
                    <option value="subtle-stamp">🏷️ 분산 러버 스탬프 (Stamps)</option>
                    <option value="banner">📜 상·하단 리본 배너 (Banner)</option>
                  </select>
                </div>

                {/* Opacity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>투명도 / 강조 농도</span>
                  </label>
                  <select
                    value={tempWatermark.opacity}
                    onChange={(e) => setTempWatermark(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
                  >
                    <option value={0.04}>은은하게 (4% - 시야 방해 최소화)</option>
                    <option value={0.08}>표준 권장 (8% - 조화로운 가독성)</option>
                    <option value={0.16}>또렷하게 (16% - 강조감 부각)</option>
                  </select>
                </div>

                {/* Color Tone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                    <span>테마 컬러</span>
                  </label>
                  <select
                    value={tempWatermark.colorTone}
                    onChange={(e) => setTempWatermark(prev => ({ ...prev, colorTone: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="red">크림슨 레드 (Red Team)</option>
                    <option value="blue">오션 블루 (Macro Blue)</option>
                    <option value="amber">앰버 골드 (Insight Gold)</option>
                    <option value="emerald">에메랄드 그린 (Growth)</option>
                  </select>
                </div>
              </div>

              {/* Real-time Preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>실시간 적용 미리보기 (Live Preview)</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {tempWatermark.enabled ? 'Active' : 'Disabled'}
                  </span>
                </label>
                <div className="h-32 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center justify-center p-4 shadow-inner">
                  {tempWatermark.enabled ? (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none transition-opacity"
                      style={{ opacity: tempWatermark.opacity * 1.5 }}
                    >
                      {tempWatermark.style === 'diagonal' && (
                        <div className="w-[140%] -rotate-12 flex flex-col gap-4 text-center font-black uppercase tracking-widest text-[11px]">
                          <div className={tempWatermark.colorTone === 'red' ? 'text-red-400' : tempWatermark.colorTone === 'blue' ? 'text-blue-400' : tempWatermark.colorTone === 'amber' ? 'text-amber-400' : 'text-emerald-400'}>
                            {customPhraseInput || DEFAULT_WATERMARK.phrase}
                          </div>
                          <div className={tempWatermark.colorTone === 'red' ? 'text-red-400' : tempWatermark.colorTone === 'blue' ? 'text-blue-400' : tempWatermark.colorTone === 'amber' ? 'text-amber-400' : 'text-emerald-400'}>
                            {customPhraseInput || DEFAULT_WATERMARK.phrase}
                          </div>
                        </div>
                      )}
                      {tempWatermark.style === 'center' && (
                        <div className="flex flex-col items-center gap-1">
                          <Swords className={`w-8 h-8 ${tempWatermark.colorTone === 'red' ? 'text-red-400' : tempWatermark.colorTone === 'blue' ? 'text-blue-400' : tempWatermark.colorTone === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`} />
                          <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded border ${tempWatermark.colorTone === 'red' ? 'border-red-500 text-red-400' : tempWatermark.colorTone === 'blue' ? 'border-blue-500 text-blue-400' : tempWatermark.colorTone === 'amber' ? 'border-amber-500 text-amber-400' : 'border-emerald-500 text-emerald-400'}`}>
                            {customPhraseInput || DEFAULT_WATERMARK.phrase}
                          </span>
                        </div>
                      )}
                      {tempWatermark.style === 'subtle-stamp' && (
                        <div className="w-full h-full relative">
                          <div className={`absolute top-2 left-2 -rotate-12 border border-dashed px-2 py-0.5 rounded text-[10px] font-black uppercase ${tempWatermark.colorTone === 'red' ? 'border-red-500 text-red-400' : tempWatermark.colorTone === 'blue' ? 'border-blue-500 text-blue-400' : tempWatermark.colorTone === 'amber' ? 'border-amber-500 text-amber-400' : 'border-emerald-500 text-emerald-400'}`}>
                            [ ECOSIGHT RED TEAM ]
                          </div>
                          <div className={`absolute bottom-2 right-2 rotate-6 border border-dashed px-2 py-0.5 rounded text-[10px] font-black uppercase ${tempWatermark.colorTone === 'red' ? 'border-red-500 text-red-400' : tempWatermark.colorTone === 'blue' ? 'border-blue-500 text-blue-400' : tempWatermark.colorTone === 'amber' ? 'border-amber-500 text-amber-400' : 'border-emerald-500 text-emerald-400'}`}>
                            {customPhraseInput || DEFAULT_WATERMARK.phrase}
                          </div>
                        </div>
                      )}
                      {tempWatermark.style === 'banner' && (
                        <div className="w-full flex flex-col justify-between h-full py-2">
                          <div className={`w-full border-y border-dashed text-center font-black text-[10px] py-1 uppercase ${tempWatermark.colorTone === 'red' ? 'border-red-500 text-red-400' : tempWatermark.colorTone === 'blue' ? 'border-blue-500 text-blue-400' : tempWatermark.colorTone === 'amber' ? 'border-amber-500 text-amber-400' : 'border-emerald-500 text-emerald-400'}`}>
                            {customPhraseInput || DEFAULT_WATERMARK.phrase}
                          </div>
                          <div className={`w-full border-y border-dashed text-center font-black text-[10px] py-1 uppercase ${tempWatermark.colorTone === 'red' ? 'border-red-500 text-red-400' : tempWatermark.colorTone === 'blue' ? 'border-blue-500 text-blue-400' : tempWatermark.colorTone === 'amber' ? 'border-amber-500 text-amber-400' : 'border-emerald-500 text-emerald-400'}`}>
                            {customPhraseInput || DEFAULT_WATERMARK.phrase}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600">워터마크 비활성화 상태</span>
                  )}

                  {/* Sample Chat Message on top of preview */}
                  <div className="relative z-10 max-w-xs p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 shadow-md">
                    <span className="text-red-400 font-bold block mb-0.5 text-[10px]">AI 레드팀 반론 예시:</span>
                    &ldquo;금리 인하 국면에서도 실질 금리와 달러 유동성 지표를 간과하면 자산 가격 괴리가 발생합니다.&rdquo;
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleResetWatermark}
                  className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>기본값 복원</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWatermarkModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-950/40 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>설정 저장 및 즉시 적용</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
