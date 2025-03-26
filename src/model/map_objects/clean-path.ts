// noinspection CssUnresolvedCustomProperty

import { css, CSSResultGroup, svg, SVGTemplateResult } from "lit";

import { Context } from "./context";
import { MapObject } from "./map-object";

export class CleanPathPoint{
    constructor(public x: number, public y: number) { }
}

export class CleanPath extends MapObject {
    public points: CleanPathPoint[]
    constructor(points: CleanPathPoint[], context: Context) {
        super(context);
        this.points = points.map(point => {
            const mapped = this.vacuumToScaledMap(point.x, point.y);

            return new CleanPathPoint(mapped[0], mapped[1]);
        });
    }

    public render(): SVGTemplateResult {
        if (this.points.length === 0) {
            return svg``;
        }
        return svg`
            <g>
                <polyline class="clean-path-line"
                          points="${this.points.map(p => `${p.x},${p.y}`).join(" ")}">
                </polyline>
            </g>
        `;
    }

    public static get styles(): CSSResultGroup {
        return css`
            .clean-path-line {
                fill: transparent;
                stroke: var(--map-card-internal-clean-path-line-color);
                stroke-width: calc(var(--map-card-internal-clean-path-line-width));
            }
        `;
    }
}
