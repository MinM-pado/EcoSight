import { PrismAnalysisResult, BullBearComparisonResult } from '../types';

export interface TopicPreset {
  id: string;
  title: string;
  category: string;
  sourceSnippet: string;
  tags: string[];
}

export const TOPIC_PRESETS: TopicPreset[] = [
  {
    id: 'preset_rate_cut',
    title: '미국 연준(Fed)의 기준금리 인하와 글로벌 유동성·환율 재편',
    category: '통화정책/금리',
    sourceSnippet: '연준의 금리 인하로 한미 금리차 축소 및 신흥국 유동성 유입 기대감이 있으나, 경기 침체(Recession) 신호인지 연착륙 보험인지 논란이 분분하다.',
    tags: ['연준', '기준금리', '환율', '신흥국', '유동성']
  },
  {
    id: 'preset_stock_overheated',
    title: '미국 주식 시장이 너무 과열된 것 같아 (빅테크 밸류에이션 논쟁)',
    category: '기술혁신/주식시장',
    sourceSnippet: 'S&P500 및 나스닥의 소수 빅테크 쏠림 현상과 역사적 고점 PER, 그리고 AI 잉여현금흐름(FCF) 회수 시점에 대한 거품론과 생산성 혁명론이 대립 중이다.',
    tags: ['미국주식', 'AI버블', 'PER', '빅테크', '과열']
  },
  {
    id: 'preset_china_economy',
    title: '중국 경제가 무너질 거라는데 진짜일까? (부동산 디플레이션과 공급망)',
    category: '지정학/디플레이션',
    sourceSnippet: '중국의 헝다·비구이위안 등 부동산 개발사 연쇄 디폴트, 지방정부 부채, 청년 실업률 급등과 글로벌 제조업 저가 덤핑 수출(디플레이션 수출) 파급효과.',
    tags: ['중국경제', '디플레이션', '부동산', '공급망', '지정학']
  },
  {
    id: 'preset_gold_rally',
    title: '금값이 계속 사상 최고가를 경신하는데 왜 그럴까? (탈달러화와 중앙은행 매집)',
    category: '외환/원자재',
    sourceSnippet: '금리 인하기 기대뿐 아니라 글로벌 중앙은행들의 탈달러(De-dollarization) 외환보유고 다변화, 미국 재정적자 폭증, 지정학적 블록화 위기감이 금 수요를 견인하고 있다.',
    tags: ['금값', '탈달러화', '중앙은행', '인플레이션', '원자재']
  },
  {
    id: 'preset_korea_realestate',
    title: '한국 부동산은 일본의 잃어버린 30년 전철을 밟을까?',
    category: '부동산/인구구조',
    sourceSnippet: '초저출산·초고령화 진입, 가계부채 임계치(GDP 대비 100%), 부동산 PF 부실 정리와 전세 제도의 독특한 레버리지 구조가 1990년대 일본 버블 붕괴와 대조되고 있다.',
    tags: ['한국부동산', '일본버블', '가계부채', '인구구조', '부동산PF']
  },
  {
    id: 'preset_ai_power',
    title: '빅테크 AI 데이터센터 폭증과 전력망·구리 원자재 인프라 병목',
    category: '기술혁신/원자재',
    sourceSnippet: '글로벌 테크 기업들의 AI 전력 수요가 폭증하며 발전소 증설, 송전망, 구리 및 원전 SMR 인프라로 자본 투자가 몰리고 있다.',
    tags: ['AI반도체', '전력인프라', '구리', '원자력', 'CAPEX']
  }
];

