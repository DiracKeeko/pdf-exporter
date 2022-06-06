(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    var default_1 = (function () {
        function default_1(rootElement) {
            if (!rootElement) {
                throw new Error("missing root element");
            }
            this.rootElement = rootElement;
            this.rootWidth = getElementAttrSize(rootElement, "width") || 0;
            this.pageNum = 1;
            this.initA4Container();
            this.loadedPromise = [];
        }
        default_1.prototype.initA4Container = function () {
            this.removeContainerToRootElement();
            this.A4Container = document.createElement("div");
            var pageHeader = createPageHeader(this.rootWidth, this.pageNum);
            this.A4Container.appendChild(pageHeader);
            this.remainderHeight = A4Height - this.getElementInA4Height(50);
            this.insertContainerToRootElement();
        };
        default_1.prototype.insertContainerToRootElement = function () {
            if (this.A4Container) {
                this.rootElement.appendChild(this.A4Container);
            }
        };
        default_1.prototype.removeContainerToRootElement = function () {
            if (this.A4Container) {
                this.rootElement.removeChild(this.A4Container);
            }
        };
        default_1.prototype.getElementInA4Height = function (elementHeight) {
            if (!elementHeight)
                return 0;
            return (A4Width / this.rootWidth) * elementHeight;
        };
        return default_1;
    }());
    exports.default = default_1;
});
