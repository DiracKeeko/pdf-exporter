import {
  Orientation,
  Unit,
  Format,
  JsPdfOptions,
  isOrientation,
  isUnit,
  isFormat,
} from "@/interface/jsPdf.type";

class JsPDF {
  private orientation: "p" | "portrait" | "l" | "landscape";
  private unit: "pt" | "px" | "in" | "mm" | "cm" | "ex" | "em" | "pc";
  private format: string | number[];
  private compress: boolean;

  constructor(options: JsPdfOptions) {
    this.orientation = isOrientation(arguments[0]) ? arguments[0] : "portrait";
    this.unit = isUnit(arguments[1]) ? arguments[1] : "px";
    this.format = isFormat(arguments[2]) ? arguments[2] : "a4";
    this.compress = arguments[3];

    options = options || {};

    if (typeof options === "object") {
      this.orientation = options.orientation || this.orientation;
      this.unit = options.unit || this.unit;
      this.format = options.format || this.format;
      this.compress = options.compress || this.compress;
    }
  }
}
