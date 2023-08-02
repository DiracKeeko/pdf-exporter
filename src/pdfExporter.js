import html2Canvas from "html2canvas";
import JsPDF from "jspdf";

const html2CanvasDefaultOption = {
  allowTaint: true,
  taintTest: false,
  useCORS: true,
  scale: 2,
  logging: false,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getImageBase64Url(element, additionalOffsetY = 0) {
  const { offsetWidth, offsetHeight, offsetTop } = element;
  const canvasWidth = offsetWidth;
  const canvasHeight = offsetHeight;
  const options = {
    scale: 4,
    width: canvasWidth,
    height: canvasHeight,
    useCORS: true,
    scrollY: 0,
    y: offsetTop + additionalOffsetY,
    allowTaint: true,
    taintTest: false,
    logging: false
  };
  const canvas = await html2Canvas(element, options);
  return canvas.toDataURL("image/jpeg", 1.0);
}

async function getImage(title, { rootElement, element, text, logo, additionalOffsetY = 0 }) {
  try {
    const imageUrl = await getImageBase64Url(element, additionalOffsetY);

    const mountElement = rootElement || document.body;

    // 创建外层容器元素 <div class="image-export">
    const container = document.createElement("div");
    container.classList.add("image-export");
    container.style.padding = "20px 20px 0";
    container.style.minWidth = "800px";

    // 创建图片元素 <img class="content" src="imageUrl" />
    const image = document.createElement("img");
    image.classList.add("content");
    image.style.width = "100%";
    image.src = imageUrl; // 设置图片的 URL

    // 创建分割线元素 <div class="cutline"></div>
    const cutline = document.createElement("div");
    cutline.classList.add("cutline");
    cutline.style.width = "100%";
    cutline.style.borderBottom = "1px solid #eee";

    // 创建底部元素 <div class="footer">
    const footer = document.createElement("div");
    footer.classList.add("footer");
    footer.style.height = "50px";
    footer.style.display = "flex";
    footer.style.justifyContent = "space-between";
    footer.style.alignItems = "center";

    // 创建左侧底部文本元素 <span class="footer-left">页面数据来源于wind</span>
    const footerLeft = document.createElement("span");
    footerLeft.classList.add("footer-left");
    footerLeft.textContent = text;
    footerLeft.style.fontSize = "12px";
    footerLeft.style.color = "#999";

    // 创建右侧底部图片元素 <img class="footer-right" :src="vue2logo" />
    const footerRight = document.createElement("img");
    footerRight.classList.add("footer-right");
    footerRight.src = logo; // 设置图片的 URL
    footerRight.style.width = "40px";
    footerRight.style.height = "40px";

    // 将元素添加到 DOM 树中
    footer.appendChild(footerLeft);
    footer.appendChild(footerRight);
    container.appendChild(image);
    container.appendChild(cutline);
    container.appendChild(footer);
    mountElement.appendChild(container);
    await sleep(5);

    const { offsetWidth, offsetHeight } = container;
    const canvasWidth = offsetWidth + 20;
    const canvasHeight = offsetHeight + 20;

    const opts = {
      scale: 2,
      width: canvasWidth,
      height: canvasHeight,
      useCORS: true,
      scrollY: 0,
      y: container.offsetTop + additionalOffsetY,
      allowTaint: true,
      taintTest: false,
      logging: false
    };
    const canvas = await html2Canvas(container, opts);
    const imgUrl = canvas.toDataURL("image/jpeg", 1.0);
    const link = document.createElement("a");
    link.href = imgUrl;
    link.download = title;
    mountElement.removeChild(container);
    link.click();
  } catch (err) {
    console.log(err);
  }
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
  return Promise.all(promise).then((canvas) => {
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

// ##getMultiPagePdf
// A4 paper size
const A4Width = 592.28;
const A4Height = 841.89;

function getElementAttrSize(element, attr) {
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
    const elementHeight = this.calcElementInA4PageHeight(
      getElementAttrSize(element, "height")
    );

    if (this.remainderHeight < elementHeight) {
      this.loadedPromise.push(
        html2Canvas(this.A4Container, html2CanvasDefaultOption)
      );
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
      this.loadedPromise.push(
        html2Canvas(this.A4Container, html2CanvasDefaultOption)
      );
      this.removeContainerToRootElement();
    }
    return this.loadedPromise;
  }
}

function getMultiPagePdf(title, rootElement, skeletonArr) {
  const exporter = new PreWorker(rootElement);
  skeletonArr.forEach((domId) => {
    const componentElement = rootElement.querySelector(`#${domId}`);
    exporter.insertElementToContainer(componentElement);
  });

  return Promise.all(exporter.finishInsertElementToContainer()).then(
    (canvas) => {
      const pdf = new JsPDF("p", "pt", "a4", true);
      for (let i = 0; i < canvas.length; i++) {
        const contentWidth = canvas[i].width;
        const contentHeight = canvas[i].height;
        const imgHeight = (A4Width / contentWidth) * contentHeight;
        const pageData = canvas[i].toDataURL("image/jpeg", 1.0);
        pdf.addImage(
          pageData,
          "jpeg",
          0,
          0,
          A4Width,
          imgHeight,
          undefined,
          "SLOW"
        );
        if (i < canvas.length - 1) {
          pdf.addPage();
        }
      }
      return pdf.save(`${title}.pdf`);
    }
  );
}

export { getImage, getSinglePagePdf, getMultiPagePdf };
