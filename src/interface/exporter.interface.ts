interface Html2CanvasOptions {
  allowTaint: boolean;
  taintTest: boolean;
  useCORS: boolean;
  scale: number;
  logging: boolean;
}

interface JsPdfOptions {
  orientation: string;
  unit: string;
  format: string;
  compress: boolean;
}

export type { Html2CanvasOptions, JsPdfOptions };
