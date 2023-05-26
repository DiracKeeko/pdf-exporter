type Orientation = "p" | "portrait" | "l" | "landscape";

type Unit = "pt" | "px" | "in" | "mm" | "cm" | "ex" | "em" | "pc";

type Format = string | number[];

interface JsPdfOptions {
  orientation?: Orientation;
  unit?: Unit;
  format?: Format;
  compress?: boolean;
}

export type { Orientation, Unit, Format, JsPdfOptions, ImageOptions };

function isOrientation(orientation: string): orientation is Orientation {
  return ["p", "portrait", "l", "landscape"].includes(orientation);
}

function isUnit(unit: string): unit is Unit {
  return ["pt", "px", "in", "mm", "cm", "ex", "em", "pc"].includes(unit);
}

function isFormat(format: string | number[]): format is Format {
  return typeof format === "string" || Array.isArray(format);
}

export { isOrientation, isUnit, isFormat };
