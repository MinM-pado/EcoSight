/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PrismAnalysisView } from './components/PrismAnalysisView';
import { BullBearContrastView } from './components/BullBearContrastView';
import { RedTeamChatView } from './components/RedTeamChatView';
import { KnowledgeHubView } from './components/KnowledgeHubView';
import { BiasBreakerView } from './components/BiasBreakerView';
import { AIEngineModal } from './components/AIEngineModal';
import { SubscriptionTierModal } from './components/SubscriptionTierModal';
import { 
  PrismAnalysisResult, 
  RedTeamSession, 
  KnowledgeItem, 
  BiasBreakerStats,
  BullBearComparisonResult,
  SocraticLevel,
  AIEngineConfig
} from './types';
import { INITIAL_SAMPLE_ANALYSIS, INITIAL_SAMPLE_CONTRAST } from './data/presets';
import { 
  safeLocalStorageSet, 
  deduplicateKnowledgeItems, 
  deduplicateCuratedBundle 
} from './utils/storageManager';
import { loadEngineConfig, saveEngineConfig } from './utils/engineConfig';

const STORAGE_KEYS = {
  ANALYSIS: 'ecosight_current_analysis',
  CONTRAST: 'ecosight_current_contrast',
  REDTEAM: 'ecosight_redteam_session',
  KNOWLEDGE: 'ecosight_knowledge_items',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'prism' | 'contrast' | 'redteam' | 'knowledge' | 'bias'>('prism');
  const [currentAnalysis, setCurrentAnalysis] = useState<PrismAnalysisResult | null>(null);
  const [currentContrast, setCurrentContrast] = useState<BullBearComparisonResult | null>(null);
  const [isLoadingContrast, setIsLoadingContrast] = useState(false);
  const [socraticLevel, setSocraticLevel] = useState<SocraticLevel>('standard');
  const [redTeamSession, setRedTeamSession] = useState<RedTeamSession>({
    id: 'session_' + Date.now(),
    topic: '',
    userThesis: '',
    socraticLevel: 'standard',
    messages: [],
  });
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isSendingRedTeam, setIsSendingRedTeam] = useState(false);
  const [isEvaluatingThesis, setIsEvaluatingThesis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // AI Engine (Local Ollama / LM Studio vs Gemini Cloud) & Subscription Tier Modals
  const [engineConfig, setEngineConfig] = useState<AIEngineConfig>(loadEngineConfig());
  const [isEngineModalOpen, setIsEngineModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  // Initialize from LocalStorage or Presets
  useEffect(() => {
    try {
      const savedAnalysis = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
      if (savedAnalysis) {
        setCurrentAnalysis(JSON.parse(savedAnalysis));
      } else {
        setCurrentAnalysis(INITIAL_SAMPLE_ANALYSIS);
      }

      const savedContrast = localStorage.getItem(STORAGE_KEYS.CONTRAST);
      if (savedContrast) {
        setCurrentContrast(JSON.parse(savedContrast));
      } else {
        setCurrentContrast(INITIAL_SAMPLE_CONTRAST);
      }

      const savedRedTeam = localStorage.getItem(STORAGE_KEYS.REDTEAM);
      if (savedRedTeam) {
        const parsed = JSON.parse(savedRedTeam);
        setRedTeamSession(parsed);
        if (parsed.socraticLevel) setSocraticLevel(parsed.socraticLevel);
      }

      const savedKnowledge = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE);
      if (savedKnowledge) {
        setKnowledgeItems(JSON.parse(savedKnowledge));
      } else {
        // Initial seed knowledge items (F05 Rich Samples)
        const initialSeeds: KnowledgeItem[] = [
          {
            id: 'seed_1',
            title: '미국 연준(Fed) 기준금리 인하 개시: 환율 및 유동성 변곡점',
            type: 'analysis',
            content: INITIAL_SAMPLE_ANALYSIS.coreMechanism + '\n\n[도미노 파급]: ' + INITIAL_SAMPLE_ANALYSIS.rippleEffect.level3Domino,
            tags: ['연준', '기준금리', '환율', '유동성'],
            macroCategory: '통화정책/금리',
            sentiment: 'Neutral/Complex',
            scope: 'Macro (거시)',
            createdAt: new Date().toISOString(),
            thesisReview: {
              originalThesis: '미 연준이 50bp 빅컷을 단행하면 한미 금리차가 축소되어 원/달러 환율이 1,300원 이하로 안착할 것이다.',
              targetDate: '2024년 4분기 (3개월 시계)',
              realizedOutcome: '금리 인하 직후 달러인덱스가 100선까지 급락했으나, 미국 경제 견조함 및 지정학 충격, 트럼프 2기 관세 리스크로 원/달러 환율이 1,400원선까지 재급등함.',
              outcomeStatus: 'inaccurate',
              retrospectiveLessons: '단순 금리차(Carry)만 보고 환율 방향성을 단정한 편향. 미국의 상대적 성장 우위(US Exceptionalism)와 지정학 안전자산 선호 변수를 소홀히 평가했음.',
              reviewedAt: new Date().toISOString(),
            },
            curatedBundle: {
              curatedSummary: '연준의 금리 인하기에는 글로벌 자본 재배치가 발생하지만, 미국 예외주의 및 재정적자 우려와 결합될 때 장기 국채금리가 오히려 반등하는 역설적 유동성 경색이 빈번했습니다.',
              antiConsensus: [
                {
                  title: '금리 인하가 오히려 장기금리 상승과 달러 강세를 촉발한다는 시각',
                  perspective: '연준의 선제적 금리 인하가 경제 노랜딩(No Landing) 및 인플레이션 재점화를 자극하여 10년물 장기 국채 금리가 오르고 달러가 강세로 돌아선다는 견해.',
                  sourceOrRationale: '1995년 그린스펀 연준의 미드사이클 인하 당시 국채 금리 및 달러 추이'
                }
              ],
              crossMacroThemes: [
                {
                  theme: '미국 재정적자 급증과 국채 수급 불균형',
                  impactAnalysis: '단기 정책금리 인하에도 불구하고 천문학적 국채 발행으로 장기물 기간 프리미엄(Term Premium)이 확대되는 현상.',
                  watchIndicators: ['US10Y', 'DXY', 'SOFR']
                }
              ],
              historicalCases: [
                {
                  title: '1995년 그린스펀 연준의 선제적 보험성 금리 인하',
                  period: '1995 - 1998년',
                  relevance: '경기 침체 없는 보험성 인하로 주식시장이 닷컴 버블 랠리로 진입한 선례',
                  keyTakeaway: '침체형 인하와 완화형 인하를 철저히 구분해야 하며, 증시에는 강력한 유동성 모멘텀으로 작용함.'
                }
              ],
              recommendedTags: ['기간프리미엄', '노랜딩', '역설적유동성']
            }
          },
          {
            id: 'seed_2',
            title: '엔 캐리 트레이드 청산 메커니즘과 자산 가격 변동성',
            type: 'note',
            content: '일본은행(BOJ)의 금리 인상과 미국의 금리 인하가 맞물릴 때 미-일 금리차가 축소되며, 저금리 엔화 차입을 통해 글로벌 자산에 투자되었던 수조 달러 규모의 캐리 트레이드가 강제 청산(Unwinding)되는 경로를 정리함.',
            tags: ['엔화', '캐리트레이드', '외환', '일본은행'],
            macroCategory: '외환/환율',
            sentiment: 'Bearish',
            scope: 'Macro (거시)',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            thesisReview: {
              originalThesis: 'BOJ의 전격 금리 인상은 엔화 강세와 글로벌 주식시장(특히 닛케이, 나스닥)의 단기 패닉 셀을 초래할 것이다.',
              targetDate: '2024년 8월 초',
              realizedOutcome: '8월 5일 블랙 먼데이 발생: 닛케이 -12.4% 사상 최대 폭락, VIX 65 돌파. 가설이 시장 현실과 일치하게 적중함.',
              outcomeStatus: 'accurate',
              retrospectiveLessons: '레버리지 청산의 급속한 전염성을 선제적으로 포착함. 다만 BOJ 부총재의 긴급 구두 개입 후의 V자 급반등 속도도 감안할 필요가 있었음.',
              reviewedAt: new Date(Date.now() - 43200000).toISOString(),
            },
          },
          {
            id: 'seed_3',
            title: 'AI 반도체 인프라 CAPEX와 전력망 병목 리포트 발췌',
            type: 'uploaded_file',
            content: '대규모 언어모델(LLM) 구동을 위한 데이터센터 전력 소비량이 기하급수적으로 증가. 칩셋 공급 부족보다 송전망 전력 인입 및 냉각수 공급이 핵심 병목으로 부상하고 있음.',
            tags: ['AI반도체', '전력인프라', '원자력', 'CAPEX'],
            macroCategory: '산업/반도체/AI',
            sentiment: 'Bullish',
            scope: 'Micro (미시/산업)',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            thesisReview: {
              originalThesis: '빅테크의 AI 칩 구매 경쟁이 송전망 전력 병목에 부딪혀 SMR 및 원자력 유틸리티 기업이 최고 수혜주가 될 것이다.',
              targetDate: '2024년 하반기',
              realizedOutcome: '콘스텔레이션, 비스트라 등 원자력·전력주가 100% 이상 폭등하며 가설 일치. 그러나 전력망 인허가 지연(Queue)으로 일부 데이터센터는 지연됨.',
              outcomeStatus: 'partial',
              retrospectiveLessons: '하드웨어 수요와 수혜 업종은 적중했으나, 규제 인허가 기간이라는 시차(Time lag) 변수를 과소평가함.',
              reviewedAt: new Date(Date.now() - 86400000).toISOString(),
            }
          }
        ];
        setKnowledgeItems(initialSeeds);
        localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(initialSeeds));
      }
    } catch (e) {
      console.error('Error loading localStorage:', e);
      setCurrentAnalysis(INITIAL_SAMPLE_ANALYSIS);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (currentAnalysis) {
      safeLocalStorageSet(STORAGE_KEYS.ANALYSIS, JSON.stringify(currentAnalysis));
    }
  }, [currentAnalysis]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.REDTEAM, JSON.stringify(redTeamSession));
  }, [redTeamSession]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(deduplicateKnowledgeItems(knowledgeItems)));
  }, [knowledgeItems]);

  // Compute Bias Breaker Stats dynamically
  const biasStats: BiasBreakerStats = React.useMemo(() => {
    let bullish = 0;
    let bearish = 0;
    let neutral = 0;
    let macro = 0;
    let micro = 0;
    const sectorDist: Record<string, number> = {
      '반도체/AI': 0,
      '금융/은행': 0,
      '에너지/원자재': 0,
      '부동산': 0,
      '소비재/제조업': 0,
    };
    const countryDist: Record<string, number> = {
      '미국': 0,
      '한국': 0,
      '중국': 0,
      '신흥국': 0,
    };

    // Include current analysis
    if (currentAnalysis) {
      if (currentAnalysis.sentiment === 'Bullish') bullish++;
      else if (currentAnalysis.sentiment === 'Bearish') bearish++;
      else neutral++;

      if (currentAnalysis.scope.includes('Macro')) macro++;
      else micro++;

      currentAnalysis.affectedSectors.forEach((s) => {
        const matched = Object.keys(sectorDist).find((k) => s.includes(k) || k.includes(s));
        if (matched) sectorDist[matched]++;
        else sectorDist['금융/은행']++;
      });
    }

    // Include knowledge items
    knowledgeItems.forEach((item) => {
      if (item.sentiment === 'Bullish') bullish++;
      else if (item.sentiment === 'Bearish') bearish++;
      else neutral++;

      if (item.macroCategory.includes('통화') || item.macroCategory.includes('외환') || item.macroCategory.includes('지정학')) {
        macro++;
      } else {
        micro++;
      }

      item.tags.forEach((t) => {
        if (t.includes('AI') || t.includes('반도체')) sectorDist['반도체/AI']++;
        if (t.includes('금리') || t.includes('은행')) sectorDist['금융/은행']++;
        if (t.includes('원자재') || t.includes('전력')) sectorDist['에너지/원자재']++;
        if (t.includes('부동산') || t.includes('PF')) sectorDist['부동산']++;
      });
    });

    return {
      bullishCount: Math.max(bullish, 1),
      bearishCount: Math.max(bearish, 1),
      neutralCount: Math.max(neutral, 1),
      macroCount: Math.max(macro, 1),
      microCount: Math.max(micro, 1),
      sectorDistribution: sectorDist,
      countryDistribution: countryDist,
      suggestedTopics: [
        {
          title: '글로벌 원유 및 원자재 공급망 충격과 스태그플레이션 리스크',
          reason: '현재 기술주 및 유동성에 관심이 집중되어 원자재 인플레이션 충격에 대한 사각지대가 있습니다.',
          category: '원자재/에너지',
        },
        {
          title: '중화권 디플레이션 압력과 글로벌 수입물가 덤핑 파급효과',
          reason: '미국 중심 시각에서 벗어나 동아시아 공급망 역학관계를 점검할 필요가 있습니다.',
          category: '지정학/공급망',
        },
        {
          title: '선진국 상업용 부동산 대출 연체와 중소 지역은행 신용 위험',
          reason: '금리 인하 효과가 실물 대출 자산의 부실을 완전히 해소할 수 있는지 역발상 점검이 필요합니다.',
          category: '부동산/신용부채',
        },
      ],
    };
  }, [currentAnalysis, knowledgeItems]);

  // Run Prism Analysis API
  const handleRunAnalysis = async (topic: string, text: string, sourceUrl?: string) => {
    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    try {
      const res = await fetch('/api/prism-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, text, sourceUrl, engineConfig }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || '분석 요청 처리 중 일시적인 지연이 발생했습니다.');
      }
      const data = await res.json();
      setCurrentAnalysis(data);
    } catch (err: any) {
      setAnalysisError(err?.message || '분석 처리 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Save analysis to knowledge items
  const handleSaveAnalysisToKnowledge = (analysis: PrismAnalysisResult) => {
    const isAlreadySaved = knowledgeItems.some((k) => k.id === analysis.id);
    if (isAlreadySaved) {
      alert('이미 지식 서고에 보관된 분석입니다.');
      return;
    }

    const newItem: KnowledgeItem = {
      id: analysis.id,
      title: analysis.headline,
      type: 'analysis',
      content: `${analysis.coreMechanism}\n\n[1차 효과]: ${analysis.rippleEffect.level1Direct}\n[2차 전이]: ${analysis.rippleEffect.level2Transmission}\n[3차 도미노]: ${analysis.rippleEffect.level3Domino}\n\n[역사적 거울]: ${analysis.historicalMirror.eventTitle} - ${analysis.historicalMirror.lessons}`,
      tags: [analysis.macroCategory, ...analysis.affectedSectors.slice(0, 3)],
      macroCategory: analysis.macroCategory,
      sentiment: analysis.sentiment,
      createdAt: new Date().toISOString(),
      sourceUrl: analysis.sourceSnippet,
    };

    setKnowledgeItems((prev) => [newItem, ...prev]);
    alert('지식 서고에 안전하게 보관되었습니다.');
  };

  // Start Red Team debate
  const handleStartRedTeam = (analysis: PrismAnalysisResult, initialQuestion?: string) => {
    const thesisSeed = initialQuestion || `${analysis.headline}에 대하여: 시장의 주류 시각과 다른 리스크가 존재한다고 봅니다.`;
    setRedTeamSession({
      id: 'session_' + Date.now(),
      analysisId: analysis.id,
      topic: analysis.headline,
      userThesis: thesisSeed,
      messages: [
        {
          id: 'msg_initial',
          role: 'user',
          content: thesisSeed,
          timestamp: new Date().toISOString(),
        }
      ],
    });
    setActiveTab('redteam');
    // Automatically trigger Red Team response
    handleSendRedTeamMessageWithContent(thesisSeed, analysis);
  };

  const handleSendRedTeamMessageWithContent = async (content: string, analysisCtx?: PrismAnalysisResult | null) => {
    setIsSendingRedTeam(true);
    const userMsg = {
      id: 'msg_' + Date.now(),
      role: 'user' as const,
      content,
      timestamp: new Date().toISOString(),
    };

    const newMessages = redTeamSession.messages.some((m) => m.content === content)
      ? redTeamSession.messages
      : [...redTeamSession.messages, userMsg];

    setRedTeamSession((prev) => ({
      ...prev,
      messages: newMessages,
    }));

    try {
      const activeSocraticLevel = redTeamSession.socraticLevel || socraticLevel || 'standard';
      const res = await fetch('/api/red-team-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thesis: redTeamSession.userThesis || content,
          analysisContext: analysisCtx || currentAnalysis,
          messages: newMessages,
          socraticLevel: activeSocraticLevel,
          engineConfig,
        }),
      });

      if (!res.ok) throw new Error('레드팀 응답 실패');
      const data = await res.json();

      setRedTeamSession((prev) => ({
        ...prev,
        messages: [
          ...newMessages,
          {
            id: 'msg_rt_' + Date.now(),
            role: 'model',
            content: data.reply,
            timestamp: data.timestamp || new Date().toISOString(),
          },
        ],
      }));
    } catch (err: any) {
      alert(err.message || '레드팀 대화 중 오류 발생');
    } finally {
      setIsSendingRedTeam(false);
    }
  };

  const handleSendRedTeamMessage = async (userText: string) => {
    await handleSendRedTeamMessageWithContent(userText, currentAnalysis);
  };

  // Evaluate Thesis
  const handleEvaluateThesis = async () => {
    setIsEvaluatingThesis(true);
    try {
      const res = await fetch('/api/evaluate-thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thesis: redTeamSession.userThesis,
          conversation: redTeamSession.messages,
          engineConfig,
        }),
      });
      if (!res.ok) throw new Error('평가 생성 실패');
      const data = await res.json();

      setRedTeamSession((prev) => ({
        ...prev,
        critiqueSummary: data,
      }));
    } catch (err: any) {
      alert(err.message || '논리 채점 중 오류');
    } finally {
      setIsEvaluatingThesis(false);
    }
  };

  const handleResetRedTeam = () => {
    if (confirm('현재 레드팀 토론을 초기화하고 새 주제를 시작하시겠습니까?')) {
      setRedTeamSession({
        id: 'session_' + Date.now(),
        topic: currentAnalysis ? currentAnalysis.headline : '',
        userThesis: '',
        messages: [],
      });
    }
  };

  // Bull vs Bear Contrast operations (대조 학습 엔진)
  const handleRunContrast = async (topic: string, context?: string) => {
    setIsLoadingContrast(true);
    try {
      const res = await fetch('/api/bull-bear-contrast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context, engineConfig }),
      });
      if (!res.ok) throw new Error('대조 분석 생성 실패');
      const data: BullBearComparisonResult = await res.json();
      setCurrentContrast(data);
      localStorage.setItem(STORAGE_KEYS.CONTRAST, JSON.stringify(data));
    } catch (err: any) {
      console.error('Bull-Bear contrast error:', err);
      alert(err.message || '대조 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingContrast(false);
    }
  };

  const handleSaveContrastToKnowledge = (contrast: BullBearComparisonResult) => {
    const newItem: KnowledgeItem = {
      id: 'contrast_' + Date.now(),
      title: `[Bull vs Bear 대조] ${contrast.topic}`,
      type: 'analysis',
      content: `[개요]: ${contrast.overview}\n\n` +
        `[🟢 강세론(Bullish 관점)]:\n` +
        `- 핵심 가설: ${contrast.bullish.thesis}\n` +
        `- 상승 촉매: ${contrast.bullish.catalysts.join(' / ')}\n` +
        `- 자본 이동: ${contrast.bullish.capitalFlow}\n` +
        `- 수혜 자산: ${contrast.bullish.favoredAssets.join(', ')}\n` +
        `- 기대 전망: ${contrast.bullish.potentialOutlook}\n\n` +
        `[🔴 약세론(Bearish 관점)]:\n` +
        `- 핵심 가설: ${contrast.bearish.thesis}\n` +
        `- 하방 위험 촉매: ${contrast.bearish.catalysts.join(' / ')}\n` +
        `- 자본 유출 경로: ${contrast.bearish.capitalFlow}\n` +
        `- 방어 자산: ${contrast.bearish.favoredAssets.join(', ')}\n` +
        `- 위험 전망: ${contrast.bearish.potentialOutlook}\n\n` +
        `[⚡ 정면 충돌 본질 쟁점]: ${contrast.coreControversy}\n` +
        `[🎯 결정적 분기 트리거]: ${contrast.pivotTriggers.join(' / ')}\n\n` +
        `[⚖️ 입체적 정반합 제언]: ${contrast.dialecticTakeaway}`,
      tags: ['대조학습', 'BullvsBear', '양방향사고', contrast.topic.split(' ')[0] || '거시경제'],
      macroCategory: '대조학습/매크로',
      sentiment: 'Neutral/Complex',
      createdAt: new Date().toISOString(),
    };

    setKnowledgeItems((prev) => [newItem, ...prev]);
    alert('Bull vs Bear 대조 분석 리포트가 지식 서고에 보관되었습니다.');
  };

  const handleStartRedTeamWithThesis = (topic: string, thesis: string) => {
    const thesisSeed = `[${topic}]에 대하여: "${thesis}"`;
    setRedTeamSession({
      id: 'session_' + Date.now(),
      topic,
      userThesis: thesisSeed,
      messages: [
        {
          id: 'msg_initial',
          role: 'user',
          content: thesisSeed,
          timestamp: new Date().toISOString(),
        }
      ],
    });
    setActiveTab('redteam');
    handleSendRedTeamMessageWithContent(thesisSeed, currentAnalysis);
  };

  const handleNavigateToContrast = (topic: string) => {
    setActiveTab('contrast');
    if (topic && topic !== currentContrast?.topic) {
      handleRunContrast(topic);
    }
  };

  const handleSaveRedTeamToKnowledge = (session: RedTeamSession) => {
    const newItem: KnowledgeItem = {
      id: 'session_k_' + Date.now(),
      title: `[레드팀 토론] ${session.topic || '경제 가설 검증'}`,
      type: 'conversation',
      content: `[사용자 가설]: ${session.userThesis}\n\n` +
        session.messages.map((m) => `(${m.role === 'user' ? '나' : '레드팀'}): ${m.content}`).join('\n\n') +
        (session.critiqueSummary ? `\n\n[종합 평가 점수]: ${session.critiqueSummary.thesisScore}점\n[통찰]: ${session.critiqueSummary.finalSynthesis}` : ''),
      tags: ['레드팀토론', '논리검증', '확증편향탈피'],
      macroCategory: '종합/사고훈련',
      sentiment: 'Neutral/Complex',
      createdAt: new Date().toISOString(),
    };

    setKnowledgeItems((prev) => [newItem, ...prev]);
    alert('레드팀 토론 기록이 지식 서고에 보관되었습니다.');
  };

  // Knowledge Hub operations
  const handleAddKnowledgeItem = (item: Omit<KnowledgeItem, 'id' | 'createdAt'>) => {
    const newItem: KnowledgeItem = {
      ...item,
      id: 'know_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setKnowledgeItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteKnowledgeItem = (id: string) => {
    if (confirm('이 지식 자료를 서고에서 삭제하시겠습니까?')) {
      setKnowledgeItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleUpdateKnowledgeItem = (updated: KnowledgeItem) => {
    setKnowledgeItems((prev) => prev.map((item) => item.id === updated.id ? updated : item));
  };

  const handleLoadIntoPrism = (item: KnowledgeItem) => {
    setActiveTab('prism');
    handleRunAnalysis(item.title, item.content);
  };

  const handleCurateRelated = async (item: KnowledgeItem) => {
    const res = await fetch('/api/curate-related', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentTopic: item.title,
        contentSnippet: item.content,
        existingTags: item.tags,
        engineConfig,
      }),
    });
    if (!res.ok) throw new Error('연관 자료 탐색 실패');
    const result = await res.json();
    return deduplicateCuratedBundle(item.curatedBundle, result);
  };

  // Data Export & Import
  const handleExportData = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      currentAnalysis,
      currentContrast,
      redTeamSession,
      knowledgeItems,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `EcoSight_Archive_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.currentAnalysis) setCurrentAnalysis(parsed.currentAnalysis);
        if (parsed.currentContrast) setCurrentContrast(parsed.currentContrast);
        if (parsed.redTeamSession) setRedTeamSession(parsed.redTeamSession);
        if (parsed.knowledgeItems && Array.isArray(parsed.knowledgeItems)) {
          setKnowledgeItems((prev) => deduplicateKnowledgeItems([...parsed.knowledgeItems, ...prev]));
        }
        alert('데이터를 성공적으로 불러왔습니다.');
      } catch (err) {
        alert('유효하지 않은 백업 파일 형식입니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('모든 학습 데이터와 지식 서고를 초기 프리셋 상태로 리셋하시겠습니까?')) {
      localStorage.clear();
      setCurrentAnalysis(INITIAL_SAMPLE_ANALYSIS);
      setCurrentContrast(INITIAL_SAMPLE_CONTRAST);
      setRedTeamSession({
        id: 'session_' + Date.now(),
        topic: '',
        userThesis: '',
        messages: [],
      });
      window.location.reload();
    }
  };

  const isCurrentAnalysisSaved = currentAnalysis
    ? knowledgeItems.some((k) => k.id === currentAnalysis.id)
    : false;

  const isCurrentContrastSaved = currentContrast
    ? knowledgeItems.some((k) => k.title.includes(currentContrast.topic))
    : false;

  return (
    <div id="ecosight-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        biasStats={biasStats}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
        savedItemCount={knowledgeItems.length}
        engineConfig={engineConfig}
        onOpenEngineModal={() => setIsEngineModalOpen(true)}
        onOpenTierModal={() => setIsTierModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'prism' && (
          <PrismAnalysisView
            currentAnalysis={currentAnalysis}
            onRunAnalysis={handleRunAnalysis}
            isLoading={isLoadingAnalysis}
            onSaveToKnowledge={handleSaveAnalysisToKnowledge}
            onStartRedTeam={handleStartRedTeam}
            onNavigateToContrast={handleNavigateToContrast}
            isSaved={isCurrentAnalysisSaved}
            errorMessage={analysisError}
            onClearError={() => setAnalysisError(null)}
          />
        )}

        {activeTab === 'contrast' && (
          <BullBearContrastView
            currentContrast={currentContrast}
            onRunContrast={handleRunContrast}
            isLoading={isLoadingContrast}
            onSaveToKnowledge={handleSaveContrastToKnowledge}
            onStartRedTeamWithThesis={handleStartRedTeamWithThesis}
            onJumpToPrism={(topic) => {
              setActiveTab('prism');
              handleRunAnalysis(topic, '');
            }}
            currentPrismTopic={currentAnalysis?.headline}
            isSaved={isCurrentContrastSaved}
          />
        )}

        {activeTab === 'redteam' && (
          <RedTeamChatView
            currentSession={redTeamSession}
            onSendMessage={handleSendRedTeamMessage}
            onEvaluateThesis={handleEvaluateThesis}
            onResetSession={handleResetRedTeam}
            onSaveSessionToKnowledge={handleSaveRedTeamToKnowledge}
            isEvaluating={isEvaluatingThesis}
            isSending={isSendingRedTeam}
            currentAnalysis={currentAnalysis}
            socraticLevel={socraticLevel}
            onChangeSocraticLevel={(lvl) => {
              setSocraticLevel(lvl);
              setRedTeamSession((prev) => ({ ...prev, socraticLevel: lvl }));
            }}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeHubView
            items={knowledgeItems}
            onAddItem={handleAddKnowledgeItem}
            onDeleteItem={handleDeleteKnowledgeItem}
            onUpdateItem={handleUpdateKnowledgeItem}
            onLoadIntoPrism={handleLoadIntoPrism}
            onCurateRelated={handleCurateRelated}
          />
        )}

        {activeTab === 'bias' && (
          <BiasBreakerView
            stats={biasStats}
            onSelectRecommendedTopic={(topic) => {
              setActiveTab('prism');
              handleRunAnalysis(topic, '');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>EcoSight (경제의 눈) &bull; &ldquo;돈을 쫓지 말고, 돈이 흐르는 길을 보라&rdquo;</p>
        <p className="text-[11px] text-slate-600 mt-1">
          확증 편향 제거 및 100년 금융 역사 거울 학습 엔진 &bull; 로컬 AI (Ollama / LM Studio) & Cloud AI 전환 가능
        </p>
      </footer>

      {/* AI Engine Settings Modal (Ollama, LM Studio, Gemini) */}
      <AIEngineModal
        isOpen={isEngineModalOpen}
        onClose={() => setIsEngineModalOpen(false)}
        config={engineConfig}
        onSaveConfig={(newConfig) => {
          setEngineConfig(newConfig);
          saveEngineConfig(newConfig);
        }}
      />

      {/* Subscription Tier 1/2/3 & Future Payment Extension Roadmap Modal */}
      <SubscriptionTierModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        currentEngineConfig={engineConfig}
        onOpenEngineModal={() => {
          setIsTierModalOpen(false);
          setIsEngineModalOpen(true);
        }}
      />
    </div>
  );
}
