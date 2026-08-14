/**
 * Small, reusable helpers for translating list-query params into Mongo query
 * fragments. Kept framework-free so any service can compose them.
 */

export function buildDateRangeFilter(
  startDate?: string,
  endDate?: string,
): Record<string, Date> | undefined {
  if (!startDate && !endDate) return undefined
  const range: Record<string, Date> = {}
  if (startDate) {
    const from = new Date(startDate)
    if (!isNaN(from.getTime())) range.$gte = from
  }
  if (endDate) {
    // Include the entire end day.
    const to = new Date(endDate)
    if (!isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999)
      range.$lte = to
    }
  }
  return Object.keys(range).length ? range : undefined
}

export function buildSort(
  sortBy = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
): Record<string, 1 | -1> {
  return { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
}

/** Escapes user input before using it inside a RegExp (avoids ReDoS/breakage). */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Case-insensitive "contains" regex for flexible partial search. */
export function containsRegex(value: string): RegExp {
  return new RegExp(escapeRegex(value.trim()), 'i')
}