export const INITIAL_SAMPLE_ANALYSIS: PrismAnalysisResult = {
  id: 'sample_analysis_1',
  timestamp: new Date().toISOString(),
  headline: '미국 연준(Fed) 기준금리 인하 개시: 유동성 완화의 이면에 도사린 환율 및 수익성 변곡점',
  sourceSnippet: '연준이 정책금리를 인하하며 통화 긴축 국면을 종료하고 중립금리로의 회귀를 시도하고 있다.',
  coreMechanism: '중앙은행의 조달 비용 완화는 단기 채권 금리를 낮추고 은행의 대출 여력을 자극하지만, 실물 경기 침체 신호와 겹칠 경우 위험자산의 변동성을 촉발하며 국가 간 금리차에 따른 외환 포지션 청산을 야기한다.',
  macroCategory: '통화정책/금리',
  sentiment: 'Neutral/Complex',
  scope: 'Macro (거시)',
  affectedSectors: ['금융/은행', '신재생/성장주', '부동산 리츠', '수출제조업'],
  geographicFocus: ['미국', '한국', '신흥국'],
  rippleEffect: {
    level1Direct: '단기 국채 금리 급락, 달러화 약세 압력, 채권형 ETF 자금 대규모 유입',
    level2Transmission: '국가 간 내외 금리차 축소로 환율 안정화 기대감 vs 고환율 장기화로 인한 수입 물가 전이 시차 발생',
    level3Domino: '실물경기 둔화가 현실화될 경우 이익 추정치 하향 조정과 맞물려 성장주 멀티플 디레이팅(De-rating) 발생 위험',
    nodes: [
      {
        step: 1,
        stage: '1st Order',
        title: '기준금리 인하 & 단기물 금리 급락',
        description: '연준의 금리 인하로 자금 차입비용 즉각 하락, 머니마켓펀드(MMF)에서 채권 및 주식으로 자금 이동 시작',
        category: '통화정책',
        impactType: 'positive'
      },
      {
        step: 2,
        stage: '2nd Order',
        title: '달러 약세 & 신흥국 통화 방어 여력 확보',
        description: '강달러 압박에 시달리던 신흥국 중앙은행들의 독립적 금리 인하 룸 확대, 기업 이자비용 경감',
        category: '외환/신용',
        impactType: 'positive'
      },
      {
        step: 3,
        stage: '3rd Order',
        title: '엔 캐리 트레이드 언와인딩 & 자산 재평가 충격',
        description: '미-일 금리차 급축소 시 저금리 엔화로 조달된 글로벌 고수익 레버리지 자산이 일제히 매도되는 유동성 긴축 충격',
        category: '글로벌 유동성',
        impactType: 'volatile'
      }
    ]
  },
  devilsAdvocate: {
    consensusView: '금리 인하는 유동성을 공급하므로 주식, 코인, 부동산 등 모든 위험자산에 무조건 호재다.',
    contrarianRisk: '역사적으로 연준의 첫 번째 금리 인하는 대다수 "경기 침체(Recession)" 진입의 신호탄이었으며, 침체가 동반된 인하기에는 주가가 평균 -20~30% 폭락한 바 있다.',
    uncomfortableQuestions: [
      '이번 인하는 연착륙을 축하하는 "보험성 인하"인가, 아니면 고용 붕괴를 뒤늦게 수습하는 "비명 인하"인가?',
      '원자재 공급망 불안이 잔존하는 상태에서 조기 금리 인하가 1970년대식 2차 인플레이션을 부르지 않는다고 확신할 수 있는가?',
      '빅테크 기업들의 AI 설비투자 잉여현금흐름이 대출금리 하락으로 정당화될 만큼 수익화 모델이 검증되었는가?'
    ],
    riskIndicators: ['미국 비농업 고용 및 실업률(샴의 법칙 지표)', '하이일드 채권 스프레드', '엔/달러 환율 변동성']
  },
  structuralView: {
    verdict: '구조적 추세 (Secular Shift)',
    timeHorizon: '3~5년 고비용-고물가 고착화 사이클',
    structuralDrivers: [
      '탈세계화(De-globalization) 및 공급망 다변화 비용 증가',
      '선진국 고령화로 인한 구조적 노동력 부족 및 임금 하방경직성',
      '전 세계적 재정적자 누적과 국채 발행 물량의 만성적 초과'
    ],
    explanation: '0% 제로금리 시대로의 복귀는 불가능하며, "Higher for Longer" 수준에서 구조적으로 높은 중립금리(R*) 환경에 적응해야 하는 패러다임 전환기입니다.'
  },
  historicalMirror: {
    eventTitle: '1995년 연준의 선제적 금리 인하 (그린스펀의 연착륙 성공 신화)',
    period: '1995~1996년',
    trigger: '1994년 1년 만에 금리를 300bp 급격히 올린 후, 경기 급랭 조짐이 보이자 신속히 75bp를 되돌려 인하함',
    similarities: [
      '인플레이션이 완만히 꺾이는 가운데 급격한 고용 붕괴 전에 선제적으로 대응함',
      '생산성 혁신(1995년 PC/인터넷 보급 vs 2024~2026년 생성형 AI 혁신)이 거시경제 하단을 지탱함'
    ],
    differences: [
      '1995년 미국은 재정 흑자 기조였으나, 현재는 GDP 대비 연방 부채 비율이 120%를 초과하는 심각한 재정 적자 상태',
      '1995년은 소련 붕괴 후 세계화의 황금기였으나, 현재는 지정학적 진영화와 관세 장벽이 고조된 탈세계화 국면'
    ],
    lessons: '금리 인하 그 자체보다 중요한 것은 "생산성 향상"이 물가를 억누르고 기업 실적을 방어할 수 있는가 여부였습니다. 인하 후 무작정 매수가 아닌, 실질 이익이 증가하는 섹터로의 차별화된 머니무브를 주시해야 합니다.'
  }
};

