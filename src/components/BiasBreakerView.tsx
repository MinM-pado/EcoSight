import React from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Globe2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { BiasBreakerStats } from '../types';

interface BiasBreakerViewProps {
  stats: BiasBreakerStats;
  onSelectRecommendedTopic: (topicTitle: string) => void;
}

export const BiasBreakerView: React.FC<BiasBreakerViewProps> = ({
  stats,
  onSelectRecommendedTopic,
}) => {
  const totalAnalyzed = stats.bullishCount + stats.bearishCount + stats.neutralCount;
  const bullPct = totalAnalyzed > 0 ? Math.round((stats.bullishCount / totalAnalyzed) * 100) : 50;
  const bearPct = totalAnalyzed > 0 ? Math.round((stats.bearishCount / totalAnalyzed) * 100) : 30;
  const neutralPct = 100 - bullPct - bearPct;

  const totalScope = stats.macroCount + stats.microCount;
  const macroPct = totalScope > 0 ? Math.round((stats.macroCount / totalScope) * 100) : 70;

  // Detect imbalances
  const isSentimentBiased = bullPct >= 70 || bearPct >= 70;
  const isSectorConcentrated = Object.values(stats.sectorDistribution).some((v) => v >= 4);

  return (
    <div id="bias-breaker-view" className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-900/40 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Bias Breaker <span className="text-xs font-normal text-emerald-400">— 편식 방지 모니터</span>
            </h2>
            <p className="text-xs text-slate-300">
              투자자가 자주 빠지는 확증 편향(Information Bias)과 특정 섹터 쏠림을 감시하고, 반대편 균형 시각을 제안합니다.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs">
          <span className="text-slate-400">누적 진단 수:</span>
          <span className="text-emerald-400 font-bold font-mono text-sm">{totalAnalyzed}건</span>
        </div>
      </div>

      {/* Warning Alert if biased */}
      {isSentimentBiased && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <h4 className="font-bold text-amber-300 mb-0.5">
              주의: {bullPct >= 70 ? '낙관 편향(Bullish Bias)' : '비관 편향(Bearish Bias)'} 신호 감지
            </h4>
            <p className="text-amber-200/90">
              {bullPct >= 70
                ? '최근 학습한 이슈의 대다수(70% 이상)가 상승 및 유동성 확장에 치우쳐 있습니다. 잠재적 신용 부실이나 긴축 리스크를 다룬 소외된 주제를 점검하세요.'
                : '최근 비관론에 크게 치우쳐 있습니다. 역사적으로 위기 국면 이면에서 싹텄던 혁신 생산성 수혜 테마를 살펴보세요.'}
            </p>
          </div>
        </div>
      )}

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Metric 1: Bull vs Bear Sentiment Gauge */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>긍정 / 부정 성향 밸런스</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Sentiment</span>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-full rounded-full bg-slate-950 overflow-hidden flex p-0.5 border border-slate-800">
              <div 
                style={{ width: `${bullPct}%` }} 
                className="bg-emerald-500 h-full rounded-l-full transition-all duration-500" 
                title={`낙관: ${bullPct}%`}
              />
              <div 
                style={{ width: `${neutralPct}%` }} 
                className="bg-slate-500 h-full transition-all duration-500" 
                title={`중립: ${neutralPct}%`}
              />
              <div 
                style={{ width: `${bearPct}%` }} 
                className="bg-red-500 h-full rounded-r-full transition-all duration-500" 
                title={`비관: ${bearPct}%`}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                낙관 {bullPct}%
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                중립 {neutralPct}%
              </span>
              <span className="flex items-center gap-1 text-red-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                비관 {bearPct}%
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
            {bullPct >= 65
              ? '수익 기대감에 몰입되어 손실 하방 리스크를 간과하기 쉬운 상태입니다.'
              : bearPct >= 65
              ? '위험 회피 심리로 인해 저평가된 우량 기회를 놓칠 가능성이 큽니다.'
              : '낙관과 비관이 균형 있게 교차하며 건강한 긴장감을 유지하고 있습니다.'}
          </p>
        </div>

        {/* Metric 2: Macro vs Micro Interest Ratio */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>거시(Macro) vs 미시(Micro) 비율</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Scope</span>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-full rounded-full bg-slate-950 overflow-hidden flex p-0.5 border border-slate-800">
              <div 
                style={{ width: `${macroPct}%` }} 
                className="bg-blue-500 h-full rounded-l-full transition-all duration-500" 
              />
              <div 
                style={{ width: `${100 - macroPct}%` }} 
                className="bg-purple-500 h-full rounded-r-full transition-all duration-500" 
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="flex items-center gap-1 text-blue-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                거시(통화/지정학) {macroPct}%
              </span>
              <span className="flex items-center gap-1 text-purple-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                미시(기업/산업) {100 - macroPct}%
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
            {macroPct >= 80
              ? '숲(거시)을 잘 보고 있으나, 개별 기업의 잉여현금흐름과 실질 해자(Micro) 점검을 병행해야 합니다.'
              : macroPct <= 40
              ? '나무(개별 종목)에 매몰되어 금리·환율 등 거시 조류에 휩쓸릴 위험이 있습니다.'
              : '거시 지형과 미시 밸류에이션 간의 밸런스가 이상적입니다.'}
          </p>
        </div>

        {/* Metric 3: Sector Distribution & Blind Spots */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>섹터 집중도 & 소외 섹터</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Sectors</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Object.entries(stats.sectorDistribution).map(([sec, count]) => (
              <span 
                key={sec} 
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  count >= 3
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                {sec} ({count})
              </span>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
            {isSectorConcentrated
              ? '특정 섹터에 관심이 편중되어 있습니다. 순환매 국면에서 소외된 섹터의 반등 가능성을 열어두세요.'
              : '다양한 섹터로 시야를 분산하여 포트폴리오 면역력을 기르고 있습니다.'}
          </p>
        </div>
      </div>

      {/* Suggested Anti-Bias Topics (Action Component) */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>편식 방지 추천 주제 (Counter-Balance Topics)</span>
            </h3>
            <p className="text-xs text-slate-400">
              현재 놓치고 있는 반대편 시각이나 소외된 자산군을 학습하여 사고의 지평을 넓히세요.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.suggestedTopics.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between group hover:border-emerald-500/50 transition"
            >
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2 inline-block">
                  {item.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.reason}
                </p>
              </div>

              <button
                onClick={() => onSelectRecommendedTopic(item.title)}
                className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-medium group-hover:text-emerald-300 transition"
              >
                <span>이 주제로 프리즘 분석</span>
                <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
