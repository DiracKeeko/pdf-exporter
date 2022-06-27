import html2Canvas from "html2canvas";
import JsPDF from "jspdf";

const html2CanvasDefaultOption = {
  allowTaint: true,
  taintTest: false,
  useCORS: true,
  scale: 2,
  logging: false
}

// ##getSinglePagePdf
function getSinglePagePdf(title, element, scrollYNum) {
  const maxCanvasHeight = 3000;
  const canvasScale = 2;
  const promise = [];
  const { scrollHeight } = element;
  const bufferHeight = 20;
  const eleRect = element.getBoundingClientRect();
  const scrollY = -scrollYNum || -eleRect.top;
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
              : maxCanvasHeight
        })
      );
    }
  } else {
    promise.push(
      html2Canvas(element, {
        ...html2CanvasDefaultOption,
        y: 0,
        scrollY
      })
    );
  }
  return Promise.all(promise).then(canvas => {
    const { scrollWidth } = element;
    let pageSizeArr = [];
    if (scrollWidth <= scrollHeight) {
      pageSizeArr = [scrollWidth, scrollHeight + bufferHeight];
    } else {
      pageSizeArr = [scrollWidth, 1.4 * scrollWidth];
    }
    const pdf = new JsPDF("", "pt", pageSizeArr);
    let totalHeight = 0;
    for (let i = 0; i < canvas.length; i++) {
      const contentWidth = canvas[i].width / canvasScale;
      const contentHeight = canvas[i].height / canvasScale;
      const pageData = canvas[i].toDataURL("image/jpeg", 1.0);
      pdf.addImage(pageData, "jpeg", 0, totalHeight, contentWidth, contentHeight);
      totalHeight += contentHeight;
    }
    return pdf.save(`${title}.pdf`);
  });
}

// ##getMultiPagePdf
// A4 paper size
const A4Width = 592.28;
const A4Height = 841.89;

function getElementAttrSize(element , attr) {
  return parseInt(window.getComputedStyle(element)[attr], 10);
}

function createPageHeader(rootWidth, pageNum) {
  const div = document.createElement("div");
  div.style.width = `${rootWidth}px`;
  div.style.height = `30px`;
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.padding = "10px 0";
  div.style.borderBottom = "1px solid #eeeeee";

  const p = document.createElement("p");
  p.innerHTML = `${pageNum}`;
  p.style.color = "#333333";
  div.appendChild(p);

  return div;
}


class PreWorker {
  constructor(rootElement) {
    if (!rootElement) {
      throw new Error("root element lack!");
    }
    this.rootElement = rootElement;
    this.rootWidth = getElementAttrSize(rootElement, "width") || 0;
    this.pageNum = 1;
    this.initA4Container();
    this.loadedPromise = [];
  }

  initA4Container() {
    this.removeContainerToRootElement();

    this.A4Container = document.createElement("div");

    const pageHeader = createPageHeader(this.rootWidth, this.pageNum);

    this.A4Container.appendChild(pageHeader);

    this.remainderHeight = A4Height - this.calcElementInA4PageHeight(50);

    this.insertContainerToRootElement();
  }

  insertContainerToRootElement() {
    if (this.A4Container) {
      this.rootElement.appendChild(this.A4Container);
    }
  }

  removeContainerToRootElement() {
    if (this.A4Container) {
      this.rootElement.removeChild(this.A4Container);
    }
  }

  calcElementInA4PageHeight(elementHeight) {
    if (!elementHeight) return 0;
    return (A4Width / this.rootWidth) * elementHeight;
  }

  insertElementToContainer(element) {
    if (!element) return;
    const elementHeight = this.calcElementInA4PageHeight(getElementAttrSize(element, "height"));

    if (this.remainderHeight < elementHeight) {
      this.loadedPromise.push(html2Canvas(this.A4Container, html2CanvasDefaultOption));
      this.pageNum += 1;
      this.initA4Container();
    }
    this.remainderHeight -= elementHeight;
    const cloneElement = element.cloneNode(true);
    cloneElement.style.margin = "0";
    this.A4Container.appendChild(cloneElement);
  }

  finishInsertElementToContainer() {
    const { children } = this.A4Container || {};
    if (Object.keys(children).length !== 0) { 
      this.loadedPromise.push(html2Canvas(this.A4Container, html2CanvasDefaultOption));
      this.removeContainerToRootElement();
    }
    return this.loadedPromise;
  }

}

function getMultiPagePdf(title, rootElement, skeletonArr) {
  const exporter = new PreWorker(rootElement);
  skeletonArr.forEach(domId => {
    const componentElement = rootElement.querySelector(`#${domId}`);
    exporter.insertElementToContainer(componentElement);
  })
  
  return Promise.all(exporter.finishInsertElementToContainer()).then((canvas) => {
    const pdf = new JsPDF("p", "pt", "a4", true);
    for (let i = 0; i < canvas.length; i++) {
      const contentWidth = canvas[i].width;
      const contentHeight = canvas[i].height;
      const imgHeight = (A4Width / contentWidth) * contentHeight;
      const pageData = canvas[i].toDataURL("image/jpeg", 1.0);
      pdf.addImage(pageData, "jpeg", 0, 0, A4Width, imgHeight, undefined, "SLOW");
      if (i < canvas.length - 1) {
        pdf.addPage();
      }
    }
    return pdf.save(`${title}.pdf`);
  });
}

export { getSinglePagePdf, getMultiPagePdf }