export const INITIAL_SAMPLE_CONTRAST: BullBearComparisonResult = {
  id: 'sample_contrast_1',
  topic: '미국 연준(Fed) 기준금리 인하와 글로벌 유동성 재편',
  timestamp: new Date().toISOString(),
  overview: '기준금리 인하 국면을 바라보는 시장의 시각은 "유동성 공급에 따른 자산 랠리 지속(골디락스)"과 "경기 둔화 및 침체 방어용 긴급 인하(경착륙 리스크)"로 팽팽하게 양분되어 있습니다.',
  bullish: {
    thesis: '선제적 보험성 금리 인하로 금융 비용이 경감되고, 막대한 MMF 대기성 자금이 위험자산으로 이동하며 새로운 유동성 확장 국면(골디락스)이 전개된다.',
    catalysts: [
      '기업의 차입 비용 및 이자 상환 부담 완화로 잉여현금흐름(FCF)과 설비투자 여력 개선',
      '연 5%대 MMF에 묶여 있던 6조 달러 이상의 글로벌 현금 유동성이 채권 및 주식으로 재유입',
      '소비자 대출 및 모기지 금리 안정화로 가계 가처분 소득 방어 및 소비 진작'
    ],
    capitalFlow: '안전자산(초단기 국채, MMF) → 빅테크 성장주, 고배당 리츠, 신흥국 주식 및 인프라 자산으로 자본 이동 가속',
    favoredAssets: ['빅테크 및 기술 성장주', '상업용/주거용 부동산 리츠', '하이일드 채권', '금(Gold)'],
    keyIndicators: ['미국 국채 2년물/10년물 금리 스프레드 정상화', '기업 설비투자(CAPEX) 반등 지표', '개인소비지출(PCE) 안정세'],
    potentialOutlook: '밸류에이션 리레이팅과 풍부한 유동성 효과로 주요 증시 지수 15~20% 추가 상승 여력'
  },
  bearish: {
    thesis: '역사적으로 중앙은행의 첫 금리 인하는 "경기 침체(Recession)의 공식 신호탄"이었으며, 실업률 상승과 기업 실적 둔화가 유동성 착시를 압도할 것이다.',
    catalysts: [
      '금리 인하에도 불구하고 고용 지표 둔화(삼의 법칙 작동 등)로 실물 소비 및 기업 매출 위축',
      '미-일 내외 금리차 축소에 따른 글로벌 "엔 캐리 트레이드 청산" 변동성 쇼크',
      '고금리 장기화의 누적 충격으로 한계 기업 및 상업용 부동산 대출 부실화 수면 위 부상'
    ],
    capitalFlow: '고평가 주식 및 취약 크레딧 → 미국 중장기 국채, 현금성 달러, 방어주(필수소비재/유틸리티)로 긴급 피신',
    favoredAssets: ['미국 장기 국채(TLT)', '엔화 및 스위스 프랑', '배당 방어주(헬스케어, 통신)', '현금 비중 확대'],
    keyIndicators: ['미국 실업률 상승 속도', '하이일드 채권 부도율 및 스프레드 급등', '제조업 ISM 지수 50 하회 지속 여부'],
    potentialOutlook: '실적 추정치 하향(EPS 감익)과 밸류에이션 멀티플 축소로 자산 가격 15~25% 조정 위험'
  },
  coreControversy: '이번 금리 인하가 "1995년형 선제적 소프트랜딩(골디락스)"인가, 아니면 "2001/2007년형 뒤늦은 경기침체 방어(경착륙)"인가?',
  pivotTriggers: [
    '비농업 고용자 수 및 실업률의 급격한 악화 여부',
    '달러-엔 환율의 급격한 엔고 전환 및 글로벌 헤지펀드 청산 물량',
    '주요 빅테크 기업들의 분기별 실적 가이던스 방어 여부'
  ],
  dialecticTakeaway: '금리 인하라는 단일 현상에 도취되지 말고, 인하의 동기가 "인플레이션 둔화"인지 "경기 냉각"인지를 매월 고용/소비 데이터로 검증하며 양방향 리스크 헤지를 구축해야 합니다.',
  isFallback: false
};
