import { svg, SVGTemplateResult } from "lit";
import { Context } from "./context";
import { MapObject } from "./map-object";

export class CleanZone extends MapObject {
    constructor(public x0: number, public y0: number, public x1: number, public y1: number, context: Context) {
        super(context);
    }

    public render(): SVGTemplateResult {
        const points = [
            this.vacuumToScaledMap(this.x0, this.y0),
            this.vacuumToScaledMap(this.x1, this.y1),
        ]

        const min_x = Math.min(points[1][0], points[0][0]);
        const min_y = Math.min(points[1][1], points[0][1]);
        const width = Math.abs(points[1][0] - points[0][0]);
        const height = Math.abs(points[1][1] - points[0][1]);
        const radius = 1;
        const fill = "rgb(173, 216, 230)";
        const fillOpacity = 0.5;
        const stroke = fill;
        const strokeWidth = 1;

        return svg`
            <rect x=${min_x} y=${min_y} width=${width} height=${height} rx=${radius} fill=${fill} style="fill-opacity: ${fillOpacity};" stroke=${stroke} stroke-width=${strokeWidth}/>
        `;
    }
}