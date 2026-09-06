import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  UploadCloud, 
  Layers, 
  Trash2, 
  ChevronRight, 
  ExternalLink,
  History,
  Tag,
  ArrowUpRight,
  Filter,
  Check,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Scale,
  Calendar,
  Compass,
  Edit3,
  BookmarkCheck,
  ShieldAlert
} from 'lucide-react';
import { KnowledgeItem, CuratedBundle, ThesisReview } from '../types';

interface KnowledgeHubViewProps {
  items: KnowledgeItem[];
  onAddItem: (item: Omit<KnowledgeItem, 'id' | 'createdAt'>) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem?: (updatedItem: KnowledgeItem) => void;
  onLoadIntoPrism: (item: KnowledgeItem) => void;
  onCurateRelated: (item: KnowledgeItem) => Promise<CuratedBundle>;
}

export const KnowledgeHubView: React.FC<KnowledgeHubViewProps> = ({
  items,
  onAddItem,
  onDeleteItem,
  onUpdateItem,
  onLoadIntoPrism,
  onCurateRelated,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'archive' | 'timeline'>('archive');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'analysis' | 'conversation' | 'note' | 'uploaded_file'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<KnowledgeItem | null>(items[0] || null);

  // New Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'note' | 'uploaded_file' | 'conversation'>('note');
  const [newTags, setNewTags] = useState('');
  const [newMacroCategory, setNewMacroCategory] = useState('통화정책/금리');
  const [newSentiment, setNewSentiment] = useState<'Bullish' | 'Bearish' | 'Neutral/Complex'>('Neutral/Complex');
  const [newScope, setNewScope] = useState<'Macro (거시)' | 'Micro (미시/산업)'>('Macro (거시)');

  // Thesis Review Log Modal / Form
  const [editingReviewItem, setEditingReviewItem] = useState<KnowledgeItem | null>(null);
  const [reviewOriginalThesis, setReviewOriginalThesis] = useState('');
  const [reviewTargetDate, setReviewTargetDate] = useState('');
  const [reviewRealizedOutcome, setReviewRealizedOutcome] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'pending' | 'accurate' | 'partial' | 'inaccurate'>('pending');
  const [reviewLessons, setReviewLessons] = useState('');

  // Curate Related state
  const [isCurating, setIsCurating] = useState(false);
  const [curatedResult, setCuratedResult] = useState<CuratedBundle | null>(null);

  // Unique tags and categories
  const allTags = Array.from(new Set(items.flatMap((i) => i.tags))).slice(0, 15);
  const allCategories = Array.from(new Set(items.map((i) => i.macroCategory).filter(Boolean)));

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesTag = !selectedTag || item.tags.includes(selectedTag);
    const matchesCategory = !selectedCategory || item.macroCategory === selectedCategory;
    return matchesSearch && matchesType && matchesTag && matchesCategory;
  });

  const timelineItems = items.filter((item) => !!item.thesisReview);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddItem({
      title: newTitle,
      content: newContent,
      type: newType,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      macroCategory: newMacroCategory,
      sentiment: newSentiment,
      scope: newScope,
    });

    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setShowAddModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setNewContent(content);
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      setNewType('uploaded_file');
    };
    reader.readAsText(file);
  };

  const handleCurate = async (item: KnowledgeItem) => {
    setIsCurating(true);
    setCuratedResult(null);
    try {
      const result = await onCurateRelated(item);
      setCuratedResult(result);
      if (onUpdateItem) {
        onUpdateItem({
          ...item,
          curatedBundle: result,
        });
      }
    } catch (err: any) {
      console.error('Curate failed:', err);
    } finally {
      setIsCurating(false);
    }
  };

  const handleOpenReviewModal = (item: KnowledgeItem) => {
    setEditingReviewItem(item);
    setReviewOriginalThesis(item.thesisReview?.originalThesis || item.title);
    setReviewTargetDate(item.thesisReview?.targetDate || '3개월 후 시장 검증');
    setReviewRealizedOutcome(item.thesisReview?.realizedOutcome || '');
    setReviewStatus(item.thesisReview?.outcomeStatus || 'pending');
    setReviewLessons(item.thesisReview?.retrospectiveLessons || '');
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReviewItem || !onUpdateItem) return;

    const updatedReview: ThesisReview = {
      originalThesis: reviewOriginalThesis,
      targetDate: reviewTargetDate,
      realizedOutcome: reviewRealizedOutcome,
      outcomeStatus: reviewStatus,
      retrospectiveLessons: reviewLessons,
      reviewedAt: new Date().toISOString(),
    };

    onUpdateItem({
      ...editingReviewItem,
      thesisReview: updatedReview,
    });

    if (activeItem?.id === editingReviewItem.id) {
      setActiveItem({
        ...editingReviewItem,
        thesisReview: updatedReview,
      });
    }

    setEditingReviewItem(null);
  };

  return (
    <div id="knowledge-hub-view" className="space-y-6">
      {/* Top Banner & Sub-tabs */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Knowledge Hub & Timeline <span className="text-xs font-normal text-blue-400">— 지식 서고 & 가설 복습</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                F05 오토 큐레이터
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              분석 결과와 레드팀 토론을 영구 보관하고, AI 연관 탐색 및 과거 가설 대조(Thesis vs Realized)로 사후 편향을 교정합니다.
            </p>
          </div>
        </div>

        {/* View Mode Switcher & Add Button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              id="subtab-archive"
              onClick={() => setActiveSubTab('archive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'archive'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>지식 아카이브</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {items.length}
              </span>
            </button>
            <button
              id="subtab-timeline"
              onClick={() => setActiveSubTab('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'timeline'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>가설 복습 타임라인</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
                {timelineItems.length}
              </span>
            </button>
          </div>

          <button
            id="btn-open-add-note-modal"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>새 노트 작성</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: ARCHIVE VIEW */}
      {activeSubTab === 'archive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Filter & List */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search & Type Filters */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="지식 서고 검색 (제목, 메커니즘, 키워드)..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Type Pills */}
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'analysis', 'conversation', 'note', 'uploaded_file'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer capitalize ${
                      selectedType === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {t === 'all' ? '전체' : t === 'analysis' ? '프리즘 분석' : t === 'conversation' ? '레드팀 토론' : t === 'note' ? '개인 메모' : '업로드 파일'}
                  </button>
                ))}
              </div>

              {/* Macro Category Filter */}
              {allCategories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-slate-500 shrink-0">카테고리:</span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-2 py-0.5 rounded cursor-pointer whitespace-nowrap ${
                      !selectedCategory ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    전체
                  </button>
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                      className={`px-2 py-0.5 rounded cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat ? 'bg-blue-900/50 text-blue-300 font-semibold border border-blue-700/50' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Tag Cloud */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> 태그:
                  </span>
                  {selectedTag && (
                    <button
                      onClick={() => setSelectedTag(null)}
                      className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] cursor-pointer hover:bg-slate-700"
                    >
                      ✕ 해제
                    </button>
                  )}
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition cursor-pointer ${
                        selectedTag === tag
                          ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60 text-slate-500 text-xs">
                  조건에 일치하는 지식 서고 항목이 없습니다.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = activeItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActiveItem(item);
                        setCuratedResult(item.curatedBundle || null);
                      }}
                      className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 border-blue-500/70 shadow-lg shadow-blue-950/20 ring-1 ring-blue-500/30'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-blue-300">
                              {item.macroCategory}
                            </span>
                            {item.scope && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 text-slate-400 border border-slate-800">
                                {item.scope}
                              </span>
                            )}
                            {item.thesisReview && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                                item.thesisReview.outcomeStatus === 'accurate'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : item.thesisReview.outcomeStatus === 'partial'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : item.thesisReview.outcomeStatus === 'inaccurate'
                                      ? 'bg-rose-500/20 text-rose-300'
                                      : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                <Clock className="w-2.5 h-2.5" />
                                {item.thesisReview.outcomeStatus === 'accurate' ? '가설 적중' : item.thesisReview.outcomeStatus === 'partial' ? '부분 적중' : item.thesisReview.outcomeStatus === 'inaccurate' ? '오판/괴리' : '가설 관찰중'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-100 line-clamp-2">
                          {item.title}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.content}
                        </p>
                      </div>

                      {/* Tags row */}
                      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="text-[10px] text-slate-400 font-mono">
                              #{t}
                            </span>
                          ))}
                        </div>
                        <span className={`text-[10px] font-medium ${
                          item.sentiment === 'Bullish' ? 'text-emerald-400' : item.sentiment === 'Bearish' ? 'text-red-400' : 'text-slate-400'
                        }`}>
                          {item.sentiment}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Item Detail & Auto-Curator */}
          <div className="lg:col-span-7 space-y-4">
            {activeItem ? (
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-xl">
                {/* Item Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-400">
                        {activeItem.macroCategory}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400">
                        {new Date(activeItem.createdAt).toLocaleString()}
                      </span>
                      {activeItem.scope && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs text-slate-400">{activeItem.scope}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {activeItem.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReviewModal(activeItem)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                      title="가설 복습 및 현실화 결과 기록"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{activeItem.thesisReview ? '복습 일지 수정' : '가설 복습 등록'}</span>
                    </button>

                    <button
                      onClick={() => onLoadIntoPrism(activeItem)}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                      title="이 자료로 프리즘 분석 실행"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>프리즘 재분석</span>
                    </button>

                    <button
                      onClick={() => onDeleteItem(activeItem.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition cursor-pointer"
                      title="항목 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Thesis Review Card (If registered) */}
                {activeItem.thesisReview && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300">
                          가설 vs 시장 현실화 복습 일지 (Thesis vs Realized)
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        activeItem.thesisReview.outcomeStatus === 'accurate'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : activeItem.thesisReview.outcomeStatus === 'partial'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : activeItem.thesisReview.outcomeStatus === 'inaccurate'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {activeItem.thesisReview.outcomeStatus === 'accurate' ? '가설 적중 ✓' : activeItem.thesisReview.outcomeStatus === 'partial' ? '부분 적중 (괴리 존재)' : activeItem.thesisReview.outcomeStatus === 'inaccurate' ? '가설 오판 (사각지대 노출)' : '관찰 대기 중'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px] block">수립 가설 및 검증 시계:</span>
                        <p className="text-slate-200 mt-0.5">{activeItem.thesisReview.originalThesis}</p>
                        <span className="text-[10px] text-amber-400 font-mono mt-1 block">
                          목표 검증: {activeItem.thesisReview.targetDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">실제 시장의 현실화 결과:</span>
                        <p className="text-slate-200 mt-0.5">
                          {activeItem.thesisReview.realizedOutcome || '아직 현실화 결과가 기록되지 않았습니다.'}
                        </p>
                      </div>
                    </div>

                    {activeItem.thesisReview.retrospectiveLessons && (
                      <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200">
                        <strong className="text-amber-300 block mb-0.5">사후 회고 및 편향 피드백:</strong>
                        {activeItem.thesisReview.retrospectiveLessons}
                      </div>
                    )}
                  </div>
                )}

                {/* Content Body */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
                  {activeItem.content}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400">분류 태그:</span>
                  {activeItem.tags.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* F05: AI Auto-Curator & Related Materials Explorer */}
                <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-blue-950/30 via-slate-950 to-slate-950 border border-blue-800/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-blue-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span>F05. Auto-Curator &amp; 연관 자료 AI 자동 탐색</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        소외된 반대편 시각(Anti-Consensus), 교차 거시 테마, 역사적 사건을 자동으로 묶어 정리합니다.
                      </p>
                    </div>

                    <button
                      id="btn-curate-related"
                      onClick={() => handleCurate(activeItem)}
                      disabled={isCurating}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition whitespace-nowrap cursor-pointer"
                    >
                      {isCurating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>연관 지식 자동 발굴 중...</span>
                        </>
                      ) : (
                        <>
                          <History className="w-3.5 h-3.5" />
                          <span>연관 자료 AI 탐색·정리</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Curated Result Display */}
                  {(curatedResult || activeItem.curatedBundle) && (
                    <div className="pt-3 border-t border-slate-800 space-y-4 text-xs">
                      {/* Curated Summary */}
                      <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-900/40 text-blue-100">
                        <span className="font-semibold text-blue-300 block mb-1">
                          구조적 연관성 총평 (Curated Synthesis):
                        </span>
                        <p className="leading-relaxed">
                          {curatedResult?.curatedSummary || activeItem.curatedBundle?.curatedSummary}
                        </p>
                      </div>

                      {/* 1. Anti-Consensus (소외된 반대편 시각) */}
                      {((curatedResult?.antiConsensus || activeItem.curatedBundle?.antiConsensus)?.length ?? 0) > 0 && (
                        <div className="space-y-2">
                          <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>소외된 반대편 시각 (Anti-Consensus Perspective)</span>
                          </span>
                          <div className="space-y-2">
                            {(curatedResult?.antiConsensus || activeItem.curatedBundle?.antiConsensus)!.map((ac, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 space-y-1">
                                <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                                  <span>{ac.title}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                                    비주류 시각
                                  </span>
                                </div>
                                <p className="text-slate-200">{ac.perspective}</p>
                                <p className="text-[11px] text-slate-400">근거: {ac.sourceOrRationale}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. Cross-Macro Themes */}
                      {((curatedResult?.crossMacroThemes || activeItem.curatedBundle?.crossMacroThemes)?.length ?? 0) > 0 && (
                        <div className="space-y-2">
                          <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-400" />
                            <span>상호 교차 거시 테마 &amp; 주시 지표 (Cross-Macro Themes)</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(curatedResult?.crossMacroThemes || activeItem.curatedBundle?.crossMacroThemes)!.map((cmt, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                                <span className="font-semibold text-indigo-300 block text-xs">
                                  {cmt.theme}
                                </span>
                                <p className="text-slate-300 text-[11px] leading-relaxed">
                                  {cmt.impactAnalysis}
                                </p>
                                {cmt.watchIndicators?.length > 0 && (
                                  <div className="text-[10px] text-slate-500 pt-1">
                                    주시 지표: {cmt.watchIndicators.join(', ')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. Historical Cases */}
                      {((curatedResult?.historicalCases || activeItem.curatedBundle?.historicalCases)?.length ?? 0) > 0 && (
                        <div className="space-y-2">
                          <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5" />
                            <span>관련 금융사 역사적 사건 (Historical Parallels)</span>
                          </span>
                          <div className="space-y-2">
                            {(curatedResult?.historicalCases || activeItem.curatedBundle?.historicalCases)!.map((hc, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-amber-300">{hc.title}</span>
                                  <span className="text-slate-400 font-mono text-[11px]">{hc.period}</span>
                                </div>
                                <p className="text-slate-300 text-xs">{hc.relevance}</p>
                                <p className="text-[11px] text-amber-200/90">교훈: {hc.keyTakeaway}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended Tags */}
                      {((curatedResult?.recommendedTags || activeItem.curatedBundle?.recommendedTags)?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
                          <span className="text-[11px] text-slate-400">추천 태그:</span>
                          {(curatedResult?.recommendedTags || activeItem.curatedBundle?.recommendedTags)!.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 text-[10px] font-mono">
                              +{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
                항목을 선택하여 상세 내용과 AI 연관 자료를 열람하세요.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: THESIS VS REALIZED TIMELINE */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 border border-amber-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>복습 타임라인 (Thesis vs Realized Timeline)</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                &ldquo;과거의 나는 무엇을 예측했고, 실제 시장은 어떻게 움직였는가?&rdquo; &mdash; 기록된 가설과 실제 시장 결과를 대조하여 확증 편향을 교정하는 자기 성찰 타임라인입니다.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                적중 {timelineItems.filter(i => i.thesisReview?.outcomeStatus === 'accurate').length}건
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                부분 괴리 {timelineItems.filter(i => i.thesisReview?.outcomeStatus === 'partial').length}건
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                오판/교정 {timelineItems.filter(i => i.thesisReview?.outcomeStatus === 'inaccurate').length}건
              </span>
            </div>
          </div>

          {timelineItems.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <Clock className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                아직 등록된 가설 복습 일지가 없습니다.
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                지식 아카이브의 노트나 분석에서 [가설 복습 등록] 버튼을 눌러 과거 예측과 현실화 결과를 기록해 보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {timelineItems.map((item, idx) => {
                const tr = item.thesisReview!;
                const statusColor = 
                  tr.outcomeStatus === 'accurate' 
                    ? 'border-emerald-500/60 bg-emerald-950/20' 
                    : tr.outcomeStatus === 'partial' 
                      ? 'border-amber-500/60 bg-amber-950/20' 
                      : tr.outcomeStatus === 'inaccurate'
                        ? 'border-rose-500/60 bg-rose-950/20'
                        : 'border-blue-500/60 bg-blue-950/20';

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-5 sm:p-6 shadow-xl transition space-y-4 ${statusColor}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-white">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          tr.outcomeStatus === 'accurate'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : tr.outcomeStatus === 'partial'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : tr.outcomeStatus === 'inaccurate'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}>
                          {tr.outcomeStatus === 'accurate' ? '✓ 가설 적중' : tr.outcomeStatus === 'partial' ? '⚡ 부분 적중 (괴리 발생)' : tr.outcomeStatus === 'inaccurate' ? '✕ 가설 오판 (사각지대 노출)' : '관찰 대기'}
                        </span>

                        <button
                          onClick={() => handleOpenReviewModal(item)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>일지 수정</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Original Thesis */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-blue-300 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5" />
                            과거 수립했던 가설 (Original Thesis)
                          </span>
                          <span className="text-slate-500 text-[11px] font-mono">
                            시계: {tr.targetDate || '기본 3개월'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {tr.originalThesis}
                        </p>
                      </div>

                      {/* Right: Realized Outcome */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-amber-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            실제 시장 현실화 결과 (Realized Outcome)
                          </span>
                          {tr.reviewedAt && (
                            <span className="text-slate-500 text-[11px] font-mono">
                              기록: {new Date(tr.reviewedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {tr.realizedOutcome || '현실화 결과를 아직 입력하지 않았습니다.'}
                        </p>
                      </div>
                    </div>

                    {/* Retrospective Lessons */}
                    {tr.retrospectiveLessons && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-900/40 text-xs text-amber-100 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-300 block mb-0.5">사후 편향 교정 &amp; 학습된 교훈 (Lessons Learned):</strong>
                          <p className="leading-relaxed">{tr.retrospectiveLessons}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: New Note */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              새 경제 지식 / 메모 작성
            </h3>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 2024년 4분기 한국 수출과 환율 변동성 관찰"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">거시 영역</label>
                  <select
                    value={newMacroCategory}
                    onChange={(e) => setNewMacroCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  >
                    <option value="통화정책/금리">통화정책/금리</option>
                    <option value="외환/환율">외환/환율</option>
                    <option value="인플레이션/물가">인플레이션/물가</option>
                    <option value="부동산/신용">부동산/신용</option>
                    <option value="산업/반도체/AI">산업/반도체/AI</option>
                    <option value="지정학/원자재">지정학/원자재</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">분석 스코프</label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  >
                    <option value="Macro (거시)">Macro (거시 전반)</option>
                    <option value="Micro (미시/산업)">Micro (미시/특정 섹터)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">본문 내용 / 가설</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="경제적 논점, 메커니즘, 관찰한 시장 반응 등을 자유롭게 기록하세요..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="금리인하, 환율, 반도체, 수출"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="text-slate-400 block mb-1">텍스트 파일 첨부 (선택)</label>
                <input
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={handleFileUpload}
                  className="w-full text-slate-400 text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
                >
                  서고에 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Thesis Review */}
      {editingReviewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                가설 vs 시장 현실화 복습 일지 작성
              </h3>
              <button
                onClick={() => setEditingReviewItem(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">원래 세웠던 가설 (Original Thesis)</label>
                <textarea
                  value={reviewOriginalThesis}
                  onChange={(e) => setReviewOriginalThesis(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">목표 시계 (Target Horizon)</label>
                  <input
                    type="text"
                    value={reviewTargetDate}
                    onChange={(e) => setReviewTargetDate(e.target.value)}
                    placeholder="예: 3개월 후, 2024년 4분기"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">가설 적중 판정</label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  >
                    <option value="pending">관찰 대기 중 (Pending)</option>
                    <option value="accurate">가설 적중 (Accurate)</option>
                    <option value="partial">부분 적중 / 괴리 발생 (Partial)</option>
                    <option value="inaccurate">가설 오판 / 사각지대 노출 (Inaccurate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">실제 시장의 현실화 결과 (Realized Outcome)</label>
                <textarea
                  value={reviewRealizedOutcome}
                  onChange={(e) => setReviewRealizedOutcome(e.target.value)}
                  placeholder="예: 연준 금리 인하 후 달러 인덱스가 103선에서 100까지 급락했으나, 이후 미 대선 불확실성으로 104로 재급등함. 원/달러 환율은 하락하지 않고 상승하여 가설과 괴리됨."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">사후 교훈 및 편향 회고 (Lessons Learned)</label>
                <textarea
                  value={reviewLessons}
                  onChange={(e) => setReviewLessons(e.target.value)}
                  placeholder="예: 금리 차이만 보고 달러 약세를 단정했으나, 글로벌 안전자산 선호와 지정학 리스크 변수를 간과했음. 다음부터는 DXY와 함께 글로벌 위험선호 지수를 병행 관찰해야 함."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingReviewItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold cursor-pointer"
                >
                  복습 일지 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
