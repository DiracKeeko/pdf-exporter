export default class {
    A4Container: HTMLElement | undefined;
    rootElement: HTMLElement;
    rootWidth: number;
    pageNum: number;
    loadedPromise: never[];
    remainderHeight: number | undefined;
    constructor(rootElement: HTMLElement);
    initA4Container(): void;
    insertContainerToRootElement(): void;
    removeContainerToRootElement(): void;
    getElementInA4Height(elementHeight: number): number;
}
