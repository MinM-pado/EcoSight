import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  Cpu, 
  Layers, 
  Swords, 
  Lock, 
  Bell, 
  DollarSign, 
  BadgeCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { AIEngineConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentEngineConfig: AIEngineConfig;
  onOpenEngineModal: () => void;
}

export const SubscriptionTierModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentEngineConfig,
  onOpenEngineModal,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [selectedPlanForNotice, setSelectedPlanForNotice] = useState<'tier2' | 'tier3' | null>(null);

  if (!isOpen) return null;

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) {
      alert('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    // Store in localStorage for reservation
    try {
      const existing = JSON.parse(localStorage.getItem('ecosight_paid_tier_waitlist') || '[]');
      existing.push({
        email: notifyEmail,
        plan: selectedPlanForNotice || 'tier2',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('ecosight_paid_tier_waitlist', JSON.stringify(existing));
    } catch {
      // ignore
    }
    setNotifySuccess(true);
    setTimeout(() => {
      setNotifySuccess(false);
      setSelectedPlanForNotice(null);
      setNotifyEmail('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">EcoSight 서비스 플랜 & 티어 로드맵</h2>
                <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Hybrid Cloud & Local AI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                로컬 LLM(Ollama/LM Studio) 완전 무료 구동부터, 차후 결제 시스템으로 확장될 고성능 프로·기관용 티어
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Billing Cycle Switch */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-xs font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              월간 구독
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-12 h-6 rounded-full bg-slate-800 border border-slate-700 transition p-0.5"
            >
              <div 
                className={`w-5 h-5 rounded-full bg-amber-400 transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`} 
              />
            </button>
            <span className={`text-xs font-medium flex items-center gap-1 ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
              연간 구독
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300 font-bold">
                20% 할인
              </span>
            </span>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* TIER 1 */}
            <div className="relative rounded-xl border-2 border-emerald-500/40 bg-slate-900/90 p-5 flex flex-col justify-between hover:border-emerald-500/70 transition shadow-lg shadow-emerald-950/20">
              <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold tracking-wider uppercase">
                현재 활성화 (Active)
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-emerald-400">TIER 1</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white">Free Learner & Local AI</h3>
                <p className="text-xs text-slate-400 mt-1">
                  사용자 PC 자원을 활용한 무제한 로컬 LLM 구동 (API 비용 0원)
                </p>

                <div className="my-4 pb-4 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">₩0</span>
                    <span className="text-xs text-slate-400">/ 평생 무료</span>
                  </div>
                  <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                    {currentEngineConfig.provider === 'ollama' ? '🟢 현재 Ollama 로컬 연결 활성' :
                     currentEngineConfig.provider === 'lmstudio' ? '🟢 현재 LM Studio 로컬 연결 활성' :
                     '★ Ollama / LM Studio 언제든 전환 가능'}
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Ollama / LM Studio</strong> 로컬 무제한 연동</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Llama 3.1, Qwen 2.5, Gemma 2 등 오프라인 구동</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>The Prism Analysis 기본 3단계 파급 분석</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Bull vs Bear 대조 학습 & 레드팀 문답</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>지식 서고 및 편식 방지 레이더 기본 제공</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    onClose();
                    onOpenEngineModal();
                  }}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Cpu className="w-4 h-4" />
                  로컬 AI 엔진 설정 / 전환
                </button>
              </div>
            </div>

            {/* TIER 2 */}
            <div className="relative rounded-xl border border-amber-500/50 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 p-5 flex flex-col justify-between hover:border-amber-400 transition shadow-xl">
              <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-bold tracking-wider uppercase shadow-md">
                차후 유료 결제 전환 확장 예정
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-amber-400">TIER 2</span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white">Pro Macro Strategist</h3>
                <p className="text-xs text-slate-400 mt-1">
                  고정밀 Gemini Cloud + 실시간 글로벌 매크로 지표 Grounding 결합
                </p>

                <div className="my-4 pb-4 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">
                      {billingCycle === 'monthly' ? '₩19,000' : '₩15,200'}
                    </span>
                    <span className="text-xs text-slate-400">/ 월 (예정)</span>
                  </div>
                  <p className="text-[11px] text-amber-400 mt-1">
                    {billingCycle === 'yearly' ? '연 182,400원 청구 (20% 절약)' : '유연한 월간 구독'}
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Gemini 2.5 Pro / Flash</strong> 초고속 클라우드 무제한</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>FRED / 글로벌 시장 지표</strong> 실시간 검증 Grounding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>100년 금융사 시계열 <strong>Historical Mirror</strong> 풀 리포트</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Auto-Curator</strong>: 소외된 반대편 시각 & 교차 테마 자동 발굴</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>개인 지식 서고 무제한 벡터 임베딩 동기화</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setSelectedPlanForNotice('tier2')}
                  className="w-full py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-md shadow-amber-500/20"
                >
                  <CreditCard className="w-4 h-4" />
                  유료 서비스 오픈 알림 & 얼리버드 예약
                </button>
              </div>
            </div>

            {/* TIER 3 */}
            <div className="relative rounded-xl border border-purple-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/20 p-5 flex flex-col justify-between hover:border-purple-400 transition shadow-xl">
              <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold tracking-wider uppercase">
                기관 / 헤지펀드용 프리미엄
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-purple-400">TIER 3</span>
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white">Institutional Red-Team</h3>
                <p className="text-xs text-slate-400 mt-1">
                  헤지펀드 CIO급 심층 토론, Multi-Agent 대결 및 커스텀 Fine-Tuning
                </p>

                <div className="my-4 pb-4 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">
                      {billingCycle === 'monthly' ? '₩79,000' : '₩63,200'}
                    </span>
                    <span className="text-xs text-slate-400">/ 월 (예정)</span>
                  </div>
                  <p className="text-[11px] text-purple-400 mt-1">
                    전문가/애널리스트 및 패밀리오피스용
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Tier 2의 모든 기능 포함</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>최상위 악마의 대변인(CIO 모드)</strong> 타협 없는 가설 공격</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>정반합(Synthesis) 종합 진단서</strong> 및 채점 PDF 출력</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Multi-Agent 대결 시뮬레이션</strong> (Bull vs Bear AI 자동 격돌)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>자체 <strong>Fine-Tuned 로컬/사설 모델</strong> 전용 엔드포인트 연동</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setSelectedPlanForNotice('tier3')}
                  className="w-full py-2.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-md shadow-purple-600/20"
                >
                  <Building2 className="w-4 h-4" />
                  엔터프라이즈 / 기관 도입 사전 상담
                </button>
              </div>
            </div>
          </div>

          {/* Reservation / Notification Form Modal Section */}
          {selectedPlanForNotice && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 animate-fadeIn">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    {selectedPlanForNotice === 'tier2' ? 'Pro Tier 2' : 'Institutional Tier 3'} 차후 결제 전환 오픈 알림 & 30% 얼리버드 혜택 신청
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    정식 결제 게이트웨이(PG/구독 시스템) 오픈 시 가장 먼저 이메일로 30% 평생 할인 쿠폰과 함께 안내해 드립니다.
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedPlanForNotice(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {notifySuccess ? (
                <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>사전 예약이 완료되었습니다! 정식 오픈 시 가장 먼저 등록된 이메일로 안내해 드립니다.</span>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="알림을 받으실 이메일 주소를 입력하세요"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition whitespace-nowrap"
                  >
                    사전 알림 등록
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Payment Architecture & Tech Specs Roadmap Banner */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-400" />
                차후 결제 시스템(Billing & Payment) 확장 아키텍처 스펙
              </span>
              <span className="text-[11px] font-mono text-slate-500">Stripe / Toss Payments Ready</span>
            </div>
            <p>
              현재 개발·학습 단계에서는 <strong>Tier 1(Local Ollama/LM Studio 0원)</strong> 및 <strong>무료 Gemini 티어</strong>로 100% 무과금 사용 가능합니다.
              차후 상용화 전환 시 웹훅(Webhook) 기반 구독 갱신, 토큰 쿼터 제어, 자동 영수증 발행 모듈이 결합될 수 있도록 모듈러(Modular) 인터페이스로 설계되어 있습니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>개인 PC 로컬 LLM 구동 시 어떤 대화나 데이터도 외부로 전송되지 않습니다.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
