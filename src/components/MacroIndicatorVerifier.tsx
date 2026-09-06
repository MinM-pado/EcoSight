import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ShieldCheck, 
  ExternalLink, 
  Database,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  Calendar,
  History
} from 'lucide-react';
import { MacroIndicator, SourceGrounding } from '../types';
import { ALL_MACRO_INDICATORS } from '../data/macroIndicators';

interface Props {
  indicators: MacroIndicator[];
  sourceGroundings?: SourceGrounding[];
  topicTitle?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export const MacroIndicatorVerifier: React.FC<Props> = ({
  indicators,
  sourceGroundings = [],
  topicTitle,
  className = '',
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedSeriesId, setExpandedSeriesId] = useState<string | null>(null);

  const filteredIndicators = selectedCategory === 'all'
    ? indicators
    : indicators.filter(ind => ind.category === selectedCategory);

  // SVG Sparkline generator
  const renderSparkline = (points: number[], changeType: 'up' | 'down' | 'neutral') => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 110;
    const height = 36;
    const padding = 4;

    const coords = points.map((val, idx) => {
      const x = padding + (idx / (points.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    const pathD = `M ${coords.join(' L ')}`;
    const strokeColor = changeType === 'up' 
      ? '#10b981' // emerald
      : changeType === 'down' 
        ? '#ef4444' // red
        : '#94a3b8'; // slate

    // Area fill
    const firstX = padding;
    const lastX = width - padding;
    const areaD = `${pathD} L ${lastX},${height} L ${firstX},${height} Z`;

    return (
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${points[0]}-${changeType}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${points[0]}-${changeType})`} />
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* End pulse dot */}
        {coords.length > 0 && (
          <circle 
            cx={coords[coords.length - 1].split(',')[0]} 
            cy={coords[coords.length - 1].split(',')[1]} 
            r="3" 
            fill={strokeColor} 
          />
        )}
      </svg>
    );
  };

  const getReliabilityBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Official Fed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Gov Bureau':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Central Bank':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Academic':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div id="macro-indicator-verifier" className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl transition-all ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                핵심 거시 지표 & 근거 데이터 검증
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Source Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {topicTitle ? `주제: "${topicTitle}"에 직접 연결된 실시간 기준 지표` : 'AI 가설과 반론의 신뢰성을 담보하는 공식 거시 지표 및 출처'}
            </p>
          </div>
        </div>

        <button
          id="btn-toggle-indicator-panel"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          title={isExpanded ? '접기' : '펼치기'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-5">
          {/* Category Filter Pills */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Layers className="w-3 h-3" />
                분류 필터:
              </span>
              {(['all', 'Interest', 'FX', 'Inflation', 'Commodity', 'Market'] as const).map(cat => {
                const labels: Record<string, string> = {
                  all: '전체',
                  Interest: '금리/채권',
                  FX: '환율/달러',
                  Inflation: '인플레이션',
                  Commodity: '원자재/금',
                  Market: '증시밸류',
                };
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                      active 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {labels[cat]}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-500">
              연동 지표: {filteredIndicators.length}개
            </span>
          </div>

          {/* Indicator Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredIndicators.map((ind) => {
              const isUp = ind.changeType === 'up';
              const isDown = ind.changeType === 'down';

              return (
                <div 
                  key={ind.id} 
                  className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Title + Category Pill */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            {ind.code}
                          </span>
                          {ind.apiProvider && (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono border ${
                              ind.apiProvider === 'FRED' 
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : ind.apiProvider === 'ECOS'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}>
                              {ind.apiProvider}
                            </span>
                          )}
                          {ind.officialSeriesId && (
                            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                              [{ind.officialSeriesId}]
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 mt-0.5">
                          {ind.name}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                        {ind.category}
                      </span>
                    </div>

                    {/* Middle Row: Value + Change + Mini Sparkline */}
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold text-white tracking-tight">
                            {ind.currentValue}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {ind.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
                            isUp 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : isDown 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-slate-800 text-slate-300'
                          }`}>
                            {isUp && <TrendingUp className="w-3 h-3 mr-0.5" />}
                            {isDown && <TrendingDown className="w-3 h-3 mr-0.5" />}
                            {!isUp && !isDown && <Minus className="w-3 h-3 mr-0.5" />}
                            {ind.change} {ind.unit}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {ind.period}
                          </span>
                        </div>
                      </div>

                      {/* Sparkline visual */}
                      <div className="pl-2 flex flex-col items-end">
                        {renderSparkline(ind.sparkline, ind.changeType)}
                        <span className="text-[9px] text-slate-500 mt-1">7일/최근 추이</span>
                      </div>
                    </div>

                    {/* 52-Week Range Bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>52주 저점: {ind.low52w}</span>
                        <span className="text-slate-500 font-medium">52주 레인지</span>
                        <span>52주 고점: {ind.high52w}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 rounded-full w-full" />
                      </div>
                    </div>

                    {/* Topic Context relevance */}
                    {ind.relevanceToTopic && (
                      <p className="text-[11px] text-slate-400 mt-2.5 bg-slate-900/80 rounded-lg p-2 border border-slate-800/60 leading-relaxed">
                        <span className="text-emerald-400 font-semibold mr-1">💡 연계 맥락:</span>
                        {ind.relevanceToTopic}
                      </p>
                    )}

                    {/* Expandable Time Series Data Section */}
                    {ind.timeSeries && ind.timeSeries.length > 0 && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => setExpandedSeriesId(expandedSeriesId === ind.id ? null : ind.id)}
                          className="w-full py-1 px-2 rounded-md bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-[11px] font-medium text-slate-300 flex items-center justify-between transition cursor-pointer"
                        >
                          <span className="flex items-center gap-1 text-slate-400">
                            <History className="w-3 h-3 text-cyan-400" />
                            <span>시계열 실측 데이터 ({ind.timeSeries.length}개 구간)</span>
                          </span>
                          <span className="text-[10px] text-cyan-400 flex items-center gap-0.5">
                            {expandedSeriesId === ind.id ? '상세 접기 ▲' : '내역 보기 ▼'}
                          </span>
                        </button>

                        {expandedSeriesId === ind.id && (
                          <div className="mt-2 p-2 rounded-lg bg-slate-950/90 border border-slate-800 space-y-1.5 text-[10px]">
                            <div className="grid grid-cols-12 text-slate-500 font-mono pb-1 border-b border-slate-800/80 px-1">
                              <span className="col-span-4">기준 일자</span>
                              <span className="col-span-3 text-right">수치 ({ind.unit})</span>
                              <span className="col-span-5 text-right">이벤트/맥락</span>
                            </div>
                            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                              {ind.timeSeries.map((pt, pIdx) => (
                                <div key={pIdx} className="grid grid-cols-12 items-center text-slate-300 hover:bg-slate-900/50 p-1 rounded">
                                  <span className="col-span-4 font-mono text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5 text-slate-500" />
                                    {pt.date}
                                  </span>
                                  <span className="col-span-3 text-right font-mono font-semibold text-white">
                                    {pt.formattedValue || pt.value}
                                  </span>
                                  <span className="col-span-5 text-right text-slate-400 truncate" title={pt.sourceNote || ''}>
                                    {pt.sourceNote || '-'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Source */}
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3 text-slate-400" />
                      출처: {ind.source}
                    </span>
                    <span className="text-emerald-400/90 font-medium flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      검증 완료
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grounding Source Reference Section */}
          {sourceGroundings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                공식 레퍼런스 출처 (Official Source Grounding)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {sourceGroundings.map((src, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getReliabilityBadgeStyle(src.reliabilityBadge)}`}>
                          {src.reliabilityBadge}
                        </span>
                        <span className="text-[10px] text-slate-500">{src.dateOrPeriod}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 mt-1.5 line-clamp-1" title={src.title}>
                        {src.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        {src.keyStat}
                      </p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{src.publisher}</span>
                      {src.referenceUrl && (
                        <a 
                          href={src.referenceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-0.5"
                        >
                          원문 <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
