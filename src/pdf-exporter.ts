import html2Canvas from "html2canvas";

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

export default class {
  A4Container: HTMLElement | undefined;
  rootElement: HTMLElement;
  rootWidth: number;
  pageNum: number;
  loadedPromise: never[];
  remainderHeight: number | undefined;
  
  constructor(rootElement: HTMLElement) {
    if (!rootElement) {
      throw new Error("missing root element");
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

    this.remainderHeight = A4Height - this.getElementInA4Height(50);

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

  getElementInA4Height(elementHeight: number) {
    if (!elementHeight) return 0;
    return (A4Width / this.rootWidth) * elementHeight;
  }

}