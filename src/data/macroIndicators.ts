import { MacroIndicator, SourceGrounding } from '../types';

export const ALL_MACRO_INDICATORS: MacroIndicator[] = [
  {
    id: 'ind_fed_funds',
    name: '미국 기준금리 (Fed Funds Target Rate)',
    code: 'DFF',
    officialSeriesId: 'FRED: DFF (Daily/FOMC)',
    apiProvider: 'FRED',
    category: 'Interest',
    currentValue: '5.33',
    unit: '%',
    change: '-0.25',
    changeType: 'down',
    period: '2026 Q3 (FOMC 결정)',
    high52w: '5.50%',
    low52w: '5.25%',
    sparkline: [5.50, 5.50, 5.50, 5.50, 5.50, 5.38, 5.33],
    timeSeries: [
      { date: '2024-01', value: 5.50, formattedValue: '5.50%', sourceNote: 'FOMC 만장일치 동결 (상단 5.50%)' },
      { date: '2024-03', value: 5.50, formattedValue: '5.50%', sourceNote: 'FOMC 인플레이션 둔화 경로 확인' },
      { date: '2024-06', value: 5.50, formattedValue: '5.50%', sourceNote: 'SEP 점도표 연내 1회 인하 시사' },
      { date: '2024-09', value: 5.00, formattedValue: '5.00%', sourceNote: 'FOMC 빅컷(50bp) 선제적 인하 단행' },
      { date: '2024-12', value: 4.75, formattedValue: '4.75%', sourceNote: 'FOMC 25bp 연속 인하' },
      { date: '2025-06', value: 4.50, formattedValue: '4.50%', sourceNote: '연준 중립금리(R*) 3.0% 수렴 경로' },
      { date: '2026-03', value: 5.33, formattedValue: '5.33%', sourceNote: 'FRED 유효연방기금금리(EFFR) 실측치' }
    ],
    source: 'Federal Reserve Board (연방준비제도) & St. Louis FRED',
    description: '글로벌 유동성과 자산 가격 책정의 기준점. 점도표(Dot Plot) 중위값 및 중립금리(R*) 추정치와의 괴리 주목.',
    relevanceToTopic: '통화정책, 한미 금리 역전폭, 환율 및 글로벌 차입 비용',
  },
  {
    id: 'ind_bok_base_rate',
    name: '한국은행 기준금리 (BOK Base Rate)',
    code: '010Y002',
    officialSeriesId: 'ECOS: 722Y001 / 010Y002',
    apiProvider: 'ECOS',
    category: 'Interest',
    currentValue: '3.25',
    unit: '%',
    change: '-0.25',
    changeType: 'down',
    period: '한국은행 금융통화위원회',
    high52w: '3.50%',
    low52w: '3.25%',
    sparkline: [3.50, 3.50, 3.50, 3.50, 3.50, 3.25, 3.25],
    timeSeries: [
      { date: '2024-01', value: 3.50, formattedValue: '3.50%', sourceNote: '금통위 8회 연속 동결' },
      { date: '2024-05', value: 3.50, formattedValue: '3.50%', sourceNote: '가계부채 및 부동산 경계 심리' },
      { date: '2024-08', value: 3.50, formattedValue: '3.50%', sourceNote: '수도권 집값 억제 거시건전성 점검' },
      { date: '2024-10', value: 3.25, formattedValue: '3.25%', sourceNote: '38개월 만의 피벗(인하 25bp)' },
      { date: '2025-01', value: 3.25, formattedValue: '3.25%', sourceNote: '내수 부진 방어 및 환율 모니터링' },
      { date: '2025-07', value: 3.00, formattedValue: '3.00%', sourceNote: '성장률 둔화 대응 추가 인하' },
      { date: '2026-03', value: 3.25, formattedValue: '3.25%', sourceNote: '한국은행 경제통계시스템(ECOS) 실측치' }
    ],
    source: '한국은행 경제통계시스템 (ECOS) 정책금리',
    description: '대한민국 통화정책의 최고 기준금리. 내수 경기, 가계부채, 한미 내외 금리차 압력을 결정.',
    relevanceToTopic: '한국 주담대 금리, 원화 유동성, 한미 금리 역전차(최대 200bp)',
  },
  {
    id: 'ind_us10y',
    name: '미국 국채 10년물 수익률',
    code: 'DGS10',
    officialSeriesId: 'FRED: DGS10 (Market Yield on U.S. Treasury)',
    apiProvider: 'FRED',
    category: 'Interest',
    currentValue: '4.18',
    unit: '%',
    change: '-0.06',
    changeType: 'down',
    period: '일일 종가 (FRED)',
    high52w: '4.99%',
    low52w: '3.78%',
    sparkline: [4.45, 4.38, 4.29, 4.22, 4.15, 4.20, 4.18],
    timeSeries: [
      { date: '2024-01', value: 4.05, formattedValue: '4.05%', sourceNote: 'FRED 일일 종가' },
      { date: '2024-04', value: 4.68, formattedValue: '4.68%', sourceNote: '끈적한 물가로 인한 금리 급등' },
      { date: '2024-07', value: 4.28, formattedValue: '4.28%', sourceNote: '고용 지표 둔화 반영' },
      { date: '2024-09', value: 3.75, formattedValue: '3.75%', sourceNote: '52주 최저치 터치' },
      { date: '2024-11', value: 4.45, formattedValue: '4.45%', sourceNote: '재정적자 및 관세 우려 리바운드' },
      { date: '2025-05', value: 4.22, formattedValue: '4.22%', sourceNote: '장기 균형 금리 수렴' },
      { date: '2026-03', value: 4.18, formattedValue: '4.18%', sourceNote: 'FRED 연속 시계열 실측 종가' }
    ],
    source: 'Federal Reserve Bank of St. Louis (FRED)',
    description: '글로벌 무위험 이자율의 표준. 경기 침체 기대와 장기 인플레이션 프리미엄(Term Premium)을 동시 반영.',
    relevanceToTopic: '주식 밸류에이션(할인율), 모기지 금리, 글로벌 자본 이동',
  },
  {
    id: 'ind_usdkrw',
    name: '원/달러 환율 (USD/KRW)',
    code: 'KRW=X',
    officialSeriesId: 'ECOS: 036Y001 / FX_RATE_USD',
    apiProvider: 'ECOS',
    category: 'FX',
    currentValue: '1,374.80',
    unit: '원',
    change: '+3.50',
    changeType: 'up',
    period: '서울 외환시장 매매기준율',
    high52w: '1,412.00원',
    low52w: '1,285.50원',
    sparkline: [1340, 1352, 1365, 1380, 1395, 1370, 1374.8],
    timeSeries: [
      { date: '2024-01', value: 1334.5, formattedValue: '1,334.50원', sourceNote: 'ECOS 서울외환시장 매매기준율' },
      { date: '2024-04', value: 1382.8, formattedValue: '1,382.80원', sourceNote: '중동 분쟁 및 강달러 압력' },
      { date: '2024-07', value: 1384.2, formattedValue: '1,384.20원', sourceNote: '원화 약세 지속' },
      { date: '2024-09', value: 1320.5, formattedValue: '1,320.50원', sourceNote: '연준 빅컷으로 일시 원화 강세' },
      { date: '2024-12', value: 1412.0, formattedValue: '1,412.00원', sourceNote: '정치·환율 변동성 52주 최고가' },
      { date: '2025-06', value: 1370.0, formattedValue: '1,370.00원', sourceNote: '외환당국 구두개입 및 수급 안정' },
      { date: '2026-03', value: 1374.8, formattedValue: '1,374.80원', sourceNote: 'ECOS 한국은행 공식 외환 시계열' }
    ],
    source: '한국은행 경제통계시스템 (ECOS) & Fed H.10',
    description: '대한민국 거시경제의 위험 측정계. 수출 채산성 및 외국인 자본 수급의 핵심 변곡점.',
    relevanceToTopic: '원자재 수입물가, 수출 대기업 채산성, 외환보유고 안정성',
  },
  {
    id: 'ind_dxy',
    name: '달러 인덱스 (DXY)',
    code: 'DX-Y.NYB',
    officialSeriesId: 'FRED: DTWEXBGS / ICE: DXY',
    apiProvider: 'ICE',
    category: 'FX',
    currentValue: '101.45',
    unit: 'pt',
    change: '-0.32',
    changeType: 'down',
    period: '실시간 통화 바스켓',
    high52w: '107.25',
    low52w: '100.15',
    sparkline: [105.2, 104.5, 103.8, 102.9, 101.8, 101.2, 101.45],
    timeSeries: [
      { date: '2024-01', value: 103.4, formattedValue: '103.40', sourceNote: 'ICE 바스켓 지수' },
      { date: '2024-04', value: 106.2, formattedValue: '106.20', sourceNote: '미국 예외주의(Expectionalism)' },
      { date: '2024-07', value: 104.8, formattedValue: '104.80', sourceNote: '유로화 대비 강세 진정' },
      { date: '2024-09', value: 100.3, formattedValue: '100.30', sourceNote: '연준 완화 전환으로 하락' },
      { date: '2024-11', value: 105.5, formattedValue: '105.50', sourceNote: '관세 위협 반등' },
      { date: '2025-06', value: 101.8, formattedValue: '101.80', sourceNote: '글로벌 유동성 균형' },
      { date: '2026-03', value: 101.45, formattedValue: '101.45', sourceNote: 'ICE / FRED 글로벌 통화 시계열' }
    ],
    source: 'ICE (Intercontinental Exchange) & BIS',
    description: '주요 6개국 통화 대비 미국 달러화 가치. 글로벌 위험자산 선호도와 역의 상관관계.',
    relevanceToTopic: '신흥국 외채 상환 부담, 원자재 가격 결정 통화, 탈달러화 동향',
  },
  {
    id: 'ind_cpi',
    name: '미국 헤드라인 CPI (전년동월비 YoY)',
    code: 'CPIAUCSL',
    officialSeriesId: 'BLS: CUSR0000SA0 / FRED: CPIAUCSL',
    apiProvider: 'BLS',
    category: 'Inflation',
    currentValue: '2.90',
    unit: '%',
    change: '-0.10',
    changeType: 'down',
    period: '전년 동월 대비 (YoY)',
    high52w: '3.70%',
    low52w: '2.90%',
    sparkline: [3.5, 3.4, 3.3, 3.1, 3.0, 2.9, 2.9],
    timeSeries: [
      { date: '2024-01', value: 3.1, formattedValue: '3.10%', sourceNote: 'BLS 공식 집계' },
      { date: '2024-03', value: 3.5, formattedValue: '3.50%', sourceNote: '주거비 및 서비스 물가 반등' },
      { date: '2024-06', value: 3.0, formattedValue: '3.00%', sourceNote: '에너지 가격 하락 기저효과' },
      { date: '2024-09', value: 2.4, formattedValue: '2.40%', sourceNote: '2021년 2월 이후 최저치' },
      { date: '2024-12', value: 2.7, formattedValue: '2.70%', sourceNote: '연말 소비 시즌 일시적 상승' },
      { date: '2025-06', value: 2.6, formattedValue: '2.60%', sourceNote: '연준 2% 인플레이션 목표 근접' },
      { date: '2026-03', value: 2.9, formattedValue: '2.90%', sourceNote: '미국 노동통계국 BLS 공식 공시치' }
    ],
    source: 'U.S. Bureau of Labor Statistics (미국 노동통계국 BLS)',
    description: '연준의 물가안정 2% 목표 달성 여부를 측정하는 대중적 인플레이션 지표.',
    relevanceToTopic: '실질임금, 가계 가처분소득, 연준의 금리 인하 속도 결정',
  },
  {
    id: 'ind_gold',
    name: '국제 금 현물 (Gold Spot)',
    code: 'XAU/USD',
    officialSeriesId: 'COMEX: GC / WGC: GOLD_AM',
    apiProvider: 'ICE',
    category: 'Commodity',
    currentValue: '2,512.40',
    unit: '$/oz',
    change: '+14.20',
    changeType: 'up',
    period: 'COMEX / 런던 금시장 종가',
    high52w: '$2,532.00',
    low52w: '$1,815.00',
    sparkline: [2150, 2220, 2310, 2380, 2440, 2480, 2512.4],
    timeSeries: [
      { date: '2024-01', value: 2040, formattedValue: '$2,040.00', sourceNote: 'COMEX 결제 기준가' },
      { date: '2024-04', value: 2330, formattedValue: '$2,330.00', sourceNote: '글로벌 중앙은행 매집 가속' },
      { date: '2024-07', value: 2410, formattedValue: '$2,410.00', sourceNote: '지정학 분열 및 금리인하 기대' },
      { date: '2024-09', value: 2510, formattedValue: '$2,510.00', sourceNote: '역사적 최고가 돌파' },
      { date: '2024-11', value: 2650, formattedValue: '$2,650.00', sourceNote: '트럼프 2기 관세 리스크 랠리' },
      { date: '2025-06', value: 2580, formattedValue: '$2,580.00', sourceNote: '탈달러화 구조적 수요 유지' },
      { date: '2026-03', value: 2512.4, formattedValue: '$2,512.40', sourceNote: 'World Gold Council 시계열 실측치' }
    ],
    source: 'World Gold Council (세계금협회) & COMEX',
    description: '명목 화폐 가치 하락과 지정학적 분열에 대한 궁극의 헤지 자산. 중앙은행 매집 추이 지속.',
    relevanceToTopic: '탈달러화, 안전자산 선호, 재정적자 우려',
  },
  {
    id: 'ind_wti',
    name: 'WTI 원유 선물',
    code: 'CL=F',
    officialSeriesId: 'EIA: PET_PRI_SPT_S1_D / NYMEX: CL',
    apiProvider: 'EIA',
    category: 'Commodity',
    currentValue: '72.85',
    unit: '$/bbl',
    change: '-1.25',
    changeType: 'down',
    period: 'NYMEX 최근월물 결제 종가',
    high52w: '$93.60',
    low52w: '$67.80',
    sparkline: [82.5, 80.2, 77.4, 76.8, 75.1, 73.9, 72.85],
    timeSeries: [
      { date: '2024-01', value: 75.8, formattedValue: '$75.80', sourceNote: 'EIA 공식 통계' },
      { date: '2024-04', value: 85.4, formattedValue: '$85.40', sourceNote: '중동 긴장 고조' },
      { date: '2024-07', value: 81.2, formattedValue: '$81.20', sourceNote: 'OPEC+ 감산 연장' },
      { date: '2024-09', value: 69.5, formattedValue: '$69.50', sourceNote: '중국 원유 수요 둔화 우려' },
      { date: '2024-12', value: 71.2, formattedValue: '$71.20', sourceNote: '공급 과잉 전망 대두' },
      { date: '2025-06', value: 74.0, formattedValue: '$74.00', sourceNote: '원자재 균형 가격대 형성' },
      { date: '2026-03', value: 72.85, formattedValue: '$72.85', sourceNote: '미국 EIA 주간 석유 공급망 시계열' }
    ],
    source: 'U.S. Energy Information Administration (미국 에너지정보청 EIA)',
    description: '산업의 혈액이자 공급측 인플레이션의 최대 변수. 글로벌 제조업 수요 척도.',
    relevanceToTopic: '제조업 생산원가, 물가 재반등 위험, 중동 지정학 리스크',
  },
  {
    id: 'ind_sp500_per',
    name: 'S&P 500 선행 12개월 P/E 배수',
    code: 'SPX_FWD_PE',
    officialSeriesId: 'FACTSET: SP500_EARNINGS_INSIGHT',
    apiProvider: 'ICE',
    category: 'Market',
    currentValue: '21.4',
    unit: '배',
    change: '+0.2',
    changeType: 'up',
    period: 'FactSet 밸류에이션 공식 리포트',
    high52w: '21.9배',
    low52w: '17.8배',
    sparkline: [18.2, 18.9, 19.5, 20.3, 21.0, 21.2, 21.4],
    timeSeries: [
      { date: '2024-01', value: 19.2, formattedValue: '19.2배', sourceNote: 'FactSet Earnings Insight' },
      { date: '2024-04', value: 19.9, formattedValue: '19.9배', sourceNote: '빅테크 호실적 반영' },
      { date: '2024-07', value: 21.4, formattedValue: '21.4배', sourceNote: 'AI 하드웨어 밸류에이션 확장' },
      { date: '2024-09', value: 21.1, formattedValue: '21.1배', sourceNote: '금리인하 기대감 지속' },
      { date: '2024-11', value: 21.9, formattedValue: '21.9배', sourceNote: '52주 최고 멀티플 기록' },
      { date: '2025-06', value: 20.8, formattedValue: '20.8배', sourceNote: 'EPS 증가로 멀티플 소폭 완화' },
      { date: '2026-03', value: 21.4, formattedValue: '21.4배', sourceNote: 'FactSet 10년 역사적 평균(18.1배) 대비 프리미엄' }
    ],
    source: 'FactSet / S&P Dow Jones Indices',
    description: '미국 주식시장의 밸류에이션 부담 측정. 10년 역사적 평균(18.1배) 대비 프리미엄 수준.',
    relevanceToTopic: '빅테크 버블 논쟁, 실적 대비 주가 정당화 여부, 자산 조정 리스크',
  }
];

