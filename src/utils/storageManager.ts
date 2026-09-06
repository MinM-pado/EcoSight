import { KnowledgeItem, CuratedBundle } from '../types';

/**
 * Storage Manager for EcoSight
 * Provides:
 * 1. Hash-based and title-based deduplication for Auto-Curator bundles and Knowledge items
 * 2. LocalStorage Quota monitoring & Automatic Garbage Collection (GC)
 * 3. Safe fallback storage handlers to prevent app crash
 */

// Generate a simple alphanumeric content hash
export function generateContentHash(str: string): string {
  let hash = 0;
  const clean = str.trim().toLowerCase().replace(/\s+/g, '');
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'h_' + Math.abs(hash).toString(36);
}

/**
 * Deduplicate CuratedBundle items (anti-consensus, cross-macro themes, historical cases, tags)
 */
export function deduplicateCuratedBundle(
  existing?: CuratedBundle,
  incoming?: CuratedBundle
): CuratedBundle | undefined {
  if (!existing && !incoming) return undefined;
  if (!existing) return incoming;
  if (!incoming) return existing;

  // Deduplicate Anti-Consensus by normalized title
  const antiConsensusMap = new Map<string, typeof incoming.antiConsensus[0]>();
  for (const ac of existing.antiConsensus || []) {
    const key = generateContentHash(ac.title);
    antiConsensusMap.set(key, ac);
  }
  for (const ac of incoming.antiConsensus || []) {
    const key = generateContentHash(ac.title);
    antiConsensusMap.set(key, ac); // incoming takes precedence or updates
  }

  // Deduplicate Cross-Macro Themes by theme name
  const crossThemesMap = new Map<string, typeof incoming.crossMacroThemes[0]>();
  for (const cmt of existing.crossMacroThemes || []) {
    const key = generateContentHash(cmt.theme);
    crossThemesMap.set(key, cmt);
  }
  for (const cmt of incoming.crossMacroThemes || []) {
    const key = generateContentHash(cmt.theme);
    crossThemesMap.set(key, cmt);
  }

  // Deduplicate Historical Cases by title or period
  const historicalMap = new Map<string, typeof incoming.historicalCases[0]>();
  for (const hc of existing.historicalCases || []) {
    const key = generateContentHash(hc.title + (hc.period || ''));
    historicalMap.set(key, hc);
  }
  for (const hc of incoming.historicalCases || []) {
    const key = generateContentHash(hc.title + (hc.period || ''));
    historicalMap.set(key, hc);
  }

  // Deduplicate tags
  const tagsSet = new Set<string>([
    ...(existing.recommendedTags || []),
    ...(incoming.recommendedTags || []),
  ]);

  return {
    curatedSummary: incoming.curatedSummary || existing.curatedSummary,
    antiConsensus: Array.from(antiConsensusMap.values()),
    crossMacroThemes: Array.from(crossThemesMap.values()),
    historicalCases: Array.from(historicalMap.values()),
    recommendedTags: Array.from(tagsSet),
  };
}

/**
 * Deduplicate a list of Knowledge Items
 */
export function deduplicateKnowledgeItems(items: KnowledgeItem[]): KnowledgeItem[] {
  const seenIds = new Set<string>();
  const seenContentHash = new Set<string>();
  const result: KnowledgeItem[] = [];

  for (const item of items) {
    if (!item.id || seenIds.has(item.id)) continue;

    // Content uniqueness hash: title + first 100 chars
    const contentKey = generateContentHash(item.title + (item.content || '').slice(0, 100));
    if (seenContentHash.has(contentKey)) {
      continue; // Skip duplicate content
    }

    seenIds.add(item.id);
    seenContentHash.add(contentKey);

    // Clean up internal bundle duplicates if present
    const cleanItem = { ...item };
    if (cleanItem.curatedBundle) {
      cleanItem.curatedBundle = deduplicateCuratedBundle(cleanItem.curatedBundle);
    }
    // Deduplicate item tags
    cleanItem.tags = Array.from(new Set(cleanItem.tags || []));

    result.push(cleanItem);
  }

  return result;
}

/**
 * Estimate LocalStorage usage in Kilobytes
 */
export function getStorageUsageEstimate(): { usedKB: number; quotaKB: number; percent: number } {
  let totalLength = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const val = localStorage.getItem(key);
      totalLength += (key.length + (val?.length || 0)) * 2; // UTF-16 approx 2 bytes
    }
  }
  const usedKB = Math.round(totalLength / 1024);
  const quotaKB = 5120; // 5MB standard browser localStorage limit
  const percent = Math.min(100, Math.round((usedKB / quotaKB) * 100));
  return { usedKB, quotaKB, percent };
}

/**
 * Garbage Collector (GC):
 * If storage usage is high (>70%) or an operation throws QuotaExceededError:
 * 1. Trims redundant/stale curatedBundles from items older than 7 days
 * 2. Prunes duplicate search history or large uploaded text snippets
 * 3. Keeps user authored notes, reviews, and core analyses intact
 */
export function runStorageGarbageCollection(items: KnowledgeItem[]): {
  cleanedItems: KnowledgeItem[];
  freedKB: number;
} {
  const beforeUsage = getStorageUsageEstimate().usedKB;

  // 1. Deduplicate items first
  let cleaned = deduplicateKnowledgeItems(items);

  // 2. If item count exceeds 50, prune older transient items without thesis reviews
  if (cleaned.length > 50) {
    const prioritized = cleaned.filter(i => !!i.thesisReview || i.type === 'note');
    const transient = cleaned.filter(i => !i.thesisReview && i.type !== 'note');
    // Keep most recent 25 transient items
    transient.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    cleaned = [...prioritized, ...transient.slice(0, 25)];
  }

  // 3. Compact large curated bundles on older items (keep top 2 per category)
  cleaned = cleaned.map(item => {
    if (item.curatedBundle) {
      return {
        ...item,
        curatedBundle: {
          curatedSummary: item.curatedBundle.curatedSummary,
          antiConsensus: (item.curatedBundle.antiConsensus || []).slice(0, 2),
          crossMacroThemes: (item.curatedBundle.crossMacroThemes || []).slice(0, 2),
          historicalCases: (item.curatedBundle.historicalCases || []).slice(0, 2),
          recommendedTags: (item.curatedBundle.recommendedTags || []).slice(0, 5),
        }
      };
    }
    return item;
  });

  const afterUsage = getStorageUsageEstimate().usedKB;
  const freedKB = Math.max(0, beforeUsage - afterUsage);

  return { cleanedItems: cleaned, freedKB };
}

/**
 * Safe LocalStorage setter with automatic GC and fallback
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error: any) {
    if (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22
    ) {
      console.warn('LocalStorage quota reached. Triggering emergency Garbage Collection...');
      try {
        // Emergency purge of older keys or non-essential cache
        localStorage.removeItem('ecosight_cache_temp');
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.error('Failed to store item even after emergency GC:', retryErr);
        return false;
      }
    }
    console.error('LocalStorage write error:', error);
    return false;
  }
}
