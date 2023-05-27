type Orientation = "p" | "portrait" | "l" | "landscape";

type Unit = "pt" | "px" | "in" | "mm" | "cm" | "ex" | "em" | "pc";

type Format = string | number[];

interface JsPdfOptions {
  orientation?: Orientation;
  unit?: Unit;
  format?: Format;
  compress?: boolean;
}

interface PubSub {
  subscribe(
    topic: string,
    callback: (...args: any[]) => void,
    once?: boolean
  ): string;
  unsubscribe(token: string): boolean;
  publish(topic: string, ...args: any[]): void;
  getTopics(): Record<
    string,
    Record<string, [(...args: any[]) => void, boolean]>
  >;
}

interface JsPdfInternal {
  events: PubSub;
  scaleFactor: number;
  collections: Record<string, any>;
  pages: number[];
  pageSize: {
    width: number;
    getWidth: () => number;
    height: number;
    getHeight: () => number;
  };
  write: (...args: any[]) => void;
  getEncryptor(objectId: number): (data: string) => string;
}

export type { Orientation, Unit, Format, JsPdfOptions, JsPdfInternal };

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
