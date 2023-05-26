interface JsPdfOptions {
  orientation?: "p" | "portrait" | "l" | "landscape";
  unit?: "pt" | "px" | "in" | "mm" | "cm" | "ex" | "em" | "pc";
  format?: string | number[];
  compress?: boolean;
}

export type { JsPdfOptions };
