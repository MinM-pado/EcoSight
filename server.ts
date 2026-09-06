import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { 
  ALL_MACRO_INDICATORS, 
  ALL_SOURCE_GROUNDINGS, 
  getRelevantMacroIndicators, 
  getRelevantSourceGroundings 
} from "./src/data/macroIndicators";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Fallback Model Chain for High Availability & Unlimited Quota
// gemini-3.1-flash-lite & gemini-flash-latest provide zero-friction instant responses and generous quotas
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

// Robust multi-model generator with graceful model failover
async function generateContentWithRetryAndFallback(params: {
  contents: any;
  config?: any;
}) {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      // Gracefully step to next candidate model without flooding logs
      continue;
    }
  }

  throw lastError;
}

interface EngineCallOptions {
  provider?: 'gemini' | 'ollama' | 'lmstudio' | 'custom';
  endpoint?: string;
  model?: string;
  apiKey?: string;
  temperature?: number;
}

// Universal Local (Ollama / LM Studio) or OpenAI-compatible caller
async function callLocalOrOpenAIEngine(params: {
  endpoint: string;
  model: string;
  apiKey?: string;
  systemInstruction?: string;
  userPrompt?: string;
  historyMessages?: Array<{ role: 'user' | 'model' | 'assistant' | 'system'; content: string }>;
  temperature?: number;
  jsonMode?: boolean;
}): Promise<string> {
  let url = params.endpoint.trim().replace(/\/+$/, "");
  if (!url.endsWith("/chat/completions")) {
    if (url.endsWith("/v1")) {
      url = `${url}/chat/completions`;
    } else {
      url = `${url}/v1/chat/completions`;
    }
  }

  const messages: any[] = [];
  if (params.systemInstruction) {
    messages.push({ role: "system", content: params.systemInstruction });
  }

  if (params.historyMessages && params.historyMessages.length > 0) {
    for (const m of params.historyMessages) {
      const role = m.role === 'model' ? 'assistant' : m.role;
      messages.push({ role, content: m.content });
    }
  }

  if (params.userPrompt) {
    messages.push({ role: "user", content: params.userPrompt });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (params.apiKey) {
    headers["Authorization"] = `Bearer ${params.apiKey}`;
  }

  const body: any = {
    model: params.model,
    messages,
    temperature: params.temperature ?? 0.3,
  };
  if (params.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for local responsiveness

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Local/OpenAI LLM Engine HTTP ${res.status}: ${errText.slice(0, 300)}`);
    }

    const data: any = await res.json();
    const content = data?.choices?.[0]?.message?.content || "";
    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Universal LLM dispatcher supporting Gemini Cloud, Ollama Local, LM Studio, and Custom OpenAI
async function executeUniversalLLM(params: {
  promptText: string;
  geminiContents: any;
  systemInstruction?: string;
  historyMessages?: Array<{ role: 'user' | 'model' | 'assistant' | 'system'; content: string }>;
  engineConfig?: any;
  jsonMode?: boolean;
  temperature?: number;
}): Promise<string> {
  const provider = params.engineConfig?.provider || "gemini";
  const isCloudEnvironment = !!process.env.K_SERVICE;

  if (provider === "ollama") {
    const endpoint = params.engineConfig?.ollamaEndpoint || params.engineConfig?.endpoint || "http://127.0.0.1:11434";
    const model = params.engineConfig?.ollamaModel || params.engineConfig?.model || "llama3.1";
    const isLocalhost = endpoint.includes("127.0.0.1") || endpoint.includes("localhost");

    // In a cloud container, 127.0.0.1/localhost points to the container itself (where Ollama does not run).
    // If running in cloud preview without a public tunnel, route directly to Gemini Cloud without network error.
    if (!isCloudEnvironment || !isLocalhost) {
      try {
        return await callLocalOrOpenAIEngine({
          endpoint,
          model,
          apiKey: params.engineConfig?.apiKey || params.engineConfig?.customApiKey,
          systemInstruction: params.systemInstruction,
          userPrompt: params.promptText,
          historyMessages: params.historyMessages,
          temperature: params.temperature ?? params.engineConfig?.temperature,
          jsonMode: params.jsonMode,
        });
      } catch (localErr: any) {
        console.log(`[Universal LLM] Ollama (${endpoint}) unavailable, smoothly routed to Gemini Cloud.`);
      }
    } else {
      console.log(`[Universal LLM] Cloud container detected: localhost Ollama (${endpoint}) routed to Gemini Cloud.`);
    }
  } else if (provider === "lmstudio") {
    const endpoint = params.engineConfig?.lmStudioEndpoint || params.engineConfig?.endpoint || "http://127.0.0.1:1234";
    const model = params.engineConfig?.lmStudioModel || params.engineConfig?.model || "local-model";
    const isLocalhost = endpoint.includes("127.0.0.1") || endpoint.includes("localhost");

    if (!isCloudEnvironment || !isLocalhost) {
      try {
        return await callLocalOrOpenAIEngine({
          endpoint,
          model,
          apiKey: params.engineConfig?.apiKey || params.engineConfig?.customApiKey,
          systemInstruction: params.systemInstruction,
          userPrompt: params.promptText,
          historyMessages: params.historyMessages,
          temperature: params.temperature ?? params.engineConfig?.temperature,
          jsonMode: params.jsonMode,
        });
      } catch (localErr: any) {
        console.log(`[Universal LLM] LM Studio (${endpoint}) unavailable, smoothly routed to Gemini Cloud.`);
      }
    } else {
      console.log(`[Universal LLM] Cloud container detected: localhost LM Studio (${endpoint}) routed to Gemini Cloud.`);
    }
  } else if (provider === "custom") {
    const endpoint = params.engineConfig?.customEndpoint || params.engineConfig?.endpoint || "http://127.0.0.1:11434/v1";
    const model = params.engineConfig?.customModel || params.engineConfig?.model || "llama3.1";
    const isLocalhost = endpoint.includes("127.0.0.1") || endpoint.includes("localhost");

    if (!isCloudEnvironment || !isLocalhost) {
      try {
        return await callLocalOrOpenAIEngine({
          endpoint,
          model,
          apiKey: params.engineConfig?.customApiKey || params.engineConfig?.apiKey,
          systemInstruction: params.systemInstruction,
          userPrompt: params.promptText,
          historyMessages: params.historyMessages,
          temperature: params.temperature ?? params.engineConfig?.temperature,
          jsonMode: params.jsonMode,
        });
      } catch (localErr: any) {
        console.log(`[Universal LLM] Custom OpenAI endpoint (${endpoint}) unavailable, smoothly routed to Gemini Cloud.`);
      }
    } else {
      console.log(`[Universal LLM] Cloud container detected: localhost Custom endpoint (${endpoint}) routed to Gemini Cloud.`);
    }
  }

  // Primary or Fallback: Gemini Cloud
  const geminiConfig: any = {};
  if (params.jsonMode) {
    geminiConfig.responseMimeType = "application/json";
  }
  if (params.systemInstruction) {
    geminiConfig.systemInstruction = params.systemInstruction;
  }
  if (params.temperature !== undefined) {
    geminiConfig.temperature = params.temperature;
  }

  const response = await generateContentWithRetryAndFallback({
    contents: params.geminiContents,
    config: geminiConfig,
  });
  return response.text || "";
}

// Safe JSON parser that strips markdown fences
function extractJson(text: string): any {
  if (!text) return {};
  const trimmed = text.trim();
  const cleaned = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.substring(start, end + 1));
    }
    throw new Error("Invalid JSON response from AI model");
  }
}

// Emergency Fallback Generator for Prism Analysis if all AI models are temporarily down
function buildEmergencyPrismFallback(topic: string, text: string) {
  const query = (topic + " " + text).toLowerCase();
  
  // Rate cut / FX / Fed
  if (query.includes("금리") || query.includes("연준") || query.includes("환율") || query.includes("인하") || query.includes("달러")) {
    return {
      headline: `[심층 분석] ${topic || "기준금리 변동과 글로벌 유동성 재편"}: 통화정책 완화 이면의 환율·신용 리스크`,
      coreMechanism: "중앙은행의 금리 인하는 차입 비용을 경감하고 유동성을 유입시키지만, 내외 금리차 축소에 따른 외환 시장 변동성과 경기 둔화 신호가 교차하며 실물 자산 가격의 재평가를 야기합니다.",
      macroCategory: "통화정책/금리",
      sentiment: "Neutral/Complex",
      scope: "Macro (거시)",
      affectedSectors: ["금융/은행", "수출제조업", "부동산 리츠", "성장주"],
      geographicFocus: ["미국", "한국", "신흥국"],
      rippleEffect: {
        level1Direct: "단기 국채 금리 급락, 정책금리 인하 반영, 외환시장 단기 변동성 확대",
        level2Transmission: "국가 간 내외 금리차 축소로 자본 이동 발생, 기업 이자보상배율 일부 개선 vs 수입물가 전이 시차",
        level3Domino: "실물 경기 둔화가 동반될 경우 이익 추정치 하향 및 고평가 자산의 디레이팅(De-rating) 촉발",
        nodes: [
          { step: 1, stage: "1st Order", title: "기준금리 변동", description: "단기 금융 시장 조달 금리 즉각 반응 및 유동성 채널 작동", category: "직접영향", impactType: "positive" },
          { step: 2, stage: "2nd Order", title: "환율 및 자금 재배치", description: "미-일, 미-한 금리차 변동에 따른 외환 포지션 청산 및 채권/주식 배분", category: "파급전이", impactType: "volatile" },
          { step: 3, stage: "3rd Order", title: "실물 신용 및 자산 리밸런싱", description: "한계기업 부실 처리와 최종 자산 가격의 구조적 분화", category: "최종나비효과", impactType: "neutral" }
        ]
      },
      devilsAdvocate: {
        consensusView: "금리 인하는 유동성을 공급하므로 주식, 부동산 등 모든 자산에 무조건 호재다.",
        contrarianRisk: "역사적으로 첫 번째 금리 인하는 경기 침체(Recession) 국면 진입 신호였던 경우가 빈번하며, 침체 동반 시 자산 가치는 추가 하락했습니다.",
        uncomfortableQuestions: [
          "이번 정책 전환은 경기 연착륙을 축하하는 보험인가, 둔화를 방어하기 위한 긴급 조치인가?",
          "글로벌 공급망 분절로 인해 인플레이션이 재점화될 가능성은 통제 가능한가?",
          "환율 변동에 노출된 수출 제조업체의 실질 영업이익률은 방어될 수 있는가?"
        ],
        riskIndicators: ["미국 실업률 및 고용 지표", "하이일드 채권 스프레드", "주요국 환율 변동성 지수(CVIX)"]
      },
      structuralView: {
        verdict: "구조적 추세 (Secular Shift)",
        timeHorizon: "3~5년 고비용-구조적 중립금리 상승 사이클",
        structuralDrivers: ["탈세계화에 따른 공급망 중복 투자 비용", "인구 고령화로 인한 노동비용 경직성", "각국 정부 부채 증가로 인한 국채 발행 물량"],
        explanation: "과거와 같은 제로금리 복귀는 어려우며, 구조적으로 높아진 중립금리 환경 속에서 자본 배분의 효율성을 재정의해야 합니다."
      },
      historicalMirror: {
        eventTitle: "1995년 연준의 선제적 금리 인하 (소프트 랜딩 사이클)",
        period: "1995~1996년",
        trigger: "인플레이션 안정 후 고용 둔화를 방어하기 위한 선제적 75bp 인하",
        similarities: ["경기가 완전 침체에 빠지기 전 중앙은행이 선제적 완화에 나섰다는 점"],
        differences: ["1995년에는 생산성 혁명(인터넷 보급) 초입이었으나, 현재는 지정학적 분절과 정부 부채 비율이 훨씬 높음"],
        lessons: "침체가 동반되지 않은 금리 인하는 자산 랠리를 견인하지만, 과도한 유동성은 후반부 버블 형성의 단초가 됨."
      }
    };
  }

  // Stock overvaluation / Big Tech / AI Bubble
  if (query.includes("주식") || query.includes("과열") || query.includes("빅테크") || query.includes("ai") || query.includes("증시") || query.includes("나스닥")) {
    return {
      headline: `[심층 분석] ${topic || "미국 주식 시장 과열 논쟁"}: AI 생산성 혁명론 vs 잉여현금흐름(FCF) 회수율의 충돌`,
      coreMechanism: "소수 빅테크의 AI 인프라 막대한 자본적 지출(CAPEX)이 반도체 생태계 매출을 견인하고 있으나, 소프트웨어 및 최종 서비스 단에서의 현금 회수 속도가 지연되면서 밸류에이션 정당성 시험대에 올랐습니다.",
      macroCategory: "기술혁신/반도체",
      sentiment: "Neutral/Complex",
      scope: "Micro (미시/산업)",
      affectedSectors: ["반도체/하드웨어", "클라우드/소프트웨어", "전력/에너지 인프라"],
      geographicFocus: ["미국", "대만", "한국"],
      rippleEffect: {
        level1Direct: "빅테크 및 고성장 AI 주식의 역사적 고점 PER 도달과 소수 종목 쏠림(Concentration Risk)",
        level2Transmission: "데이터센터 확충에 따른 전력망, 변압기, 원자력 및 구리 원자재 수요 급증과 비용 상승",
        level3Domino: "CAPEX 대비 실질 이익 전환율 저조 시 설비투자 축소로 이어지며 밸류체인 전반의 멀티플 축소 위험",
        nodes: [
          { step: 1, stage: "1st Order", title: "AI 인프라 투자 쏠림", description: "칩셋 및 서버 데이터센터로 조 단위 자금 집중", category: "직접영향", impactType: "positive" },
          { step: 2, stage: "2nd Order", title: "유틸리티 전력 병목", description: "인프라 가동을 위한 전력 및 송전망 확보 경쟁", category: "파급전이", impactType: "volatile" },
          { step: 3, stage: "3rd Order", title: "수익성 검증과 실적 차별화", description: "실질 잉여현금흐름을 창출하는 기업과 내러티브에 기댄 기업의 양극화", category: "최종나비효과", impactType: "neutral" }
        ]
      },
      devilsAdvocate: {
        consensusView: "생성형 AI는 인터넷에 필적하는 혁신이므로 밸류에이션 프리미엄은 얼마든지 정당화된다.",
        contrarianRisk: "과거 철도 버블이나 통신망 버블처럼, 인프라를 깐 기업들이 공급 과잉으로 파산한 뒤에야 실제 사용자 생태계가 개화했던 역사가 있습니다.",
        uncomfortableQuestions: [
          "최종 기업 고객들이 AI 도입을 통해 절감한 실제 비용이나 추가 매출 데이터가 명확한가?",
          "빅테크 간의 자사주 매입과 클라우드 매출 상호 순환 참조 구조에 착시는 없는가?",
          "무위험 국채 금리가 4%를 넘는 환경에서 주식 위험 프리미엄(ERP)이 0에 수렴하는 것을 어떻게 설명할 것인가?"
        ],
        riskIndicators: ["S&P500 톱 10 종목 시가총액 비중", "주식 리스크 프리미엄(ERP)", "하이퍼스케일러의 분기별 FCF 추이"]
      },
      structuralView: {
        verdict: "구조적 추세 (Secular Shift)",
        timeHorizon: "5~10년 장기 컴퓨팅 패러다임 전환",
        structuralDrivers: ["데이터 연산 수요의 지수함수적 팽창", "기업 업무 자동화 및 생산성 향상 압력", "국가 단위의 소버린 AI 인프라 구축 경쟁"],
        explanation: "단기 주가 조정이나 CAPEX 피크아웃 우려는 노이즈일 수 있으나, AI로의 산업 지형 재편 자체는 불가역적인 거대한 흐름입니다."
      },
      historicalMirror: {
        eventTitle: "1999~2000년 광통신망 인프라 투자와 시스코(Cisco)의 궤적",
        period: "1998~2002년",
        trigger: "인터넷 트래픽 폭증 기대감으로 인한 통신 장비와 광케이블의 과잉 발주",
        similarities: ["시대의 패러다임 변화를 주도하는 핵심 하드웨어 장비사에 자금이 극단적으로 집중된 점"],
        differences: ["현재 빅테크들은 2000년 닷컴 기업들과 달리 막대한 자체 현금 창출력과 탄탄한 독점 해자를 보유함"],
        lessons: "기술 혁신이 진짜라도, 지나치게 앞당겨 반영된 기댓값은 회수 기간의 현실과 마주할 때 가혹한 가격 조정을 겪을 수 있음."
      }
    };
  }

  // China Economy / Property Deflation
  if (query.includes("중국") || query.includes("부동산") || query.includes("디플레이션") || query.includes("헝다")) {
    return {
      headline: `[심층 분석] ${topic || "중국 경제 디플레이션과 대차대조표 불황"}: 부동산 부채와 글로벌 저가 수출의 이중주`,
      coreMechanism: "중국 가계 자산의 70%가 묶인 부동산 시장의 구조적 침체가 부의 효과(Wealth Effect)를 훼손하고 민간 소비를 위축시키며, 정부 주도의 과잉 제조업 설비가 글로벌 시장으로 저가 덤핑 수출되고 있습니다.",
      macroCategory: "지정학/공급망",
      sentiment: "Bearish",
      scope: "Macro (거시)",
      affectedSectors: ["철강/화학", "신재생/전기차", "소비재", "신흥국 제조업"],
      geographicFocus: ["중국", "한국", "유럽", "미국"],
      rippleEffect: {
        level1Direct: "중국 내 부동산 거래 급감, 개발사 연쇄 디폴트, 내수 물가 상승률 마이너스 진입",
        level2Transmission: "내수 부진을 타개하기 위한 배터리, 태양광, 화학 제품의 대규모 해외 밀어내기 수출",
        level3Domino: "미국 및 EU의 보복 관세 부과와 무역 분쟁 격화, 신흥국 제조업 채산성 악화",
        nodes: [
          { step: 1, stage: "1st Order", title: "부동산 신용 경색", description: "부동산 가격 하락과 지방정부 LGFV 부채 위기 부각", category: "직접영향", impactType: "negative" },
          { step: 2, stage: "2nd Order", title: "디플레이션 수출", description: "국내 잉여 재고를 글로벌 저가 덤핑으로 소진", category: "파급전이", impactType: "volatile" },
          { step: 3, stage: "3rd Order", title: "보호무역 장벽 확산", description: "관세 전쟁 촉발 및 글로벌 공급망 2차 블록화", category: "최종나비효과", impactType: "negative" }
        ]
      },
      devilsAdvocate: {
        consensusView: "중국 경제는 일본의 잃어버린 30년처럼 장기 침체에 빠져 회복 불가능할 것이다.",
        contrarianRisk: "중국은 서구와 달리 거대한 국내 엔지니어 풀과 전기차·로봇·원전 등 첨단 제조 클러스터에서 압도적 가격 경쟁력을 확립하고 있으며, 신흥국 사우스(Global South) 시장 지배력을 급속히 넓히고 있습니다.",
        uncomfortableQuestions: [
          "중국의 저가 디플레이션 수출이 미국과 유럽의 인플레이션을 억제해 주는 숨은 안전판 역할을 하고 있지는 않은가?",
          "위안화의 브릭스(BRICS) 결제 비중 확대가 달러 패권에 미치는 점진적 균열을 과소평가하고 있는가?",
          "한국의 석유화학, 철강 등 기초 제조업은 중국의 자급률 100% 달성 이후 어떤 생존 전략을 가졌는가?"
        ],
        riskIndicators: ["중국 70대 도시 주택 가격 지수", "생산자물가지수(PPI)", "미·중 관세 부과 품목 확대 동향"]
      },
      structuralView: {
        verdict: "구조적 추세 (Secular Shift)",
        timeHorizon: "5~10년 인구 절벽 및 내수 성장 모델 전환기",
        structuralDrivers: ["급격한 생산가능인구 감소와 고령화", "부동산 개발 중심 GDP 드라이브 한계", "미국의 대중국 첨단 기술 제재 영구화"],
        explanation: "과거 연 6~8% 고성장 시대는 완전히 종료되었으며, 질적 성장과 국가 안보 중심의 관리형 저성장 체제로의 이행입니다."
      },
      historicalMirror: {
        eventTitle: "1990년대 초 일본의 자산 버블 붕괴와 대차대조표 불황",
        period: "1990~1995년",
        trigger: "부동산 및 주식 투기 억제를 위한 일본은행의 급격한 금리 인상과 대출 총량 규제",
        similarities: ["부동산 자산 담보 가치 급락으로 인한 가계와 기업의 부채 상환 우선 심리"],
        differences: ["중국은 자본 통제가 엄격하여 외환 유출 위험이 낮고, 거대한 제조업 공급망 독점력을 보유함"],
        lessons: "부채 버블이 터진 후 금융기관 부실을 과감히 털어내지 않고 연명시키면 장기 디플레이션에 갇히게 됨."
      }
    };
  }

  // Generic customized economic analysis
  return {
    headline: `[심층 거시 분석] ${topic || "경제 핵심 동향"}: 자본의 이동 경로와 숨겨진 파급 효과`,
    coreMechanism: `${topic || "현재 논제"}는 시장 참여자들의 기대와 심리를 자극하고 있으나, 근원적으로는 글로벌 유동성 환경, 자금 조달 비용, 제도적 규제의 상호작용 속에서 자본 배분의 왜곡과 기회를 동시에 파생시키고 있습니다.`,
    macroCategory: "종합/사고훈련",
    sentiment: "Neutral/Complex",
    scope: "Macro (거시)",
    affectedSectors: ["금융/자본시장", "주요제조업", "원자재/에너지"],
    geographicFocus: ["글로벌", "미국", "한국"],
    rippleEffect: {
      level1Direct: "당해 자산 및 관련 지표의 단기 변동성 확대 및 투자 심리 쏠림",
      level2Transmission: "환율, 금리 스프레드, 원가 반영을 통한 2차 연계 산업 및 기업 실적으로의 전이",
      level3Domino: "의도치 않은 규제 개입, 자본 재배치, 장기 수급 불균형에 따른 최종 자산 가격 왜곡",
      nodes: [
        { step: 1, stage: "1st Order", title: "직접 반응", description: "뉴스 및 정책 발표에 따른 1차적 가격 지표 반응", category: "직접영향", impactType: "volatile" },
        { step: 2, stage: "2nd Order", title: "전이 채널", description: "조달 금리와 공급망 채널을 통한 2차 비용 전가", category: "파급전이", impactType: "neutral" },
        { step: 3, stage: "3rd Order", title: "나비 효과", description: "장기적인 자산 밸류에이션 재조정과 경제주체들의 행태 변화", category: "최종나비효과", impactType: "volatile" }
      ]
    },
    devilsAdvocate: {
      consensusView: "언론과 시장이 제시하는 가장 손쉬운 지배적 해석 시나리오",
      contrarianRisk: "다수가 안도할 때 수면 아래서 누적되는 신용 위험과 역방향 지표 쇼크",
      uncomfortableQuestions: [
        "이 현상이 장기화되었을 때 가장 치명적인 타격을 입는 경제 주체는 누구인가?",
        "현재 가격에 이미 호재나 악재가 100% 선반영되어 있지는 않은가?",
        "내가 믿고 있는 근거가 틀렸음을 입증하는 데이터는 무엇인가?"
      ],
      riskIndicators: ["실질 장기 금리", "신용 스프레드", "글로벌 유동성 M2 공급량"]
    },
    structuralView: {
      verdict: "구조적 추세 (Secular Shift)",
      timeHorizon: "3~5년 주기 순환 및 패러다임 변화",
      structuralDrivers: ["글로벌 통화 체제의 분절화", "지정학적 공급망 재편", "기술 혁신에 따른 생산성 분화"],
      explanation: "단기적 가격 출렁임에 휘둘리지 말고 자본이 지속적으로 유입되는 구조적 병목 지점을 주시해야 합니다."
    },
    historicalMirror: {
      eventTitle: "1970년대 브레턴우즈 체제 해체와 변동환율제 이행기",
      period: "1971~1974년",
      trigger: "기존 통화 질서의 한계 도달과 새로운 자산 가격 발견 과정",
      similarities: ["과거의 당연했던 금융 공식이 깨지고 새로운 균형점을 찾아가는 혼란기"],
      differences: ["현대는 금융 파생상품의 규모와 글로벌 디지털 자본 이동 속도가 비교할 수 없이 빠름"],
      lessons: "과거의 성공 방정식에 안주하지 않고 시스템의 구조적 룰 변화를 먼저 읽는 자가 생존함."
    }
  };
}

// Emergency Fallback Generator for Red Team Chat (Socratic Level Aware)
function buildEmergencyRedTeamFallback(thesis: string, messages: any[], level: string = "standard") {
  const cleanThesis = thesis || (messages && messages[messages.length - 1]?.content) || "경제 가설";

  if (level === "guided") {
    return `안녕하세요! 작성해주신 가설을 주의 깊게 읽어보았습니다. 경제 현상을 스스로의 관점으로 분석해보려는 시도가 매우 훌륭합니다!

💡 **더 단단한 생각을 위한 멘토의 친절한 힌트 (입문자 Guided Mode):**
1. **상식과 실제 시장의 차이**: 보통 "금리가 내려가면 주가가 오른다"고 생각하기 쉽지만, 만약 경기가 나빠져서 어쩔 수 없이 내리는 '침체 방어용 인하'라면 기업 실적 악화가 더 큰 충격을 줄 수 있습니다.
2. **반대편에 서 있는 사람의 심리**: 내가 주식을 사고 싶을 때, 그 주식을 나에게 팔고 있는 사람은 왜 지금 팔고 있을까요? 그 사람은 어떤 위험을 보고 있을지 상상해보세요.

🌱 **소크라테스식 멘토 질문:**
"만약 이 현상이 일어난 근본적인 이유가 경기가 둔화되고 있어서 정부가 '긴급 처방'을 내린 것이라면, 기업들의 실제 매출이 바로 반등할 수 있을까요? 일상 속 가게 운영에 빗대어 한번 생각해 보시겠어요?"`;
  }

  if (level === "expert") {
    return `귀하의 가설은 전형적인 확증 편향과 후행적 낙관론의 덫에 걸려 있습니다. 글로벌 헤지펀드 리스크 관리자 관점에서 가설의 뼈대를 해체하겠습니다.

⚔️ **치명적 맹점 정밀 타격 (전문가 Devil's Advocate Mode):**
1. **선반영(Priced-in)의 함정**: 이미 OIS 시장과 자산 선물 포지셔닝은 귀하가 언급한 시나리오를 90% 이상 선반영했습니다. 서프라이즈 모멘텀이 소멸했을 때 역회전(Unwind) 충격을 감당할 마진 버퍼가 있습니까?
2. **유동성 흡수와 국채 발행 쓰나미**: 미 재무부의 대규모 국채 발행(TGA 리필)과 연준의 QT 지속으로 인한 단기 자금시장(SOFR) 발작 가능성을 모델에 반영하셨습니까?
3. **2차 전이의 비대칭적 다운사이드**: 하이일드 크레딧 스프레드가 100bp 급등할 때 레버리지 부실이 전이되는 시차를 정량적으로 스트레스 테스트해 보셨습니까?

🎯 **CIO의 최후 질문:**
"당신의 전제가 완전히 붕괴되는 '결정적 역풍 지표(Falsification Trigger)'는 정확히 무엇이며, 그 수치가 찍히는 순간 즉시 손절할 규율(Discipline)이 준비되어 있습니까?"`;
  }

  return `당신의 견해는 "${cleanThesis.slice(0, 80)}..."라는 전제에 기반하고 있습니다. 

그러나 중급자(Standard Mode) 분석 관점에서 세 가지 균형 잡힌 리스크 요인을 점검해야 합니다:
1. **시장의 선반영(Pricing-in)**: 당신이 주목한 팩트는 이미 스마트 머니에 의해 현재 자산 가격에 80% 이상 반영되었을 가능성이 큽니다. 그렇다면 추가적인 상승/하락 동력은 어디서 찾을 수 있습니까?
2. **반대편 경제주체의 대응**: 중앙은행이나 경쟁국 정부가 당신의 예상대로 가만히 있지 않고 역방향 정책(긴축 또는 보호무역 관세)을 가동한다면 이 가설은 즉시 무너지지 않습니까?
3. **유동성의 착시**: 단순히 거래량이 늘어난 것이 진짜 실물 수요입니까, 아니면 투기적 레버리지의 마지막 불꽃입니까?

**레드팀의 핵심 반론 질문:**
만약 다음 분기 발표될 핵심 거시 지표가 당신의 예상과 정반대로 나온다면, 귀하의 투자 논리는 어떤 근거로 방어될 수 있습니까?`;
}

// Emergency Fallback for Evaluation
function buildEmergencyEvaluationFallback(thesis: string) {
  return {
    thesisScore: 78,
    blindSpots: [
      "거시 유동성 완화가 개별 기업의 잉여현금흐름으로 온전히 전달되지 않는 전이 시차 간과",
      "중앙은행의 정책 기조 전환 시 환율 변동으로 인한 외환 평가손실 위험 미반영"
    ],
    strengths: [
      "자금의 1차 이동 경로에 대한 명확한 인과관계 설정",
      "주류 시장의 내러티브에 휩쓸리지 않고 독자적인 가설을 정립하려는 태도"
    ],
    finalSynthesis: "단순히 'A가 발생하면 B가 오른다'는 단선적 사고를 넘어, 정책의 반작용과 시장의 선반영 정도를 상수로 두는 2차적 사고(Second-level Thinking)로 발전시켜야 합니다."
  };
}

// Emergency Fallback for Curate Related (F05 Specification Compliant)
function buildEmergencyCurateFallback(topic: string, contentSnippet: string) {
  return {
    curatedSummary: `"${topic || "선택된 경제 주제"}"와 구조적으로 맞물려 있는 거시 지형을 정리했습니다. 자금 조달 비용, 글로벌 공급망 블록화, 통화 가치의 역학관계 속에서 이 현상은 과거 100년 금융사의 신용 주기와 정확히 운율을 맞추고 있습니다.`,
    antiConsensus: [
      {
        title: "유동성 착시와 자산 인플레이션의 부메랑",
        perspective: "금리 인하나 부양책이 단기 랠리를 부를 수 있으나, 화폐 구매력 하락과 실질임금 정체로 인해 6~12개월 후 소비 절벽이 현실화된다는 비주류 시각.",
        sourceOrRationale: "오스트리아 학파 경기변동이론 및 1970년대 연준의 조기 금리 인하 실패 선례"
      },
      {
        title: "제조업 생산성 지체와 설비 투자 회수 지연",
        perspective: "빅테크 및 AI 혁신에 대한 기대와 달리, 실제 기업 현장의 단위 노동생산성 향상은 측정되지 않고 있으며 막대한 감가상각비 부담만 누적되고 있다는 경고.",
        sourceOrRationale: "노벨상 수상자 로버트 솔로의 생산성 패러독스(Solow Paradox) 재조명"
      }
    ],
    crossMacroThemes: [
      {
        theme: "미국 국채 10년물 금리와 달러 인덱스의 상관관계",
        impactAnalysis: "글로벌 안전자산 선호 심리와 기축통화 프리미엄의 바로미터. 장기 금리 하락 시 달러 약세 압력이 신흥국 외환보유고를 안정시킴.",
        watchIndicators: ["DXY (달러인덱스)", "US 10Y Yield", "신흥국 CDS 프리미엄"]
      },
      {
        theme: "원자재 공급망 분절과 리쇼어링 비용 인플레이션",
        impactAnalysis: "단순 소비재 가격 안정이 아닌 구조적 생산비용의 하방 경직성. 관세 장벽이 공급망 효율을 저해하여 만성 물가 압력 형성.",
        watchIndicators: ["WTI 원유", "구리 가격(Dr. Copper)", "발틱운임지수(BDI)"]
      }
    ],
    historicalCases: [
      {
        title: "1973년 1차 오일쇼크와 스태그플레이션",
        period: "1973~1975년",
        relevance: "공급망 병목과 지정학적 충격이 물가와 금리를 동시에 자극했던 대표적 구조적 전환 사례",
        keyTakeaway: "원가 상승형 인플레이션 국면에서는 전통적인 금리 처방이 실물 경제를 급격히 위축시킴."
      },
      {
        title: "1985년 플라자 합의와 엔고 버블의 서막",
        period: "1985~1989년",
        relevance: "인위적인 환율 조정이 국가 간 무역 불균형을 해소하려다 자산 버블을 낳았던 교훈",
        keyTakeaway: "환율 정책의 나비효과는 때로 본래 의도와 정반대의 거대한 자산 인플레이션을 촉발함."
      }
    ],
    recommendedTags: ["거시경제", "통화정책", "Anti-Consensus", "환율전이", "사고훈련"]
  };
}

// Emergency Fallback for Bull vs Bear Contrast
function buildEmergencyBullBearFallback(topic: string, context?: string) {
  const query = ((topic || "") + " " + (context || "")).toLowerCase();
  
  // Rate cut / monetary policy
  if (query.includes("금리") || query.includes("연준") || query.includes("fed") || query.includes("인하") || query.includes("통화")) {
    return {
      id: "bb_" + Date.now(),
      topic: topic || "기준금리 인하와 글로벌 유동성 재편",
      timestamp: new Date().toISOString(),
      overview: "기준금리 인하 국면을 바라보는 시장의 시각은 '유동성 공급에 따른 자산 랠리 지속(골디락스)'과 '경기 둔화 및 침체 방어용 긴급 인하(경착륙 리스크)'로 팽팽하게 양분되어 있습니다.",
      bullish: {
        thesis: "선제적 보험성 금리 인하로 금융 비용이 경감되고, 막대한 MMF 대기성 자금이 위험자산으로 이동하며 새로운 유동성 확장 국면(골디락스)이 전개된다.",
        catalysts: [
          "기업의 차입 비용 및 이자 상환 부담 완화로 잉여현금흐름(FCF) 개선",
          "연 5%대 MMF에 묶여 있던 6조 달러 이상의 글로벌 현금 유동성이 채권 및 주식으로 재유입",
          "소비자 대출 및 모기지 금리 안정화로 가계 가처분 소득 방어"
        ],
        capitalFlow: "안전자산(초단기 채권, MMF) → 성장주, 고배당 리츠, 신흥국 주식 및 인프라 자산으로 자본 이동 가속",
        favoredAssets: ["빅테크 및 기술 성장주", "상업용/주거용 부동산 리츠", "하이일드 채권", "금(Gold)"],
        keyIndicators: ["미국 국채 2년물/10년물 금리 스프레드 정상화", "기업 설비투자(CAPEX) 반등 지표", "개인소비지출(PCE) 안정세"],
        potentialOutlook: "밸류에이션 리레이팅과 풍부한 유동성 효과로 주요 증시 지수 15~20% 추가 상승 여력"
      },
      bearish: {
        thesis: "역사적으로 중앙은행의 첫 금리 인하는 '경기 침체(Recession)의 공식 신호탄'이었으며, 실업률 상승과 기업 실적 둔화가 유동성 착시를 압도할 것이다.",
        catalysts: [
          "금리 인하에도 불구하고 고용 지표 둔화(삼의 법칙 작동 등)로 실물 소비 위축",
          "미-일 내외 금리차 축소에 따른 글로벌 '엔 캐리 트레이드 청산' 변동성 쇼크",
          "고금리 장기화의 누적 충격으로 한계 기업 및 상업용 부동산 대출 부실화 수면 위 부상"
        ],
        capitalFlow: "고평가 주식 및 취약 크레딧 → 미국 중장기 국채, 현금성 달러, 방어주(필수소비재/유틸리티)로 긴급 피신",
        favoredAssets: ["미국 장기 국채(TLT)", "엔화 및 스위스 프랑", "배당 방어주(헬스케어, 통신)", "현금 비중 확대"],
        keyIndicators: ["미국 실업률 상승 속도", "하이일드 채권 부도율 및 스프레드 급등", "제조업 ISM 지수 50 하회 지속 여부"],
        potentialOutlook: "실적 추정치 하향(EPS 감익)과 밸류에이션 멀티플 축소로 자산 가격 15~25% 조정 위험"
      },
      coreControversy: "이번 금리 인하가 '1995년형 선제적 소프트랜딩(골디락스)'인가, 아니면 '2001/2007년형 뒤늦은 경기침체 방어(경착륙)'인가?",
      pivotTriggers: [
        "비농업 고용자 수 및 실업률의 급격한 악화 여부",
        "달러-엔 환율의 급격한 엔고 전환 및 글로벌 헤지펀드 청산 물량",
        "주요 빅테크 기업들의 분기별 실적 가이던스 방어 여부"
      ],
      dialecticTakeaway: "금리 인하라는 단일 현상에 도취되지 말고, 인하의 동기가 '인플레이션 둔화'인지 '경기 냉각'인지를 매월 고용/소비 데이터로 검증하며 양방향 리스크 헤지를 구축해야 합니다.",
      isFallback: true
    };
  }

  // Stock / AI / Tech
  if (query.includes("ai") || query.includes("반도체") || query.includes("주식") || query.includes("엔비디아") || query.includes("빅테크") || query.includes("나스닥")) {
    return {
      id: "bb_" + Date.now(),
      topic: topic || "AI 반도체 및 빅테크 밸류에이션 논쟁",
      timestamp: new Date().toISOString(),
      overview: "AI 인프라 랠리를 두고 '인터넷 혁명에 버금가는 차세대 산업혁명 생산성 폭발'이라는 강세론과 '1999년 광통신 설비 과잉 매설 버블의 재현'이라는 약세론이 팽팽히 맞서고 있습니다.",
      bullish: {
        thesis: "생성형 AI는 단순한 유행이 아니라 전 산업의 노동 생산성을 근본적으로 혁신하는 메가트렌드이며, 빅테크의 강력한 현금창출력이 CAPEX를 안정적으로 뒷받침한다.",
        catalysts: [
          "소프트웨어, 법률, 헬스케어, 금융 등 전 영역에서 AI 자동화에 따른 비용 절감 및 매출 극대화 가시화",
          "빅테크 기업들의 연간 잉여현금흐름(FCF)이 500억~1,000억 달러에 달해 부채 조달 없는 자체 현금 투자 가능",
          "차세대 AI 모델 고도화로 인한 컴퓨팅 파워 수요의 지수함수적(Exponential) 증가"
        ],
        capitalFlow: "전통 구경제 산업 자본 → AI 하드웨어 밸류체인(GPU, HBM 반도체, 전력망 유틸리티)으로 집중 유입",
        favoredAssets: ["첨단 AI 가속기 및 파운드리", "고대역폭메모리(HBM) 생태계", "원자력(SMR) 및 전력 인프라", "클라우드 하이퍼스케일러"],
        keyIndicators: ["빅테크 클라우드 AI 서비스 매출 성장률", "GPU 납품 리드타임 및 예약 잔고", "엔터프라이즈 AI 솔루션 도입율"],
        potentialOutlook: "향후 3~5년간 연평균 EPS 20~30% 성장 지속 및 프리미엄 멀티플 유지"
      },
      bearish: {
        thesis: "인프라 투자는 수천억 달러에 달하지만 정작 최종 소비자와 기업의 AI 소프트웨어 지불 용의(ROI)가 검증되지 않아, 결국 '투자 절벽(Capex Freeze)'과 밸류에이션 붕괴가 불가피하다.",
        catalysts: [
          "데이터센터 구축을 위한 전력망 인입 불가 및 변압기 부족 등 물리적 인프라 병목",
          "AI 서비스를 도입한 기업들의 생산성 개선 체감 지연으로 소프트웨어 갱신 지출 삭감",
          "스타트업 및 경쟁사들의 오픈소스 모델 확산으로 독점적 가격 책정력(Pricing Power) 훼손"
        ],
        capitalFlow: "초고평가 테크주 → 현금 흐름이 확실한 저평가 가치주, 원자재, 필수소비재로 순환매",
        favoredAssets: ["전통 배당 가치주", "원자재(구리, 에너지)", "단기 국채 및 현금", "방어형 인프라 펀드"],
        keyIndicators: ["빅테크 CAPEX 대비 AI 매출 회수율(ROI)", "데이터센터 전력 인입 지연율", "선행 PER 멀티플의 역사적 상단 도달 여부"],
        potentialOutlook: "CAPEX 집행 속도 조절 선언 시 하드웨어 공급망 주가 30~40% 급락 조정 위험"
      },
      coreControversy: "수백조 원의 AI 데이터센터 투자가 '기업들의 실제 유료 결제 매출'로 회수되고 있는가, 아니면 기대감만으로 지은 모래성인가?",
      pivotTriggers: [
        "주요 빅테크 분기 실적 발표에서의 차기년도 CAPEX 가이던스 축소 여부",
        "소프트웨어 기업들의 AI 부가 요금제 채택률 및 이탈률",
        "전력 요금 급등에 따른 데이터센터 운영비용 마진 악화"
      ],
      dialecticTakeaway: "기술 혁명의 방향성(Bull)은 맞더라도 자본 사이클의 과잉 투자 주기(Bear)를 무시할 수 없으므로, 하드웨어 독점 기업과 전력 인프라의 실제 현금흐름 창출 속도를 분기별로 엄격히 추적해야 합니다.",
      isFallback: true
    };
  }

  // General Macro Fallback
  return {
    id: "bb_" + Date.now(),
    topic: topic || "거시경제 국면 분석",
    timestamp: new Date().toISOString(),
    overview: `"${topic || "현재 경제 화두"}"를 둘러싸고 낙관론자들은 구조적 성장과 풍부한 시장 유동성을 바탕으로 한 자산 가격 상승을 전망하는 반면, 비관론자들은 누적된 부채와 정책 긴축의 시차 충격을 경고하고 있습니다.`,
    bullish: {
      thesis: "시장 참여자들의 우려와 달리 펀더멘털은 견고하며, 생산성 개선과 정책 지원을 디딤돌 삼아 자산 가치가 재평가되는 새로운 상승 파동이 열린다.",
      catalysts: [
        "신기술 도입 및 공정 혁신을 통한 잠재 성장률 반등",
        "중앙은행과 정부의 신속한 시장 유동성 방어 기조",
        "견조한 가계 대차대조표와 고용 안정성 유지"
      ],
      capitalFlow: "위험 회피 자산에서 고수익 성장 자산 및 혁신 산업 생태계로 적극적 머니무브",
      favoredAssets: ["혁신 기술 성장주", "선진국 주식 시장", "성장 인프라 펀드"],
      keyIndicators: ["기업 영업이익률 마진 개선", "글로벌 유동성(M2) 증가율", "소비자 심리지수 반등"],
      potentialOutlook: "리스크 프리미엄 축소에 따른 자산 가격 10~20% 상승 탄력"
    },
    bearish: {
      thesis: "현재의 호황은 과도한 레버리지와 정부 재정 적자가 빚어낸 착시일 뿐이며, 보이지 않는 금융 시스템 내부의 균열이 임계점에 도달하고 있다.",
      catalysts: [
        "누적된 고비용 구조와 정부 국채 발행 부담에 따른 실질 금리 상승",
        "지정학적 리스크 심화로 인한 글로벌 무역 블록화 및 원가 상승",
        "자산 가격의 역사적 고평가(멀티플 부담)로 인한 하방 취약성"
      ],
      capitalFlow: "변동성 자산에서 실물 안전자산(귀금속, 에너지) 및 단기 무위험 채권으로 대거 후퇴",
      favoredAssets: ["금 및 실물 원자재", "미국 단기 국채", "고배당 필수재"],
      keyIndicators: ["신용 스프레드 확대", "국채 발행 입찰 수요 둔화", "연체율 증가 추세"],
      potentialOutlook: "경기 침체 및 밸류에이션 정상화 과정에서 15~30% 폭락 위험 상존"
    },
    coreControversy: "현재의 경기 사이클이 '신기술 혁신이 이끄는 지속 가능한 확장'인가, 아니면 '부채로 연명하는 사이클 후반부의 마지막 불꽃'인가?",
    pivotTriggers: [
      "주요국 중앙은행의 긴축/완화 정책 전환 시점과 시장 반응",
      "글로벌 교역량 및 물류 운임 지수의 변동",
      "상업은행들의 대출 태도(SLOOS) 강화 여부"
    ],
    dialecticTakeaway: "한쪽의 일방적인 낙관이나 비관에 매몰되지 않고, 강세론이 입증되기 위해 충족되어야 할 조건과 약세론이 현실화될 트리거를 동시에 저울질하는 것이 진정한 복안적(Double-perspective) 사고입니다.",
    isFallback: true
  };
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Engine Connection Test (Gemini Cloud vs Local Ollama vs LM Studio vs Custom)
app.post("/api/test-engine-connection", async (req, res) => {
  const { provider = "gemini", endpoint, model, apiKey } = req.body;
  const startTime = Date.now();

  if (provider === "gemini") {
    try {
      await generateContentWithRetryAndFallback({
        contents: "Hello! Respond with: OK",
      });
      const latencyMs = Date.now() - startTime;
      return res.json({
        success: true,
        latencyMs,
        modelUsed: "gemini-3.1-flash-lite",
        message: `Google Gemini Cloud 정상 연결 (응답 지연시간: ${latencyMs}ms)`,
      });
    } catch (err: any) {
      return res.json({
        success: false,
        latencyMs: Date.now() - startTime,
        message: `Gemini Cloud 연결 상태 확인 중 (${err?.message ? String(err.message).slice(0, 80) : '연결 점검'})`,
        guide: "Gemini API 키 및 네트워크 상태를 확인해 주세요.",
      });
    }
  }

  // Local Ollama / LM Studio / Custom OpenAI
  const targetEndpoint = endpoint || (provider === "ollama" ? "http://127.0.0.1:11434" : "http://127.0.0.1:1234");
  const targetModel = model || (provider === "ollama" ? "llama3.1" : "local-model");
  const isLocalhost = targetEndpoint.includes("localhost") || targetEndpoint.includes("127.0.0.1");
  const isCloudEnvironment = !!process.env.K_SERVICE;

  if (isCloudEnvironment && isLocalhost) {
    return res.json({
      success: false,
      latencyMs: 1,
      modelUsed: targetModel,
      message: `[${provider.toUpperCase()}] 클라우드 웹 프리뷰 환경에서는 사용자 PC의 127.0.0.1로 직접 통신할 수 없습니다. (Gemini Cloud 자동 전환 지원)`,
      guide: `1) 현재 웹앱은 Google Cloud Run 컨테이너에서 동작 중입니다. 127.0.0.1은 사용자 PC가 아닌 클라우드 컨테이너 내부를 가리키므로 연결되지 않습니다.\n` +
        `2) 클라우드 환경에서는 기본 탑재된 'Google Gemini (Cloud)' 모드를 사용하시면 설치 없이 즉시 초고속 추론을 무료로 이용하실 수 있습니다.\n` +
        `3) 만약 내 PC의 Ollama 모델을 클라우드 앱과 연동하고 싶으시다면, ngrok(예: https://xxxx.ngrok-free.app) 또는 cloudflare tunnel로 11434 포트를 터널링한 주소를 엔드포인트에 입력해 주세요.\n` +
        `4) 또한 앱을 로컬 PC로 다운로드(GitHub/ZIP)하여 'npm run dev'로 구동하시면 127.0.0.1 로컬 Ollama와 100% 직결됩니다.`,
    });
  }

  try {
    await callLocalOrOpenAIEngine({
      endpoint: targetEndpoint,
      model: targetModel,
      apiKey,
      userPrompt: "Respond with the word OK",
      temperature: 0.1,
    });
    const latencyMs = Date.now() - startTime;
    return res.json({
      success: true,
      latencyMs,
      modelUsed: targetModel,
      message: `성공! [${provider.toUpperCase()}] 로컬/원격 엔진 정상 응답 (응답 지연시간: ${latencyMs}ms)`,
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const isLocalhost = targetEndpoint.includes("localhost") || targetEndpoint.includes("127.0.0.1");
    let guide = "";

    if (isLocalhost) {
      guide = `1) 현재 웹앱이 클라우드 컨테이너에서 실행 중인 경우, 클라우드는 보안상 사용자님의 개인 PC 로컬호스트(${targetEndpoint})로 직접 패킷을 전송할 수 없습니다.\n` +
        `2) 해결 방법 A: 앱을 로컬 PC에 다운로드(GitHub/ZIP)하여 'npm run dev'로 실행하시면 100% 로컬 다이렉트 통신이 작동합니다.\n` +
        `3) 해결 방법 B: ngrok 또는 cloudflare tunnel(예: https://xxxx.ngrok-free.app)을 사용하여 로컬 포트를 터널링해 엔드포인트에 입력하시면 클라우드에서도 즉시 로컬 PC와 연동됩니다.\n` +
        `4) 해결 방법 C: 클라우드 환경에서는 즉시 사용 가능한 'Google Gemini (Cloud)' 모드를 권장합니다.`;
    } else {
      guide = provider === "ollama"
        ? `터미널에서 'ollama run ${targetModel}' 명령어로 모델이 로드되었는지 확인해 주세요.`
        : `LM Studio 실행 후 'Developer' 탭에서 'Start Server'가 켜져 있는지 확인해 주세요.`;
    }

    return res.json({
      success: false,
      latencyMs,
      message: `[${provider.toUpperCase()}] 연결 거부 또는 실패: ${err?.message || '연결할 수 없음'}`,
      guide,
    });
  }
});