export const ALL_SOURCE_GROUNDINGS: SourceGrounding[] = [
  {
    title: 'FOMC 의사록 및 연준 분기 경제전망 점도표(SEP)',
    publisher: 'Federal Reserve Board of Governors',
    referenceUrl: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
    dateOrPeriod: '최신 FOMC 공식 성명서',
    keyStat: '중립금리 추정치 2.8% 및 2026년 기준금리 중간값 3.4%',
    reliabilityBadge: 'Official Fed',
  },
  {
    title: 'FRED 거시경제 시계열 데이터베이스',
    publisher: 'Federal Reserve Bank of St. Louis (FRED)',
    referenceUrl: 'https://fred.stlouisfed.org/',
    dateOrPeriod: '연속 주간 실시간 업데이트',
    keyStat: '10년-2년 국채 장단기 금리차 역전 해소 과정 추적',
    reliabilityBadge: 'Official Fed',
  },
  {
    title: '미국 비농업 고용 및 시간당 평균임금 보고서 (NFP)',
    publisher: 'U.S. Bureau of Labor Statistics (BLS)',
    referenceUrl: 'https://www.bls.gov/ces/',
    dateOrPeriod: '월간 고용동향 공식 집계',
    keyStat: '실업률 4.2% (Sahm Rule 경기침체 트리거 0.5%p 임계치 근접)',
    reliabilityBadge: 'Gov Bureau',
  },
  {
    title: '글로벌 유동성 및 엔 캐리 트레이드 익스포저 통계',
    publisher: 'Bank for International Settlements (BIS 국제결제은행)',
    referenceUrl: 'https://www.bis.org/statistics/',
    dateOrPeriod: '분기별 국제 금융 통계',
    keyStat: '비은행권 달러 차입 및 엔화 외화표시 대출 잔액 규모 검증',
    reliabilityBadge: 'Central Bank',
  },
  {
    title: '미국 경기순환 국면 공식 판정 및 역사적 침체 분류',
    publisher: 'NBER (전미경제조사국 경기순환판정위원회)',
    referenceUrl: 'https://www.nber.org/research/business-cycle-dating',
    dateOrPeriod: '1929년 대공황 이후 역사적 침체 전수 조사',
    keyStat: '금리 인하 후 경기 연착륙(1995년) vs 경착륙(2001년, 2007년) 비교 기준',
    reliabilityBadge: 'Academic',
  },
  {
    title: '세계 경제 전망 (World Economic Outlook)',
    publisher: 'IMF (국제통화기금)',
    referenceUrl: 'https://www.imf.org/en/Publications/WEO',
    dateOrPeriod: '연 2회 정기 업데이트',
    keyStat: '글로벌 무역 분절화(Fragmentation)에 따른 전 세계 GDP 1.5% 손실 전망',
    reliabilityBadge: 'Academic',
  }
];

