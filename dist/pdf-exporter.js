(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "html2canvas", "jspdf"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMultiPagePdf = void 0;
    var html2canvas_1 = require("html2canvas");
    var jspdf_1 = require("jspdf");
    var html2CanvasDefaultOption = {
        allowTaint: true,
        taintTest: false,
        useCORS: true,
        scale: 2,
        logging: false
    };
    var A4Width = 592.28;
    var A4Height = 841.89;
    function getElementAttrSize(element, attr) {
        return parseInt(window.getComputedStyle(element)[attr], 10);
    }
    function createPageHeader(rootWidth, pageNum) {
        var div = document.createElement("div");
        div.style.width = "".concat(rootWidth, "px");
        div.style.height = "30px";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.justifyContent = "center";
        div.style.padding = "10px 0";
        div.style.borderBottom = "1px solid #eeeeee";
        var p = document.createElement("p");
        p.innerHTML = "".concat(pageNum);
        p.style.color = "#333333";
        div.appendChild(p);
        return div;
    }
    function cloneNode(node, isDeep) {
        if (isDeep === void 0) { isDeep = true; }
        return node.cloneNode(isDeep);
    }
    var PreWorker = (function () {
        function PreWorker(rootElement) {
            this.A4Container = document.createElement("div");
            this.remainderHeight = 0;
            if (!rootElement) {
                throw new Error("root element lack!");
            }
            this.rootElement = rootElement;
            this.rootWidth = getElementAttrSize(rootElement, "width") || 0;
            this.pageNum = 1;
            this.initA4Container();
            this.loadedPromise = [];
        }
        PreWorker.prototype.initA4Container = function () {
            this.removeContainerToRootElement();
            this.A4Container = document.createElement("div");
            var pageHeader = createPageHeader(this.rootWidth, this.pageNum);
            this.A4Container.appendChild(pageHeader);
            this.remainderHeight = A4Height - this.calcElementInA4PageHeight(50);
            this.insertContainerToRootElement();
        };
        PreWorker.prototype.insertContainerToRootElement = function () {
            if (this.A4Container) {
                this.rootElement.appendChild(this.A4Container);
            }
        };
        PreWorker.prototype.removeContainerToRootElement = function () {
            if (this.A4Container) {
                this.rootElement.removeChild(this.A4Container);
            }
        };
        PreWorker.prototype.calcElementInA4PageHeight = function (elementHeight) {
            if (!elementHeight)
                return 0;
            return (A4Width / this.rootWidth) * elementHeight;
        };
        PreWorker.prototype.insertElementToContainer = function (element) {
            if (!element)
                return;
            var elementHeight = this.calcElementInA4PageHeight(getElementAttrSize(element, "height"));
            if (this.remainderHeight < elementHeight) {
                this.loadedPromise.push((0, html2canvas_1.default)(this.A4Container, html2CanvasDefaultOption));
                this.pageNum += 1;
                this.initA4Container();
            }
            this.remainderHeight -= elementHeight;
            var cloneElement = cloneNode(element, true);
            cloneElement.style.margin = "0";
            this.A4Container.appendChild(cloneElement);
        };
        PreWorker.prototype.finishInsertElementToContainer = function () {
            var children = (this.A4Container || {}).children;
            if (Object.keys(children).length !== 0) {
                this.loadedPromise.push((0, html2canvas_1.default)(this.A4Container, html2CanvasDefaultOption));
                this.removeContainerToRootElement();
            }
            return this.loadedPromise;
        };
        return PreWorker;
    }());
    function getMultiPagePdf(title, rootElement, skeletonArr) {
        var exporter = new PreWorker(rootElement);
        skeletonArr.forEach(function (domId) {
            var componentElement = rootElement.querySelector("#".concat(domId));
            exporter.insertElementToContainer(componentElement);
        });
        return Promise.all(exporter.finishInsertElementToContainer()).then(function (canvas) {
            var pdf = new jspdf_1.default("p", "pt", "a4", true);
            for (var i = 0; i < canvas.length; i++) {
                var contentWidth = canvas[i].width;
                var contentHeight = canvas[i].height;
                var imgHeight = (A4Width / contentWidth) * contentHeight;
                var pageData = canvas[i].toDataURL("image/jpeg", 1.0);
                pdf.addImage(pageData, "jpeg", 0, 0, A4Width, imgHeight, undefined, "SLOW");
                if (i < canvas.length - 1) {
                    pdf.addPage();
                }
            }
            return pdf.save("".concat(title, ".pdf"));
        });
    }
    exports.getMultiPagePdf = getMultiPagePdf;
});
