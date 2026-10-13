export function parseProgress(line: string): number | null {
  const match = line.match(/(\d+(?:\.\d+)?)%/);
  return match ? parseFloat(match[1]) : null;
}

export function parseTrackTitle(line: string): string | null {
  const match = line.match(/\[download\] Destination: (.+)/);
  return match ? match[1] : null;
}
export function parseItem(line: string): { index: number; total: number } | null {
  const match = line.match(/Downloading item (\d+) of (\d+)/);
  return match ? { index: parseInt(match[1], 10) - 1, total: parseInt(match[2], 10) } : null;
}