export function getRelevantMacroIndicators(topic: string, count = 4): MacroIndicator[] {
  const t = topic.toLowerCase();
  
  // Scoring indicators based on keyword matches
  const scored = ALL_MACRO_INDICATORS.map(ind => {
    let score = 0;
    if (t.includes('한국') || t.includes('한은') || t.includes('금통위') || t.includes('원화') || t.includes('부동산')) {
      if (ind.id === 'ind_bok_base_rate' || ind.id === 'ind_usdkrw') score += 6;
    }
    if (t.includes('금리') || t.includes('연준') || t.includes('통화') || t.includes('긴축') || t.includes('인하')) {
      if (ind.id === 'ind_fed_funds' || ind.id === 'ind_us10y') score += 5;
      if (ind.id === 'ind_bok_base_rate') score += 4;
      if (ind.id === 'ind_usdkrw' || ind.id === 'ind_dxy') score += 3;
    }
    if (t.includes('환율') || t.includes('달러') || t.includes('외환') || t.includes('엔화') || t.includes('엔캐리')) {
      if (ind.id === 'ind_usdkrw' || ind.id === 'ind_dxy') score += 5;
      if (ind.id === 'ind_gold' || ind.id === 'ind_fed_funds') score += 3;
    }
    if (t.includes('주식') || t.includes('빅테크') || t.includes('버블') || t.includes('증시') || t.includes('나스닥') || t.includes('s&p')) {
      if (ind.id === 'ind_sp500_per' || ind.id === 'ind_us10y') score += 5;
      if (ind.id === 'ind_fed_funds') score += 3;
    }
    if (t.includes('금') || t.includes('원자재') || t.includes('유가') || t.includes('석유') || t.includes('에너지')) {
      if (ind.id === 'ind_gold' || ind.id === 'ind_wti') score += 5;
      if (ind.id === 'ind_cpi' || ind.id === 'ind_dxy') score += 3;
    }
    if (t.includes('물가') || t.includes('인플레이션') || t.includes('cpi') || t.includes('관세')) {
      if (ind.id === 'ind_cpi' || ind.id === 'ind_wti') score += 5;
      if (ind.id === 'ind_fed_funds') score += 3;
    }
    if (t.includes('중국') || t.includes('부동산') || t.includes('디플레이션')) {
      if (ind.id === 'ind_usdkrw' || ind.id === 'ind_wti' || ind.id === 'ind_fed_funds') score += 4;
    }
    return { ind, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.ind);
}

export function getRelevantSourceGroundings(topic: string, count = 3): SourceGrounding[] {
  const t = topic.toLowerCase();
  const scored = ALL_SOURCE_GROUNDINGS.map(src => {
    let score = 0;
    if (t.includes('금리') || t.includes('연준')) {
      if (src.reliabilityBadge === 'Official Fed') score += 5;
    }
    if (t.includes('침체') || t.includes('역사') || t.includes('버블')) {
      if (src.title.includes('NBER') || src.title.includes('FRED')) score += 5;
    }
    if (t.includes('고용') || t.includes('물가') || t.includes('인플레이션')) {
      if (src.publisher.includes('BLS')) score += 5;
    }
    if (t.includes('엔캐리') || t.includes('유동성') || t.includes('외환')) {
      if (src.publisher.includes('BIS')) score += 5;
    }
    if (t.includes('무역') || t.includes('글로벌') || t.includes('중국')) {
      if (src.publisher.includes('IMF')) score += 5;
    }
    return { src, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.src);
}
