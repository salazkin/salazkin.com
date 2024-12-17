import { getColorStr } from "utils/Utils";
import { ContainerDiv } from "./ContainerDiv";

export class GraphicsDiv extends ContainerDiv {
  protected svgNS: string = "http://www.w3.org/2000/svg";
  protected svg: SVGElement;
  protected currentFill: string | null = null;
  protected currentStroke: { width: number; color: string } | null = null;
  protected currentPath: SVGPathElement | null = null;
  protected currentPathStr: string = "";
  protected bounds: { minX: number; minY: number; maxX: number; maxY: number };
  protected currentPathBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };

  constructor() {
    super();

    this.svg = document.createElementNS(this.svgNS, "svg") as SVGElement;
    this.svg.style.position = "absolute";
    this.rootDiv.appendChild(this.svg);
    this.resetBounds();
  }

  protected resetBounds(): void {
    this.bounds = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    };
    this.currentPathBounds = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    };
  }

  public beginFill(color: number, alpha: number = 1): this {
    this.currentFill = getColorStr(color, alpha);
    return this;
  }

  public lineStyle(width: number, color: number, alpha: number = 1): this {
    this.currentStroke = {
      width: width,
      color: getColorStr(color, alpha)
    };
    return this;
  }

  public drawRect(x: number, y: number, width: number, height: number, cornerRadius?: number): this {
    const rect = document.createElementNS(this.svgNS, "rect");
    rect.setAttribute("x", x.toString());
    rect.setAttribute("y", y.toString());
    rect.setAttribute("width", width.toString());
    rect.setAttribute("height", height.toString());
    if (cornerRadius) {
      rect.setAttribute("rx", cornerRadius.toString());
      rect.setAttribute("ry", cornerRadius.toString());
    }

    rect.setAttribute("fill", this.currentFill ?? "none");
    const strokeWidth = this.currentStroke?.width ?? 0;
    if (this.currentStroke) {
      rect.setAttribute("stroke", this.currentStroke.color);
      rect.setAttribute("stroke-width", strokeWidth.toString());
    }
    this.svg.appendChild(rect);
    this.updateBounds(x - strokeWidth * 0.5, y - strokeWidth * 0.5, width + strokeWidth, height + strokeWidth);
    return this;
  }

  public drawCircle(x: number, y: number, radius: number): this {
    const circle = document.createElementNS(this.svgNS, "circle") as SVGElement;
    circle.setAttribute("cx", x.toString());
    circle.setAttribute("cy", y.toString());
    circle.setAttribute("r", radius.toString());
    circle.setAttribute("fill", this.currentFill ?? "none");
    const strokeWidth = this.currentStroke?.width ?? 0;
    if (this.currentStroke) {
      circle.setAttribute("stroke", this.currentStroke.color);
      circle.setAttribute("stroke-width", strokeWidth.toString());
    }
    this.svg.appendChild(circle);
    this.updateBounds(
      x - radius - strokeWidth * 0.5,
      y - radius - strokeWidth * 0.5,
      radius * 2 + strokeWidth,
      radius * 2 + strokeWidth
    );
    return this;
  }

  public drawPathFromString(d: string, viewBox: { x: number; y: number; w: number; h: number }): this {
    const path = document.createElementNS(this.svgNS, "path") as SVGPathElement;
    path.setAttribute("d", d);
    path.setAttribute("fill", this.currentFill ?? "none");
    const strokeWidth = this.currentStroke?.width ?? 0;
    if (this.currentStroke) {
      path.setAttribute("stroke", this.currentStroke.color);
      path.setAttribute("stroke-width", this.currentStroke.width.toString());
    }
    this.svg.appendChild(path);
    this.updateBounds(
      viewBox.x - strokeWidth * 0.5,
      viewBox.y - strokeWidth * 0.5,
      viewBox.w + strokeWidth,
      viewBox.h + strokeWidth
    );
    return this;
  }

  public moveTo(x: number, y: number): this {
    this.currentPath = document.createElementNS(this.svgNS, "path") as SVGPathElement;
    this.currentPathStr = `M ${x} ${y}`;

    this.updateCurrentPathBounds(x, y);
    return this;
  }

  public lineTo(x: number, y: number): this {
    if (!this.currentPath) {
      console.error("No path has been started. Call moveTo() before calling lineTo().");
      return this;
    }
    this.currentPathStr += ` L ${x} ${y}`;
    this.currentPath.setAttribute("d", this.currentPathStr);
    this.currentPath.setAttribute("fill", this.currentFill ?? "none");

    const strokeWidth = this.currentStroke?.width ?? 0;
    if (this.currentStroke) {
      this.currentPath.setAttribute("stroke", this.currentStroke.color);
      this.currentPath.setAttribute("stroke-width", strokeWidth.toString());
    }

    if (!this.currentPath.parentNode) {
      this.svg.appendChild(this.currentPath);
    }
    this.updateCurrentPathBounds(x, y);

    this.updateBounds(
      this.currentPathBounds.minX - strokeWidth * 0.5,
      this.currentPathBounds.minY - strokeWidth * 0.5,
      this.currentPathBounds.maxX - this.currentPathBounds.minX + strokeWidth,
      this.currentPathBounds.maxY - this.currentPathBounds.minY + strokeWidth
    );

    return this;
  }

  protected updateCurrentPathBounds(x: number, y: number): void {
    this.currentPathBounds.minX = Math.min(this.currentPathBounds.minX, x);
    this.currentPathBounds.minY = Math.min(this.currentPathBounds.minY, y);
    this.currentPathBounds.maxX = Math.max(this.currentPathBounds.maxX, x);
    this.currentPathBounds.maxY = Math.max(this.currentPathBounds.maxY, y);
  }

  protected updateBounds(x: number, y: number, width: number, height: number): void {
    this.bounds.minX = Math.min(this.bounds.minX, x);
    this.bounds.minY = Math.min(this.bounds.minY, y);
    this.bounds.maxX = Math.max(this.bounds.maxX, x + width);
    this.bounds.maxY = Math.max(this.bounds.maxY, y + height);

    this.svg.style.left = `${this.bounds.minX}px`;
    this.svg.style.top = `${this.bounds.minY}px`;
    this.svg.style.width = `${this.bounds.maxX - this.bounds.minX}px`;
    this.svg.style.height = `${this.bounds.maxY - this.bounds.minY}px`;

    this.updateViewBox();
  }

  protected updateViewBox(): void {
    if (this.bounds.minX < Infinity) {
      const width = this.bounds.maxX - this.bounds.minX;
      const height = this.bounds.maxY - this.bounds.minY;
      this.svg.setAttribute("viewBox", `${this.bounds.minX} ${this.bounds.minY} ${width} ${height}`);
    }
  }

  public closePath(): this {
    if (this.currentPath) {
      this.currentPath.setAttribute("d", `${this.currentPathStr} Z`);
      this.currentPath.setAttribute("fill", this.currentFill ?? "none");
      if (this.currentStroke) {
        this.currentPath.setAttribute("stroke", this.currentStroke.color);
        this.currentPath.setAttribute("stroke-width", this.currentStroke.width.toString());
      }
      this.svg.appendChild(this.currentPath);
      this.currentPath = null;
    }
    return this;
  }

  public endFill(): this {
    this.currentFill = null;
    return this;
  }

  public clear(): this {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
    this.currentFill = null;
    this.currentPath = null;
    this.currentPathStr = "";
    this.currentStroke = null;
    this.resetBounds();
    return this;
  }

  public on<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.svg.addEventListener(type, listener, options);
  }
}
