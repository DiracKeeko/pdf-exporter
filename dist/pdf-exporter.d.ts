import JsPDF from "jspdf";
declare function getMultiPagePdf(title: string, rootElement: HTMLElement, skeletonArr: Array<string>): Promise<JsPDF>;
export { getMultiPagePdf };
