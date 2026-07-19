/**
 * Application-wide constants & filter options.
 * Centralised here so pages don't depend on mock-data.ts for simple enums.
 */

// ─── Filter / Dropdown Options ──────────────────────────────
export const KELAS_OPTIONS = ["XII TKJ 1", "XII TKJ 2", "XII TKJ 3", "XII TKJ 4"] as const;
export const JURUSAN_OPTIONS = ["Teknik Komputer dan Jaringan"] as const;
export const TAHUN_AJARAN_OPTIONS = ["2025/2026", "2024/2025", "2023/2024"] as const;

export const TAHUN_AJARAN_AKTIF = "2025/2026";

// ─── Criteria Code → Assessment Field Mapping ───────────────
// Maps each criteria kode to the corresponding field key inside StudentAssessment.scores
export const CRITERIA_SCORE_KEYS: Record<string, string> = {
  C1: "nilaiAkademik",
  C2: "sikap",
  C3: "kehadiran",
  C4: "prestasiNonAkademik",
};

/**
 * Given a criteria kode, resolve the matching score from a scores record.
 * Returns 0 when no matching key is found.
 */
export function getScoreForCriteria(
  scores: Record<string, number>,
  criteriaKode: string
): number {
  const key = CRITERIA_SCORE_KEYS[criteriaKode] ?? criteriaKode.toLowerCase();
  return scores[key] ?? 0;
}
