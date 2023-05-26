import html2Canvas from "html2canvas";
import JsPDF from "jspdf";

import {
  Html2CanvasOptions,
  JsPdfOptions,
} from "@/interface/exporter.interface";

const html2CanvasDefaultOption: Html2CanvasOptions = {
  allowTaint: true,
  taintTest: false,
  useCORS: true,
  scale: 2,
  logging: false,
};

function getSinglePagePdf(
  title: string,
  element: HTMLElement,
  scrollYNum?: number
): Promise<void | JsPDF> {
  const maxCanvasHeight = 3000;
  const canvasScale = 2;
  const promise: Promise<HTMLCanvasElement>[] = [];
  const { scrollHeight } = element;
  const bufferHeight = 20;
  const eleRect = element.getBoundingClientRect();
  const scrollY = scrollYNum ? -scrollYNum : -eleRect.top;
  if (scrollHeight > maxCanvasHeight) {
    const size = Math.ceil(scrollHeight / maxCanvasHeight);
    for (let i = 0; i < size; i++) {
      promise.push(
        html2Canvas(element, {
          ...html2CanvasDefaultOption,
          y: i * maxCanvasHeight,
          scrollY,
          height:
            scrollHeight - i * maxCanvasHeight < maxCanvasHeight
              ? scrollHeight - i * maxCanvasHeight + bufferHeight
              : maxCanvasHeight,
        })
      );
    }
  } else {
    promise.push(
      html2Canvas(element, {
        ...html2CanvasDefaultOption,
        y: 0,
        scrollY,
      })
    );
  }
  return Promise.all(promise).then((canvas: HTMLCanvasElement[]) => {
    const { scrollWidth } = element;
    let pageSizeArr: number[] = [];
    if (scrollWidth <= scrollHeight) {
      pageSizeArr = [scrollWidth, scrollHeight + bufferHeight];
    } else {
      pageSizeArr = [scrollWidth, 1.4 * scrollWidth];
    }
    const pdfOptions: JsPdfOptions = {
      orientation: "p",
      unit: "pt",
      format: pageSizeArr,
      compress: true,
    };
    const pdf = new JsPDF(pdfOptions);
    let totalHeight = 0;
    for (let i = 0; i < canvas.length; i++) {
      const contentWidth = canvas[i].width / canvasScale;
      const contentHeight = canvas[i].height / canvasScale;
      const pageData = canvas[i].toDataURL("image/jpeg", 1.0);
      pdf.addImage(
        pageData,
        "jpeg",
        0,
        totalHeight,
        contentWidth,
        contentHeight
      );
      totalHeight += contentHeight;
    }
    return pdf.save(`${title}.pdf`);
  });
}

export { getSinglePagePdf };
