import html2Canvas from "html2canvas";
import JsPDF from "jspdf";

interface Html2CanvasOption {
  allowTaint: boolean;
  taintTest: boolean;
  useCORS: boolean;
  scale: number;
  logging: boolean;
}

const html2CanvasDefaultOption: Html2CanvasOption = {
  allowTaint: true,
  taintTest: false,
  useCORS: true,
  scale: 2,
  logging: false
}

// A4 size
const A4Width:number = 592.28;
const A4Height:number = 841.89;

function getElementAttrSize(element: HTMLElement , attr: string): number {
  return parseInt((window as any).getComputedStyle(element)[attr], 10);
}

function createPageHeader(rootWidth: number, pageNum: number): HTMLElement {
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

function cloneNode<T extends Node>(node: T, isDeep: boolean = true) {
  return <T>node.cloneNode(isDeep);
}

class PreWorker {
  A4Container: HTMLElement = document.createElement("div");
  rootElement: HTMLElement;
  rootWidth: number;
  pageNum: number;
  loadedPromise: Promise<any>[];
  remainderHeight: number = 0;

  constructor(rootElement: HTMLElement) {
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

  calcElementInA4PageHeight(elementHeight: number) {
    if (!elementHeight) return 0;
    return (A4Width / this.rootWidth) * elementHeight;
  }

  insertElementToContainer(element: HTMLElement) {
    if (!element) return;
    const elementHeight = this.calcElementInA4PageHeight(getElementAttrSize(element, "height"));

    if (this.remainderHeight < elementHeight) {
      this.loadedPromise.push(html2Canvas(this.A4Container, html2CanvasDefaultOption));
      this.pageNum += 1;
      this.initA4Container();
    }
    this.remainderHeight -= elementHeight;
    const cloneElement = cloneNode(element, true);
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

function getMultiPagePdf(title: string, rootElement: HTMLElement, skeletonArr: Array<string>) {
  const exporter: any = new PreWorker(rootElement);
  skeletonArr.forEach(domId => {
    const componentElement = rootElement.querySelector(`#${domId}`);
    exporter.insertElementToContainer(componentElement);
  })
  
  return Promise.all(exporter.finishInsertElementToContainer()).then((canvas: Array<any>) => {
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

export { getMultiPagePdf }