// F01 & F02: Prism Analysis & Historical Mirror
app.post("/api/prism-analysis", async (req, res) => {
  const { topic, text, sourceUrl, engineConfig } = req.body;
  if (!topic && !text) {
    return res.status(400).json({ error: "주제 또는 뉴스 텍스트를 입력해주세요." });
  }

  const prompt = `당신은 최상위 거시경제 거장(Macro Strategist)이자 'EcoSight'의 수석 분석관입니다.
사용자가 제공한 경제 뉴스 또는 주제를 분석하여 '프리즘 분석(The Prism Analysis)'과 '역사적 거울(Historical Mirror)' 리포트를 JSON 형식으로 엄격하게 작성하세요.

[필수 언어 원칙]
★ 모든 헤드라인, 핵심 메커니즘, 노드 제목 및 설명, 반론, 질문, 구조적 추세 판정 설명, 역사적 공통점/차이점/교훈 등 모든 서술과 추론 과정은 반드시 100% 품격 있고 유려한 한국어로 작성하십시오. 영어 고유명사나 통화 기호는 괄호 병기만 허용됩니다.

[분석 및 추론 철학]
1. 단순 사실 나열이 아닌 '돈의 흐름(Flow)'과 자본의 이동 경로를 한국어로 명확히 해부하십시오.
2. 1차 직접 효과를 넘어, 2차 전이 경로와 3차 도미노(의도치 않은 파급 효과 및 나비효과)를 인과관계 추론으로 연결하십시오.
3. 주류(Consensus) 의견을 의심하는 악마의 대변인(Devil's Advocate) 관점을 반드시 날카롭게 제시하십시오.
4. 일시적인 시장 노이즈인지 5~10년 구조적 메가트렌드(Secular Trend)인지 엄정하게 판정하십시오.
5. 지난 100년간의 세계 금융 역사(대공황, 오일쇼크, 1980년대 인플레이션/플라자합의, 1997 아시아 외환위기, 2000 닷컴버블, 2008 리먼브라더스 위기, 2020 코로나 양적완화 등) 중 가장 유사한 1개 사건을 발굴하여 공통점/차이점/교훈을 도출하십시오.

[입력 데이터]
- 주제/키워드: ${topic || "입력된 텍스트 참조"}
- 내용/기사 원문: ${text || "주제 키워드 기반 정밀 분석"}
- 참고 URL: ${sourceUrl || "없음"}

반드시 아래 JSON 스키마를 만족하는 유효한 JSON으로만 응답하세요:
{
  "headline": "날카롭고 통찰력 있는 헤드라인 요약",
  "coreMechanism": "돈이 어디서 어디로 흐르고 왜 이런 일이 발생하는지 2~3문장 설명",
  "macroCategory": "통화정책/금리 | 기술혁신/반도체 | 지정학/공급망 | 원자재/에너지 | 부동산/신용부채 | 외환/글로벌유동성 중 택1",
  "sentiment": "Bullish" | "Bearish" | "Neutral/Complex",
  "scope": "Macro (거시)" | "Micro (미시/산업)",
  "affectedSectors": ["섹터1", "섹터2", "섹터3"],
  "geographicFocus": ["주요국가/지역1", "주요국가/지역2"],
  "rippleEffect": {
    "level1Direct": "1차 직접 효과 (즉각적이고 직접적인 시장/지표 반응)",
    "level2Transmission": "2차 전이 효과 (환율, 조달비용, 원가전가, 공급망으로 번지는 중간 파급)",
    "level3Domino": "3차 도미노 효과 (최종 자산가격 왜곡, 부작용, 예상 밖의 나비효과)",
    "nodes": [
      {
        "step": 1,
        "stage": "1st Order",
        "title": "1차 영향 노드명",
        "description": "상세 메커니즘",
        "category": "직접영향",
        "impactType": "positive" | "negative" | "volatile" | "neutral"
      },
      {
        "step": 2,
        "stage": "2nd Order",
        "title": "2차 전이 노드명",
        "description": "상세 메커니즘",
        "category": "파급전이",
        "impactType": "positive" | "negative" | "volatile" | "neutral"
      },
      {
        "step": 3,
        "stage": "3rd Order",
        "title": "3차 도미노 노드명",
        "description": "상세 메커니즘",
        "category": "최종나비효과",
        "impactType": "positive" | "negative" | "volatile" | "neutral"
      }
    ]
  },
  "devilsAdvocate": {
    "consensusView": "시장의 다수가 믿고 있는 지배적 낙관/비관 시나리오",
    "contrarianRisk": "대다수가 간과하고 있는 역발상 위험 요인과 허점",
    "uncomfortableQuestions": [
      "투자자나 의사결정권자가 스스로에게 던져야 할 불편한 질문 1",
      "불편한 질문 2",
      "불편한 질문 3"
    ],
    "riskIndicators": ["감시해야 할 핵심 데이터/지표 1", "핵심 지표 2"]
  },
  "structuralView": {
    "verdict": "일시적 소음 (Noise)" | "구조적 추세 (Secular Shift)",
    "timeHorizon": "예: 3~6개월 단기 변동성 or 5~10년 장기 구조개편",
    "structuralDrivers": ["구조적 추동 원인 1", "원인 2"],
    "explanation": "왜 단순 노이즈인지 혹은 돌이킬 수 없는 메가트렌드인지 구조적 이유 설명"
  },
  "historicalMirror": {
    "eventTitle": "과거 100년 내 가장 흡사한 역사적 경제 사건명",
    "period": "발생 연도 및 시기 (예: 1973~1975)",
    "trigger": "당시의 발발 계기 및 배경",
    "similarities": ["현재와의 공통점 1", "공통점 2"],
    "differences": ["과거와 결정적으로 다른 현대의 변수 (기술, 부채, 제도 등) 1", "다른 점 2"],
    "lessons": "그 사건의 결말과 현재 투자자/학습자가 반드시 새겨야 할 교훈"
  }
}`;

  try {
    const rawText = await executeUniversalLLM({
      promptText: prompt,
      geminiContents: prompt,
      engineConfig,
      jsonMode: true,
      temperature: 0.3,
    });

    const parsed = extractJson(rawText || "{}");

    res.json({
      id: "analysis_" + Date.now(),
      timestamp: new Date().toISOString(),
      macroIndicators: getRelevantMacroIndicators(topic || text || ""),
      sourceGroundings: getRelevantSourceGroundings(topic || text || ""),
      ...parsed,
    });
  } catch (error: any) {
    console.log("Prism analysis notice, using structured fallback:", error?.message);
    const fallback = buildEmergencyPrismFallback(topic, text);
    res.json({
      id: "analysis_" + Date.now(),
      timestamp: new Date().toISOString(),
      isFallback: true,
      macroIndicators: getRelevantMacroIndicators(topic || text || ""),
      sourceGroundings: getRelevantSourceGroundings(topic || text || ""),
      ...fallback,
    });
  }
});

