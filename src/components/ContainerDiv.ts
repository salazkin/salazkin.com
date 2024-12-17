export class ContainerDiv {
  protected rootDiv: HTMLDivElement;
  protected containerDivParams: {
    x: number;
    y: number;
    visible: boolean;
    alpha: number;
    scale: number;
    rotation: number;
  } = { x: 0, y: 0, visible: true, alpha: 1, scale: 1, rotation: 0 };

  constructor() {
    this.rootDiv = document.createElement("div");
    this.rootDiv.style.position = "absolute";
  }

  public addChild(child: ContainerDiv): void {
    this.rootDiv.appendChild(child.getRootDiv());
  }

  public getRootDiv(): HTMLDivElement {
    return this.rootDiv;
  }

  public set x(value: number) {
    this.containerDivParams.x = value;
    this.updateStyle();
  }

  public get x(): number {
    return this.containerDivParams.x;
  }

  public set y(value: number) {
    this.containerDivParams.y = value;
    this.updateStyle();
  }

  public get y(): number {
    return this.containerDivParams.y;
  }

  public set scale(value: number) {
    this.containerDivParams.scale = value;
    this.updateStyle();
  }

  public get scale(): number {
    return this.containerDivParams.scale;
  }

  public set rotation(value: number) {
    this.containerDivParams.rotation = value;
    this.updateStyle();
  }

  public set alpha(value: number) {
    this.containerDivParams.alpha = value;
    this.updateStyle();
  }

  public get alpha(): number {
    return this.containerDivParams.alpha;
  }

  public set visible(value: boolean) {
    this.containerDivParams.visible = value;
    this.updateStyle();
  }

  public get visible(): boolean {
    return this.containerDivParams.visible;
  }

  protected updateStyle(): void {
    this.rootDiv.style.left = `${this.containerDivParams.x}px`;
    this.rootDiv.style.top = `${this.containerDivParams.y}px`;
    this.rootDiv.style.visibility = this.containerDivParams.visible ? "visible" : "hidden";
    this.rootDiv.style.opacity = this.containerDivParams.alpha.toString();
    this.rootDiv.style.transform = `scale(${this.containerDivParams.scale}) rotate(${this.containerDivParams.rotation}deg)`;
  }
}
