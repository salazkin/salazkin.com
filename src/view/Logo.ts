import { ContainerDiv } from "components/ContainerDiv";
import { GraphicsDiv } from "components/GraphicsDiv";
import { Rect } from "types/Types";
import { Ease, Tween, tween } from "utils/Tween";
import { getColorStr, lerp } from "utils/Utils";

export class Logo extends ContainerDiv {
  constructor() {
    super();
    const logoPos = { x: 30, y: 30 };
    const logoColor = 0xffffff;
    const logoDefaultAlpha = 0.8;
    const logoHoverAlpha = logoDefaultAlpha * 0.8;
    const logoBounds: Rect = { x: 0, y: 0, w: 51, h: 36 };
    const tooltipText = "github.com/salazkin";
    const tooltipColor = 0x666666;
    const tooltipOffsetY = 10;
    const tooltipAlpha = 0.8;
    const tooltipHoverAlpha = 0.6;
    const tweenDuration = 300;
    const tweenEasing = Ease.SinEaseIn;

    const logo = new GraphicsDiv();
    logo.beginFill(logoColor);
    logo.drawPathFromString(
      "M-0 27.95l0 -4.31 6 0 0 3.28c0,0.83 0.55,1.52 1.42,2.03 1.1,0.65 2.66,1 4.32,1 1.76,0 3.26,-0.41 4.27,-1.19 0.89,-0.69 1.42,-1.7 1.42,-3.01 0,-3.03 -3.18,-4.26 -6.68,-5.62l-0.71 -0.28c-2.24,-0.84 -4.51,-1.75 -6.27,-3.24 -1.83,-1.55 -3.06,-3.68 -3.06,-6.9 0,-3.17 1.2,-5.5 3.1,-7.1 2.14,-1.8 5.15,-2.62 8.31,-2.62 2.78,0 5.6,0.57 7.65,1.69 1.94,1.06 3.2,2.6 3.2,4.63l0 4.73 -6.04 0 0 -3.14c0,-0.52 -0.45,-0.97 -1.12,-1.32 -0.98,-0.51 -2.36,-0.77 -3.69,-0.77 -1.51,0 -2.83,0.35 -3.73,1.05 -0.76,0.59 -1.22,1.47 -1.22,2.63 0,2.83 2.9,3.93 6.19,5.18l0.27 0.1c2.5,0.94 4.98,1.89 6.89,3.43 2,1.61 3.33,3.82 3.33,7.18 0,3.27 -1.28,5.81 -3.35,7.57 -2.23,1.9 -5.36,2.86 -8.76,2.86 -2.94,0 -6.08,-0.72 -8.35,-2.18 -2.03,-1.31 -3.39,-3.19 -3.39,-5.67zm28.49 5.61c-1.46,-1.33 -2.41,-3.24 -2.41,-5.75 0,-4.18 2.72,-6.39 5.98,-7.56 3.08,-1.1 6.63,-1.24 8.65,-1.24l0.65 0 0 -0.04c0,-1.51 -0.38,-2.53 -1.02,-3.17 -0.73,-0.73 -1.85,-1.03 -3.17,-1.03 -3.46,0 -6.26,2.11 -6.27,2.12l-0.77 0.58 -2.65 -4.69 0.56 -0.45c0.01,-0.01 3.69,-2.99 9.5,-2.99 3.25,0 5.75,0.87 7.46,2.56 1.71,1.7 2.59,4.17 2.59,7.4l0 10.56c0,0.11 0,0.16 0.01,0.17 0.01,0.01 0.07,0.01 0.17,0.01l3.23 0 0 5.2 -5.57 0c-1.22,0 -2.13,-0.31 -2.75,-0.86 -0.5,-0.44 -0.81,-1 -0.95,-1.65 -1.33,1.48 -3.56,3.07 -6.95,3.07 -2.31,0 -4.63,-0.73 -6.29,-2.25zm7.23 -9.32c-1.79,0.5 -3.36,1.43 -3.36,3.2 0,0.87 0.33,1.7 0.95,2.29 0.57,0.54 1.4,0.88 2.45,0.88 1.59,0 2.91,-0.77 3.86,-1.89 1.15,-1.35 1.78,-3.21 1.78,-4.92l0 -0.13 -0.32 0c-1.04,0 -3.36,0.02 -5.37,0.58z",
      logoBounds
    );
    logo.x = logoPos.x;
    logo.y = logoPos.y;
    logo.alpha = logoDefaultAlpha;
    this.addChild(logo);

    const tooltipContainer = new ContainerDiv();
    tooltipContainer.alpha = tooltipAlpha;
    tooltipContainer.x = logoPos.x;
    tooltipContainer.y = logoPos.y + logoBounds.h + tooltipOffsetY;
    tooltipContainer.visible = false;
    const tooltipDiv = tooltipContainer.getRootDiv();
    tooltipDiv.innerText = tooltipText;
    tooltipDiv.style.color = getColorStr(tooltipColor);
    tooltipDiv.style.fontFamily = "sans-serif";
    tooltipDiv.style.userSelect = "none";
    tooltipDiv.style.pointerEvents = "none";

    this.addChild(tooltipContainer);

    const fill = new GraphicsDiv();
    fill.x = logoPos.x;
    fill.y = logoPos.y;
    fill.beginFill(0xffffff, 0);
    fill.drawRect(logoBounds.x, logoBounds.y, logoBounds.w, logoBounds.h);
    fill.getRootDiv().style.cursor = "pointer";
    this.addChild(fill);

    fill.on("pointerup", () => {
      window.location.href = "http://github.com/salazkin";
    });
    const tween = new Tween(
      tweenDuration,
      t => {
        logo.alpha = lerp(logoDefaultAlpha, logoHoverAlpha, t);
        tooltipContainer.alpha = lerp(0, tooltipHoverAlpha, t);
        tooltipContainer.visible = true;
      },
      tweenEasing
    );
    fill.on("pointerover", () => {
      tooltipContainer.visible = true;
      tween.stop();
      tween.start();
    });
    fill.on("pointerout", async () => {
      tween.stop();
      await tween.reverse();
      tooltipContainer.visible = false;
    });
  }
}
