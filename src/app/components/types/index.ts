import { VtexBundleState } from '../tabs/VtexTab';

export type ChartData = {
  label: string;
  statSize: number;
  parsedSize: number;
  gzipSize: number;
};

export type ComparisonResult = {
  label: string;
  statSize: {
    label: string;
    value: number;
  };
  parsedSize: {
    label: string;
    value: number;
  };  gzipSize: {
    label: string;
    value: number;
  };
};

export type { VtexBundleState };
