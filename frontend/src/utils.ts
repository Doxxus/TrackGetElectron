export function parseProgress(line: string): number | null {
  const match = line.match(/(\d+\.\d+)%/);
  return match ? parseFloat(match[1]) : null;
}

export function parseTrackTitle(line: string): string | null {
  const match = line.match(/\[download\] Destination: (.+)/);
  return match ? match[1] : null;
}