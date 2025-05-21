import { ChartData, ComparisonResult } from '../types';

declare global {
  interface Window {
    CarrotSearchFoamTree: any;
  }
}

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(2) + ' KB';
  return (kb / 1024).toFixed(2) + ' MB';
};

export const createDiffSpan = (oldVal: number, newVal: number, diff: number): string => {
  const cls = diff < 0 ? 'text-green-600' : (diff > 0 ? 'text-red-600' : 'text-gray-700');
  const sign = diff < 0 ? '↓ ' : (diff > 0 ? '↑ ' : '');
  const diffFormatted = formatBytes(Math.abs(diff));
  const percentage = ((Math.abs(diff) / (oldVal || 1)) * 100).toFixed(2);
  
  return `
    <div class="flex flex-col">
      <div class="font-medium">${formatBytes(newVal)}</div>
      <div class="text-xs text-gray-500">era ${formatBytes(oldVal)}</div>
      <div class="${cls} text-xs font-medium flex items-center mt-1">
        ${sign}${diffFormatted} (${diff < 0 ? '-' : '+'}${percentage}%)
      </div>
    </div>
  `;
};

export const extractChartDataFromHTML = (html: string): ChartData[] => {
  const scriptMatch = html.match(/<script[^>]*>\s*window\.chartData\s*=\s*(\[.*?\]);/s);
  if (!scriptMatch) {
    alert("chartData not found in HTML.");
    return [];
  }
  return JSON.parse(scriptMatch[1]);
};

export const runComparison = (
  oldData: ChartData[], 
  newData: ChartData[], 
  callbacks: {
    setBundleSize: (value: { old: number; new: number; diff: number }) => void;
    setParsedSize: (value: { old: number; new: number; diff: number }) => void;
    setGzipSize: (value: { old: number; new: number; diff: number }) => void;
    setResults: (value: ComparisonResult[]) => void;
    setAdded: (value: ChartData[]) => void;
    setRemoved: (value: ChartData[]) => void;
  }
) => {
  const result: ComparisonResult[] = [];
  let totalOldStat = 0, totalNewStat = 0;
  let totalOldParsed = 0, totalNewParsed = 0;
  let totalOldGzip = 0, totalNewGzip = 0;

  oldData.forEach(oldItem => {
    const newItem = newData.find(n => n.label === oldItem.label);
    if (newItem) {
      const statDiff = newItem.statSize - oldItem.statSize;
      const parsedDiff = newItem.parsedSize - oldItem.parsedSize;
      const gzipDiff = newItem.gzipSize - oldItem.gzipSize;

      totalOldStat += oldItem.statSize;
      totalNewStat += newItem.statSize;
      totalOldParsed += oldItem.parsedSize;
      totalNewParsed += newItem.parsedSize;
      totalOldGzip += oldItem.gzipSize;
      totalNewGzip += newItem.gzipSize;

      result.push({
        label: oldItem.label,
        statSize: {
          label: createDiffSpan(oldItem.statSize, newItem.statSize, statDiff),
          value: statDiff
        },
        parsedSize: {
          label: createDiffSpan(oldItem.parsedSize, newItem.parsedSize, parsedDiff),
          value: parsedDiff
        },
        gzipSize: {
          label: createDiffSpan(oldItem.gzipSize, newItem.gzipSize, gzipDiff),
          value: gzipDiff
        }
      });
    }
  });

  const addedItems = newData.filter(n => !oldData.find(o => o.label === n.label));
  const removedItems = oldData.filter(o => !newData.find(n => n.label === o.label));

  callbacks.setBundleSize({
    old: totalOldStat,
    new: totalNewStat,
    diff: totalNewStat - totalOldStat
  });
  
  callbacks.setParsedSize({
    old: totalOldParsed,
    new: totalNewParsed,
    diff: totalNewParsed - totalOldParsed
  });
  
  callbacks.setGzipSize({
    old: totalOldGzip,
    new: totalNewGzip,
    diff: totalNewGzip - totalOldGzip
  });

  callbacks.setResults(result);
  callbacks.setAdded(addedItems);
  callbacks.setRemoved(removedItems);
};
