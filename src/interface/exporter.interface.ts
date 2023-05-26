interface Html2CanvasOptions {
  allowTaint: boolean;
  taintTest: boolean;
  useCORS: boolean;
  scale: number;
  logging: boolean;
}

interface JsPdfOptions {
  orientation?: "p" | "portrait" | "l" | "landscape";
  unit?: "pt" | "px" | "in" | "mm" | "cm" | "ex" | "em" | "pc";
  format?: string | number[];
  compress?: boolean;
}

export type { Html2CanvasOptions, JsPdfOptions };
