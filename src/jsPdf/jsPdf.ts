import {
  Orientation,
  Unit,
  Format,
  JsPdfOptions,
  JsPdfInternal,
  isOrientation,
  isUnit,
  isFormat,
} from "@/interface/jsPdf.type";
import { ImageOptions } from "@/interface/addImage.type";

class JsPDF {
  private orientation: Orientation;
  private unit: Unit;
  private format: Format;
  private compress: boolean;
  private namespace: string = "addImage_";

  internal: JsPdfInternal;

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
    this.internal = {
      write(value) {
        function out(string) {
          string = string.toString();
          contentLength += string.length + 1;
          outputDestination.push(string);
      
          return outputDestination;
        };
        return out(
          arguments.length === 1
            ? value.toString()
            : Array.prototype.join.call(arguments, " ")
        );
      };
    } as JsPdfInternal;
  }

  putResourcesCallback() {
    var images = this.internal.collections[this.namespace + "images"];
    for (var i in images) {
      putImage.call(this, images[i]);
    }
  };
  putXObjectsDictCallback() {
    var images = this.internal.collections[this.namespace + "images"],
      out = this.internal.write,
      image;
    for (var i in images) {
      image = images[i];
      out("/I" + image.index, image.objectId, "0", "R");
    }
  };
  initialize() {
    if (!this.internal.collections[this.namespace + "images"]) {
      this.internal.collections[this.namespace + "images"] = {};
      this.internal.events.subscribe("putResources", this.putResourcesCallback);
      this.internal.events.subscribe("putXobjectDict", this.putXObjectsDictCallback);
    }
  }

  addImage(options: ImageOptions) {
    let { imageData, format, x, y, w, h, alias, compression, rotation } =
      options;
    format = format || "UNKNOWN";
    x = x || 0;
    y = y || 0;

    //If compression is not explicitly set, determine if we should use compression
    var filter = this.internal.getFilters();
    if (compression === undefined && filter.indexOf("FlateEncode") !== -1) {
      compression = "SLOW";
    }

    if (isNaN(x) || isNaN(y)) {
      throw new Error("Invalid coordinates passed to jsPDF.addImage");
    }

    initialize.call(this);

    var image = processImageData.call(
      this,
      imageData,
      format,
      alias,
      compression
    );

    writeImageToPDF.call(this, x, y, w, h, image, rotation);

    return this;
  }
}
