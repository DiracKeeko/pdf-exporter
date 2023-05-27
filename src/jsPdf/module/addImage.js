function addImage(options) {
  let { imageData, format, x, y, w, h, alias, compression, rotation } = options;
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
