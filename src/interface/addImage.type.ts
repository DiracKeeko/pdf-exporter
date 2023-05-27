type ImageFormat =
  | "RGBA"
  | "UNKNOWN"
  | "PNG"
  | "TIFF"
  | "JPG"
  | "JPEG"
  | "JPEG2000"
  | "GIF87a"
  | "GIF89a"
  | "WEBP"
  | "BMP";

type ImageCompression = "NONE" | "FAST" | "MEDIUM" | "SLOW";

interface RGBAData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

interface ImageOptions {
  imageData:
    | string
    | HTMLImageElement
    | HTMLCanvasElement
    | Uint8Array
    | RGBAData;
  format: ImageFormat;
  x: number;
  y: number;
  w: number;
  h: number;
  alias?: string;
  compression?: ImageCompression;
  rotation?: number;
}

export type { ImageFormat, ImageCompression, RGBAData, ImageOptions };