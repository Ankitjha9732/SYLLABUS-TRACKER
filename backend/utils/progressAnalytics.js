const pad = (n) => String(n).padStart(2, '0');

const dateKey = (d) => {
  const date = new Date(d);
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  return `${y}-${m}-${day}`;
};

const todayUtc = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

/**
 * Returns the last `days` days as an array of { date: 'yyyy-mm-dd', count }.
 * Uses UTC days so the window lines up with the DB's UTC timestamps.
 */
export const activityHeatmap = (progressRecords, days = 90) => {
  const map = {};
  progressRecords.forEach((p) => {
    const keys = [p.createdAt, p.updatedAt, p.startedAt, p.completedAt]
      .filter(Boolean)
      .map((d) => dateKey(d));
    const unique = [...new Set(keys)];
    unique.forEach((key) => {
      map[key] = (map[key] || 0) + 1;
    });
  });

  const result = [];
  const start = todayUtc();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(start.getTime() - i * 86400000);
    result.push({ date: dateKey(d), count: map[dateKey(d)] || 0 });
  }
  return result;
};

/**
 * Computes current and longest streak from progress records.
 * A "day" counts if it has at least one activity record.
 */
export const getStreak = (progressRecords) => {
  const map = {};
  progressRecords.forEach((p) => {
    const keys = [p.createdAt, p.updatedAt, p.startedAt, p.completedAt]
      .filter(Boolean)
      .map((d) => dateKey(d));
    const unique = [...new Set(keys)];
    unique.forEach((key) => {
      map[key] = (map[key] || 0) + 1;
    });
  });

  const days = Object.keys(map);
  if (days.length === 0) return { current: 0, longest: 0 };

  // Current streak: count back from today (or yesterday if today has no activity yet).
  let current = 0;
  let cursor = todayUtc();
  if (!map[dateKey(cursor)]) cursor = new Date(cursor.getTime() - 86400000);
  while (map[dateKey(cursor)]) {
    current += 1;
    cursor = new Date(cursor.getTime() - 86400000);
  }

  // Longest streak over all unique sorted keys.
  const sorted = days.sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  sorted.forEach((d) => {
    const [y, m, day] = d.split('-').map(Number);
    const cur = Date.UTC(y, m - 1, day);
    if (prev !== null && cur - prev === 86400000) {
      run += 1;
    } else {
      run = 1;
    }
    prev = cur;
    if (run > longest) longest = run;
  });

  return { current, longest };
};