// F04 & F06: Red Team Socratic Debate (Level-Controlled)
app.post("/api/red-team-chat", async (req, res) => {
  const { thesis, analysisContext, messages, socraticLevel = "standard", engineConfig } = req.body;
  if (!thesis && (!messages || messages.length === 0)) {
    return res.status(400).json({ error: "사용자의 견해(Thesis)를 입력해주세요." });
  }

  let levelInstruction = "";
  if (socraticLevel === "guided") {
    levelInstruction = `
[소크라테스 수위: 입문자 (Guided Mode)]
- 역할: 친절한 멘토이자 학습을 격려하는 따뜻한 경제 코치.
- 어조: 금융 전문 용어를 남발하지 않고, 다정하고 친절한 어조로 일상 속 비유를 활용.
- 행동 원칙: 사용자의 가설에 논리적 비약이나 기초적 오해(예: "금리 인하는 무조건 주가 급등이다", "돈 풀면 무조건 오른다")가 있더라도 면박을 주지 않고, "그렇게 생각하기 쉽지만 시장의 반대편에서는 이런 점을 우려합니다"라며 부드러운 힌트를 제시하십시오.
- 마무리: 사용자가 스스로 2단계 생각을 유추해볼 수 있는 온화한 소크라테스식 격려 질문 1개로 마무리하십시오.`;
  } else if (socraticLevel === "expert") {
    levelInstruction = `
[소크라테스 수위: 전문가 (Devil's Advocate Mode)]
- 역할: 글로벌 헤지펀드 최고투자책임자(CIO)이자 냉철하고 타협 없는 '악마의 대변인(Devil's Advocate)'.
- 어조: 철저히 비판적이고 날카롭고 직설적인 프로페셔널 톤.
- 행동 원칙: 절대 쉽게 동조하거나 칭찬하지 마십시오. 사용자의 가설에 내포된 맹점, 시장 선반영(Priced-in) 리스크, 재무부/연준의 반작용, 비대칭적 테일 리스크(Tail Risk), 거시 지표와의 괴리를 칼같이 파고들어 공격하십시오.
- 마무리: 사용자의 가설을 시험대에 올릴 수 있는 가장 치명적이고 정곡을 찌르는 반론 질문 1개로 끝맺으십시오.`;
  } else {
    levelInstruction = `
[소크라테스 수위: 중급자 (Standard Mode)]
- 역할: 객관적이고 균형 잡힌 매크로 리서치 애널리스트.
- 어조: 정중하면서도 논리적인 데이터 중심의 분석가 톤.
- 행동 원칙: 실제 거시 지표, 시장 데이터, 역사적 유사 케이스를 근거로 제시하며 사용자가 간과한 시장의 리스크 요인과 반대편 관점을 차분하고 탄탄하게 조명하십시오.
- 마무리: 사용자의 생각을 입체적으로 넓혀줄 수 있는 핵심 소크라테스식 반론 질문 1개로 마무리하십시오.`;
  }

  const systemInstruction = `당신은 'EcoSight'의 최고 등급 레드팀(Red Team) 경제 토론 파트너입니다.
목적: 사용자의 경제/투자 논리에 존재하는 확증 편향(Information Bias)을 부수고, 보이지 않는 사각지대(Blind Spots)를 들추어 입체적 사고를 훈련시키는 소크라테스식 문답자입니다.

${levelInstruction}

[필수 언어 원칙]
★ 모든 반론과 질문, 설명은 반드시 100% 품격 있는 한국어로 작성하십시오.

[참고 컨텍스트]
${analysisContext ? JSON.stringify(analysisContext) : "일반 경제 토론"}`;

  const conversationHistory = (messages || []).map((m: any) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const localHistory = (messages || []).map((m: any) => ({
    role: m.role as 'user' | 'model',
    content: m.content,
  }));

  try {
    const reply = await executeUniversalLLM({
      promptText: conversationHistory.length === 0 ? `나의 견해(Thesis): ${thesis}` : "",
      geminiContents: conversationHistory.length > 0
        ? conversationHistory
        : [{ role: "user", parts: [{ text: `나의 견해(Thesis): ${thesis}` }] }],
      systemInstruction,
      historyMessages: localHistory,
      engineConfig,
      temperature: socraticLevel === "guided" ? 0.5 : socraticLevel === "expert" ? 0.85 : 0.7,
    });

    res.json({
      reply: reply || "논리를 분석할 수 없습니다.",
      socraticLevel,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.log("Red Team chat notice, using structured fallback:", error?.message);
    const fallbackReply = buildEmergencyRedTeamFallback(thesis, messages, socraticLevel);
    res.json({
      reply: fallbackReply,
      socraticLevel,
      timestamp: new Date().toISOString(),
      isFallback: true,
    });
  }
});

// F04 - Thesis Evaluation (토론 완료 후 논리 평가 리포트)
app.post("/api/evaluate-thesis", async (req, res) => {
  const { thesis, conversation, engineConfig } = req.body;

  const prompt = `다음은 사용자가 제시한 경제 견해(Thesis)와 레드팀과의 토론 내역입니다.
사용자의 논리적 견고성을 채점하고, 발견된 인지 편향과 향후 보강해야 할 포인트를 평가하세요.

[필수 언어 원칙]
★ 모든 평가 내용과 종합 통찰 제언은 반드시 100% 한국어로 작성하십시오.

[사용자 Thesis]: ${thesis}
[토론 내역]: ${JSON.stringify(conversation)}

다음 JSON으로 응답하세요:
{
  "thesisScore": 0부터 100 사이 숫자,
  "blindSpots": ["발견된 사각지대 및 간과한 변수 1", "사각지대 2"],
  "strengths": ["논리에서 돋보인 통찰 및 강점 1", "강점 2"],
  "finalSynthesis": "정반합(Thesis-Antithesis-Synthesis) 관점에서 한 단계 업그레이드된 종합 통찰 제언"
}`;

  try {
    const rawText = await executeUniversalLLM({
      promptText: prompt,
      geminiContents: prompt,
      engineConfig,
      jsonMode: true,
      temperature: 0.3,
    });

    res.json(extractJson(rawText || "{}"));
  } catch (error: any) {
    console.log("Evaluation notice, using structured fallback:", error?.message);
    const fallback = buildEmergencyEvaluationFallback(thesis);
    res.json(fallback);
  }
});

// F05: Auto-Curator & Knowledge Timeline Exploration
app.post("/api/curate-related", async (req, res) => {
  const { currentTopic, contentSnippet, existingTags, userGoal, engineConfig } = req.body;

  const prompt = `당신은 'EcoSight 지식 서고'의 수석 오토 큐레이터(Auto-Curator) AI입니다.
사용자가 저장한 경제 분석 또는 노트를 기반으로, 확증 편향을 깨뜨릴 '소외된 반대편 시각(Anti-Consensus)', '상호 교차 거시 테마(Cross-Macro Themes)', '관련 역사적 사건(Historical Cases)'을 자동으로 발굴하여 묶어 정리하십시오.

[필수 원칙]
★ 모든 요약, 반대편 시각 설명, 거시 테마 분석, 역사적 교훈 등 모든 항목은 반드시 100% 고품격 한국어로 작성하십시오.

[현재 주제/자료]: ${currentTopic || "거시경제 흐름"}
[자료 요약/내용]: ${contentSnippet || "내용 없음"}
[기존 태그들]: ${(existingTags || []).join(", ") || "경제, 거시"}
[사용자 의도]: ${userGoal || "비슷한 계열의 지식 확장 및 반대편 시각 보강"}

아래 JSON 구조로 정확히 반환하세요:
{
  "curatedSummary": "현재 주제와 연계된 거시경제 구조적 연결고리 총괄 설명 (3~4문장)",
  "antiConsensus": [
    {
      "title": "소외된 비주류/반대편 시각의 핵심 제목",
      "perspective": "주류 시장이 간과하고 있는 불편한 진실이나 반대 가설 상세 설명",
      "sourceOrRationale": "이 주장의 학문적/데이터적 근거 (예: 오스트리아 학파, 통화주의, 특정 거시지표 등)"
    }
  ],
  "crossMacroThemes": [
    {
      "theme": "상호 교차하는 거시 테마 (예: 환율과 무역수지의 전이 효과)",
      "impactAnalysis": "두 테마가 서로에게 미치는 파급 메커니즘",
      "watchIndicators": ["주목해야 할 핵심 지표 1", "핵심 지표 2"]
    }
  ],
  "historicalCases": [
    {
      "title": "관련 역사적 사건 명칭 (예: 1985 플라자합의, 1970 오일쇼크 등)",
      "period": "발생 연도/시기",
      "relevance": "현재 학습 주제와 일맥상통하는 구조적 원리",
      "keyTakeaway": "역사가 주는 핵심 교훈"
    }
  ],
  "recommendedTags": ["Macro/거시", "추천태그1", "추천태그2", "추천태그3"]
}`;

  try {
    const rawText = await executeUniversalLLM({
      promptText: prompt,
      geminiContents: prompt,
      engineConfig,
      jsonMode: true,
      temperature: 0.4,
    });

    res.json(extractJson(rawText || "{}"));
  } catch (error: any) {
    console.log("Curate related notice, using structured fallback:", error?.message);
    const fallback = buildEmergencyCurateFallback(currentTopic, contentSnippet);
    res.json(fallback);
  }
});

// Bull vs Bear Contrast Dialectic Engine (대조 학습 분석)
app.post("/api/bull-bear-contrast", async (req, res) => {
  const { topic, context, engineConfig } = req.body;
  if (!topic && !context) {
    return res.status(400).json({ error: "비교 분석할 경제 주제를 입력해주세요." });
  }

  const prompt = `당신은 세계 최고 수준의 헤지펀드 매크로 리서치 헤드이자 'EcoSight'의 수석 토론 디렉터입니다.
사용자가 제공한 경제 주제 또는 뉴스에 대해, 시장 참여자들의 확증 편향을 깨뜨리기 위해 의도적으로 극단의 객관적 '강세론(Bullish / 황소 관점)'과 날카로운 '약세론(Bearish / 곰 관점)'을 엄격하게 대조하여 분석 리포트를 작성하십시오.

[필수 언어 및 원칙]
1. 모든 논거, 촉매, 자본 이동 경로, 지표, 총평 및 결론은 100% 품격 있고 유려한 한국어로 작성하십시오.
2. 어느 한쪽에 편향되지 않고, 양 진영 모두 기관 투자자가 수용할 수 있을 만큼 가장 강력하고 설득력 있는 정교한 논리(Steel-manning)를 구축하십시오.
3. 두 진영이 정면으로 충돌하는 본질적인 핵심 쟁점(Core Controversy)을 도출하십시오.
4. 향후 어느 진영이 승리할지 판가름할 결정적 분기 트리거(Pivot Triggers) 3가지를 명시하십시오.

[분석 대상 주제]: ${topic || "입력된 컨텍스트 참조"}
[추가 배경 컨텍스트]: ${context || "없음"}

반드시 다음 JSON 형식으로만 응답하십시오:
{
  "id": "bb_${Date.now()}",
  "topic": "${topic || "경제 주제"}",
  "timestamp": "${new Date().toISOString()}",
  "overview": "이 주제를 둘러싼 시장의 거대한 시각차와 대립 구도 개요 (2~3문장)",
  "bullish": {
    "thesis": "강세론자의 핵심 신념 및 상승 논거 (핵심 가설)",
    "catalysts": [
      "상승을 정당화하는 구체적 성장 동력/촉매 1",
      "상승 촉매 2",
      "상승 촉매 3"
    ],
    "capitalFlow": "자본이 어디서 빠져나와 어디로 집중 유입되는지 자금 이동 경로",
    "favoredAssets": ["수혜 자산/섹터 1", "수혜 자산 2", "수혜 자산 3", "수혜 자산 4"],
    "keyIndicators": ["강세론자가 주목하는 핵심 선행 지표 1", "핵심 지표 2", "핵심 지표 3"],
    "potentialOutlook": "상승 시나리오가 현실화될 때의 밸류에이션/수익률 전망"
  },
  "bearish": {
    "thesis": "약세론자의 핵심 신념 및 하방 위험 경고 (핵심 가설)",
    "catalysts": [
      "하락/조정을 촉발할 치명적 트리거 및 숨은 위험 1",
      "하방 위험 2",
      "하방 위험 3"
    ],
    "capitalFlow": "유동성 경색 및 자본이 어디로 긴급 회피/유출되는지 경로",
    "favoredAssets": ["위험 회피용 수혜 자산 또는 인버스/방어 자산 1", "방어 자산 2", "방어 자산 3", "방어 자산 4"],
    "keyIndicators": ["약세론자가 경고하는 위험 경보 지표 1", "위험 지표 2", "위험 지표 3"],
    "potentialOutlook": "하방 리스크가 전면화될 때의 자산 조정 및 밸류에이션 충격 전망"
  },
  "coreControversy": "두 진영이 타협 없이 맞부딪히는 단 하나의 본질적인 질문/쟁점",
  "pivotTriggers": [
    "향후 시장 판도를 뒤바꿀 결정적 확인 지표/이벤트 1",
    "결정적 분기 트리거 2",
    "결정적 분기 트리거 3"
  ],
  "dialecticTakeaway": "단순 양자택일이 아닌, 투자자와 학습자가 양방향 리스크를 통합적으로 고려하기 위한 심층적 정반합(Synthesis) 전략 제언 (3~4문장)"
}`;

  try {
    const rawText = await executeUniversalLLM({
      promptText: prompt,
      geminiContents: prompt,
      engineConfig,
      jsonMode: true,
      temperature: 0.4,
    });

    const parsed = extractJson(rawText || "{}");
    if (!parsed || !parsed.bullish || !parsed.bearish) {
      throw new Error("Invalid structure from model");
    }

    res.json({
      ...parsed,
      id: parsed.id || `bb_${Date.now()}`,
      topic: topic,
      timestamp: new Date().toISOString(),
      macroIndicators: getRelevantMacroIndicators(topic || context || ""),
      sourceGroundings: getRelevantSourceGroundings(topic || context || ""),
      isFallback: false,
    });
  } catch (error: any) {
    console.log("Bull-Bear contrast analysis notice, using structured fallback:", error?.message);
    const fallback = buildEmergencyBullBearFallback(topic, context);
    res.json({
      ...fallback,
      macroIndicators: getRelevantMacroIndicators(topic || context || ""),
      sourceGroundings: getRelevantSourceGroundings(topic || context || ""),
    });
  }
});

// F07: Real-time Macro Indicators & Grounding Data API
app.get("/api/macro-indicators", (req, res) => {
  const topic = (req.query.topic as string) || "";
  if (!topic) {
    return res.json({
      indicators: ALL_MACRO_INDICATORS,
      sources: ALL_SOURCE_GROUNDINGS,
    });
  }
  return res.json({
    indicators: getRelevantMacroIndicators(topic),
    sources: getRelevantSourceGroundings(topic),
  });
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoSight server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
