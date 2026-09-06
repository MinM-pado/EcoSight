export interface RippleNode {
  step: number;
  stage: '1st Order' | '2nd Order' | '3rd Order';
  title: string;
  description: string;
  category: string;
  impactType: 'positive' | 'negative' | 'volatile' | 'neutral';
}

export interface HistoricalMatch {
  eventTitle: string;
  period: string;
  trigger: string;
  similarities: string[];
  differences: string[];
  lessons: string;
}

export interface PrismAnalysisResult {
  id: string;
  timestamp: string;
  headline: string;
  sourceSnippet?: string;
  coreMechanism: string;
  macroCategory: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral/Complex';
  scope: 'Macro (거시)' | 'Micro (미시/산업)';
  affectedSectors: string[];
  geographicFocus: string[];
  
  // F01 - Sub components
  rippleEffect: {
    level1Direct: string;
    level2Transmission: string;
    level3Domino: string;
    nodes: RippleNode[];
  };
  devilsAdvocate: {
    consensusView: string;
    contrarianRisk: string;
    uncomfortableQuestions: string[];
    riskIndicators: string[];
  };
  structuralView: {
    verdict: '일시적 소음 (Noise)' | '구조적 추세 (Secular Shift)';
    timeHorizon: string;
    structuralDrivers: string[];
    explanation: string;
  };

  // F02 - Historical Mirror
  historicalMirror: HistoricalMatch;
  
  // F07 - Indicator & Grounding Verifier
  macroIndicators?: MacroIndicator[];
  sourceGroundings?: SourceGrounding[];

  isFallback?: boolean;
}

export interface ThesisReview {
  targetDate?: string;
  originalThesis: string;
  realizedOutcome?: string;
  outcomeStatus?: 'pending' | 'accurate' | 'partial' | 'inaccurate';
  retrospectiveLessons?: string;
  reviewedAt?: string;
}

export interface CuratedBundle {
  curatedSummary: string;
  antiConsensus: {
    title: string;
    perspective: string;
    sourceOrRationale: string;
  }[];
  crossMacroThemes: {
    theme: string;
    impactAnalysis: string;
    watchIndicators: string[];
  }[];
  historicalCases: {
    title: string;
    period: string;
    relevance: string;
    keyTakeaway: string;
  }[];
  recommendedTags: string[];
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  formattedValue: string;
  sourceNote?: string;
}

export interface MacroIndicator {
  id: string;
  name: string;
  code: string;
  category: 'Interest' | 'FX' | 'Inflation' | 'Commodity' | 'Market';
  currentValue: string;
  unit: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  period: string;
  high52w: string;
  low52w: string;
  sparkline: number[];
  source: string;
  description: string;
  relevanceToTopic?: string;
  officialSeriesId?: string;
  apiProvider?: 'FRED' | 'ECOS' | 'BLS' | 'EIA' | 'ICE';
  timeSeries?: TimeSeriesPoint[];
}

export interface SourceGrounding {
  title: string;
  publisher: string;
  referenceUrl?: string;
  dateOrPeriod: string;
  keyStat: string;
  reliabilityBadge: 'Official Fed' | 'Gov Bureau' | 'Central Bank' | 'Academic' | 'Market Consensus';
}

export interface RedTeamMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
  socraticQuestion?: string;
  challengerTone?: 'mild' | 'intense' | 'socratic';
  groundingSources?: SourceGrounding[];
}

export type SocraticLevel = 'guided' | 'standard' | 'expert';

export interface RedTeamSession {
  id: string;
  analysisId?: string;
  topic: string;
  userThesis: string;
  socraticLevel?: SocraticLevel;
  messages: RedTeamMessage[];
  critiqueSummary?: {
    thesisScore: number; // 0 - 100
    scoreAnalysis?: string; // 반론 대응 능력 및 데이터 기반 논리성 채점평
    blindSpots: string[]; // 1. 생각의 균열과 맹점 발견 (Blind Spots)
    strengths: string[]; // 돋보인 통찰 및 논리적 강점
    evolvedThesis?: string; // 2. 정반합(Thesis-Antithesis-Synthesis)을 통한 논리 재건 가설
    finalSynthesis: string; // 3. 최종 종합 지혜 (Synthesis) 레포트
  };
}

export interface WatermarkConfig {
  enabled: boolean;
  phrase: string;
  style: 'diagonal' | 'center' | 'bottom';
  opacity: number; // e.g. 0.06
}

export interface KnowledgeItem {
  id: string;
  title: string;
  type: 'analysis' | 'conversation' | 'note' | 'uploaded_file';
  content: string;
  tags: string[];
  macroCategory: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral/Complex';
  scope?: 'Macro (거시)' | 'Micro (미시/산업)';
  sector?: string;
  createdAt: string;
  sourceUrl?: string;
  thesisReview?: ThesisReview;
  curatedBundle?: CuratedBundle;
  relatedInsights?: {
    historicalParallels: string[];
    counterTheses: string[];
    keyWatchlist: string[];
  };
}

export interface BiasBreakerStats {
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  macroCount: number;
  microCount: number;
  sectorDistribution: Record<string, number>;
  countryDistribution: Record<string, number>;
  biasWarning?: string;
  suggestedTopics: {
    title: string;
    reason: string;
    category: string;
  }[];
}

export interface BullBearPerspective {
  thesis: string;
  catalysts: string[];
  capitalFlow: string;
  favoredAssets: string[];
  keyIndicators: string[];
  potentialOutlook: string;
}

export interface BullBearComparisonResult {
  id: string;
  topic: string;
  timestamp: string;
  overview: string;
  bullish: BullBearPerspective;
  bearish: BullBearPerspective;
  coreControversy: string;
  pivotTriggers: string[];
  dialecticTakeaway: string;
  macroIndicators?: MacroIndicator[];
  sourceGroundings?: SourceGrounding[];
  isFallback?: boolean;
}

export type LLMProvider = 'gemini' | 'ollama' | 'lmstudio' | 'custom';

export interface AIEngineConfig {
  provider: LLMProvider;
  ollamaEndpoint: string;
  ollamaModel: string;
  lmStudioEndpoint: string;
  lmStudioModel: string;
  customEndpoint: string;
  customModel: string;
  customApiKey?: string;
  temperature?: number;
}

export interface AIEngineTestResult {
  success: boolean;
  latencyMs?: number;
  modelUsed?: string;
  message: string;
  guide?: string;
  isDirectClientTested?: boolean;
}
