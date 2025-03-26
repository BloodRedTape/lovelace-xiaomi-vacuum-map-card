import { svg, SVGTemplateResult } from "lit";
import { Context } from "./context";
import { MapObject } from "./map-object";

export class VirtualWall extends MapObject {
    constructor(public x0: number, public y0: number, public x1: number, public y1: number, context: Context) {
        super(context);
    }

    public render(): SVGTemplateResult {
        const start = this.vacuumToScaledMap(this.x0, this.y0);
        const end = this.vacuumToScaledMap(this.x1, this.y1);

        const stroke = "red";
        const strokeWidth = 2;

        const pointRadius = 2;
        const pointFill = "white";
        const pointStroke = "red";
        const pointStrokeWidth = 0.5;

        return svg`
            <g class="clean-path-wrapper">
                <polyline
                    fill="none"
                    stroke=${stroke}
                    stroke-width=${strokeWidth}
                    points="${start.join(',')} ${end.join(',')}">
                </polyline>
                ${[start,end].map(point=>svg`<circle cx=${point[0]} cy=${point[1]} r=${pointRadius} fill=${pointFill} stroke=${pointStroke} stroke-width=${pointStrokeWidth}/>`)}
            </g>
        `;
    }
}