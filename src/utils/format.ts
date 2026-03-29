// 収支を符号付きで表示（例: +1,250 / -500）
export function formatIncome(income: number): string {
  const sign = income >= 0 ? '+' : '';
  return `${sign}${income.toLocaleString()}`;
}

// パーセント表示（例: 21.5%）
export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

// 日付を表示用にフォーマット（例: 3/25）
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 日付を詳細表示用にフォーマット（例: 2026/3/25 14:30）
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${date.getFullYear()}/${month}/${day} ${hours}:${minutes}`;
}

// 素点表示（例: 35,200）
export function formatScore(score: number): string {
  return score.toLocaleString();
}
