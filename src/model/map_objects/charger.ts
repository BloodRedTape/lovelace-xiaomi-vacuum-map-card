import { svg, SVGTemplateResult } from "lit";
import { Context } from "./context";
import { MapObject } from "./map-object";

export class Charger extends MapObject {
    constructor(public x: number, public y: number, context: Context) {
        super(context);
    }

    public render(): SVGTemplateResult {
        const [x, y] = this.vacuumToScaledMap(this.x, this.y);

        const [width, height] = [8, 5];
        const fill = "lime";
        const fillOpacity = 0.5;
        const stroke = "white";
        const strokeWidth = 0.5;
        const radius = 1;

        const [iconWidth, iconHeight] = [4, 4];

        return svg`
            <rect
                x=${x - width / 2}
                y=${y - height / 2}
                width=${width}
                height=${height}
                fill=${fill}
                style="fill-opacity: ${fillOpacity};"
                stroke=${stroke}
                stroke-width=${strokeWidth}
                rx=${radius}/>
            <svg
                x=${x - iconWidth / 2}
                y=${y - iconHeight / 2}
                width=${iconWidth}
                height=${iconHeight}
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                class="bi bi-lightning-charge">
                <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
            </svg>
        `;
    }
}