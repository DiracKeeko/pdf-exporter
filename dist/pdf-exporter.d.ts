import JsPDF from "jspdf";
declare function getMultiPagePdf(title: string, rootElement: HTMLElement, skeletonArr: Array<string>): Promise<JsPDF>;
declare const _default: {
    getMultiPagePdf: typeof getMultiPagePdf;
};
export default _default;
