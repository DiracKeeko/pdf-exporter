
import { JsPdfOptions } from "@/interface/jsPdf.interface";

export class JsPdf {
  orientation: "p" | "portrait" | "l" | "landscape";
  unit: "pt" | "px" | "in" | "mm" | "cm" | "ex" | "em" | "pc";
  format: string | number[];
  compressPdf: boolean;

  constructor(
    options?: JsPdfOptions,
    orientation?: "p" | "portrait" | "l" | "landscape",
    unit?: "pt" | "px" | "in" | "mm" | "cm" | "ex" | "em" | "pc",
    format?: string | number[],
    compressPdf?: boolean
  ) {
    if (options) {
      const { orientation, unit, format, compressPdf } = options;
      this.orientation = orientation;
      this.unit = unit;
      this.format = format;
      this.compressPdf = compressPdf;
    } else {
      this.orientation = orientation;
      this.unit = unit;8
      this.format = format;
      this.compressPdf = compressPdf;
    }
  }
}
