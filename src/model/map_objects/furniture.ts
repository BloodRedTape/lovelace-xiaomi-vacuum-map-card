// noinspection CssUnresolvedCustomProperty

import { css, CSSResultGroup, svg, SVGTemplateResult } from "lit";
import { forwardHaptic } from "custom-card-helpers";

import { Context } from "./context";
import { deleteFromArray, stopEvent } from "../../utils";
import { PointType, RectangleType, ZoneType } from "../../types/types";
import { MapObject } from "./map-object";

enum DragMode {
    NONE,
    RESIZE,
    MOVE,
    ROTATE
}

export class FurnitureTypeConfig{
    constructor(public icon: string, public url: string) {

    }
}

export class FurnitureConfig{
    constructor(public x: number, public y: number, public width: number, public height: number, public rotation: number, public url: string){

    }
}

export class Furniture extends MapObject {
    public _url: string;

    private _selectedTarget!: EventTarget | null;
    private _selectedElement!: SVGGraphicsElement | null;
    private _dragMode: DragMode;

    private _rotation = 0;
    private _vacRect: ZoneType;
    private _vacRectSnapshot: ZoneType;
    private _startPointSnapshot!: PointType;

    constructor(x: number, y: number, width: number, height: number, rotation: number, url: string, context: Context) {
        super(context);
        this._url = url;
        this._rotation = rotation;
        this._dragMode = DragMode.NONE;
        this._vacRect = this._toVacuumFromDimensions(x, y, width, height);
        this._vacRectSnapshot = this._vacRect;
    }

    static fromConfig(config: FurnitureConfig, context: Context): Furniture{
        return new Furniture(config.x, config.y, config.width, config.height, config.rotation, config.url, context);
    }

    private static _toPoints(rect: RectangleType): string {
        const points = rect
            .filter(p => !isNaN(p[0]) && !isNaN(p[1]))
            .map(p => p.join(", "))
            .join(" ");
        if (points.length == 3) console.error(`Points: ${points}`);
        return points;
    }

    public getConfig(): FurnitureConfig{
        const min = this.vacuumToRealMap(this._vacRect[0], this._vacRect[1]);
        const max = this.vacuumToRealMap(this._vacRect[2], this._vacRect[3]);
        return new FurnitureConfig(min[0], min[1], max[0] - min[0], max[1] - min[1], this._rotation, this._url );
    }

    public render(): SVGTemplateResult {
        const vacuumZone = this._vacRect;
        const mapRect = this.vacuumToMapRect(vacuumZone)[0];
        const descriptionPoint = mapRect[0];
        const rotatePoint = mapRect[1];
        const movePoint = mapRect[2];
        const deletePoint = mapRect[3];
        const angle = Furniture.calcAngle(mapRect[0], mapRect[3]);

        const editMode = this._context.furnitureEditMode();
        return svg`
            <g class="furniture-wrapper ${this.isSelected() ? "selected" : ""}"
               style="--x-resize:${movePoint[0]}px;
                      --y-resize:${movePoint[1]}px;
                      --x-delete:${deletePoint[0]}px;
                      --y-delete:${deletePoint[1]}px;
                      --x-rotate:${rotatePoint[0]}px;
                      --y-rotate:${rotatePoint[1]}px;
                      --x-description:${descriptionPoint[0]}px;
                      --y-description:${descriptionPoint[1]}px;
                      --rotation:${this._rotation}deg;
                      --angle-description: ${angle}rad;">
                <style>
                    .furniture-controls{
                        visibility: ${editMode ? "visible" : "hidden"};
                    }
                </style>
                <image class="furniture ${editMode ? "draggable movable" : null}"
                         @mousedown="${(e: MouseEvent): void => this._startDrag(e)}"
                         @mousemove="${(e: MouseEvent): void => this._drag(e)}"
                         @mouseup="${(e: MouseEvent): void => this._endDrag(e)}"
                         @touchstart="${(e: MouseEvent): void => this._startDrag(e)}"
                         @touchmove="${(e: MouseEvent): void => this._drag(e)}"
                         @touchend="${(e: MouseEvent): void => this._endDrag(e)}"
                         @touchleave="${(e: MouseEvent): void => this._endDrag(e)}"
                         @touchcancel="${(e: MouseEvent): void => this._endDrag(e)}"
                         href="${this._url}"
                         >
                </image>
                <circle class="furniture-delete-circle clickable furniture-controls"
                        @mouseup="${(e: MouseEvent): void => this._delete(e)}"></circle>
                <path class="furniture-delete-icon furniture-controls"
                      d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z">
                </path>
                <circle class="furniture-resize-circle draggable resizer furniture-controls"
                        @mousedown="${(e: MouseEvent): void => this._startDrag(e)}"
                        @mousemove="${(e: MouseEvent): void => this._drag(e)}"
                        @mouseup="${(e: MouseEvent): void => this._endDrag(e)}"
                        @touchstart="${(e: MouseEvent): void => this._startDrag(e)}"
                        @touchmove="${(e: MouseEvent): void => this._drag(e)}"
                        @touchend="${(e: MouseEvent): void => this._endDrag(e)}"
                        @touchleave="${(e: MouseEvent): void => this._endDrag(e)}"
                        @touchcancel="${(e: MouseEvent): void => this._endDrag(e)}">
                </circle>
                <path class="furniture-resize-icon furniture-controls"
                      d="M13,21H21V13H19V17.59L6.41,5H11V3H3V11H5V6.41L17.59,19H13V21Z">
                </path>

                <circle class="furniture-rotate-circle draggable rotatable furniture-controls"
                        @mousedown="${(e: MouseEvent): void => this._startDrag(e)}"
                        @mousemove="${(e: MouseEvent): void => this._drag(e)}"
                        @mouseup="${(e: MouseEvent): void => this._endDrag(e)}"
                        @touchstart="${(e: MouseEvent): void => this._startDrag(e)}"
                        @touchmove="${(e: MouseEvent): void => this._drag(e)}"
                        @touchend="${(e: MouseEvent): void => this._endDrag(e)}"
                        @touchleave="${(e: MouseEvent): void => this._endDrag(e)}"
                        @touchcancel="${(e: MouseEvent): void => this._endDrag(e)}">
                </circle>

                <path class="furniture-rotate-icon furniture-controls" d="M10 2a8 8 0 1 0 5.3 14.26l-1-1.53A6.5 6.5 0 1 1 16.5 10h-2l2.5 3 2.5-3h-2A8 8 0 0 0 10 2z" stroke-width="2"/>
            </g>
        `;
    }

    public isSelected(): boolean {
        return this._selectedElement != null;
    }

    public externalDrag(event: MouseEvent | TouchEvent): void {
        this._drag(event);
    }

    public toVacuum(
        repeats: number | null = null,
    ): [number, number, number, number] | [number, number, number, number, number] {
        const [x1, y1, x2, y2] = this._vacRect;
        const ordered = [Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2)] as ZoneType;
        if (repeats != null) {
            return [...ordered, repeats];
        }
        return ordered;
    }

    private _startDrag(event: MouseEvent | TouchEvent): void {
        if (window.TouchEvent && event instanceof TouchEvent && (event as TouchEvent).touches.length > 1) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        if (!(<Element>event.target).classList.contains("draggable")) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        if (!(<Element>event.target).parentElement?.classList.contains("furniture-wrapper")) {
            return;
        }
        if (!(event.target as SVGGraphicsElement).parentElement) {
            return;
        }
        stopEvent(event);
        this._selectedTarget = event.target;
        const targetElement = event.target as SVGGraphicsElement;
        if (targetElement.classList.contains("movable")) {
            this._dragMode = DragMode.MOVE;
        } else if (targetElement.classList.contains("resizer")) {
            this._dragMode = DragMode.RESIZE;
        } else if (targetElement.classList.contains("rotatable")) {
            this._dragMode = DragMode.ROTATE;
        } else {
            this._dragMode = DragMode.NONE;
        }
        this._selectedElement = (event.target as SVGGraphicsElement).parentElement as unknown as SVGGraphicsElement;
        this._vacRectSnapshot = [...this._vacRect];
        const mousePosition = this.getMousePosition(event);
        this._startPointSnapshot = this.scaledMapToVacuum(mousePosition.x, mousePosition.y);
        this.update();
    }

    private _drag(event: MouseEvent | TouchEvent): void {
        if (window.TouchEvent && event instanceof TouchEvent && (event as TouchEvent).touches.length > 1) {
            return;
        }
        if (this._selectedElement) {
            stopEvent(event);
            const coord = this.getMousePosition(event);
            if (coord) {
                const currentPoint = this.scaledMapToVacuum(coord.x, coord.y);
                const diffX = currentPoint[0] - this._startPointSnapshot[0];
                const diffY = currentPoint[1] - this._startPointSnapshot[1];
                switch (this._dragMode) {
                    case DragMode.MOVE:
                        this._vacRect = [
                            this._vacRectSnapshot[0] + diffX,
                            this._vacRectSnapshot[1] + diffY,
                            this._vacRectSnapshot[2] + diffX,
                            this._vacRectSnapshot[3] + diffY,
                        ] as ZoneType;
                        this._setup(this.vacuumToMapRect(this._vacRect)[0]);
                        break;
                    case DragMode.RESIZE:
                        const topLeftVacuumPoint = this.vacuumToMapRect(this._vacRectSnapshot)[1][0];
                        const tmpSnapshot = [...this._vacRect] as ZoneType;
                        if (topLeftVacuumPoint[0] === this._vacRectSnapshot[0]) {
                            this._vacRect[2] = this._vacRectSnapshot[2] + diffX;
                        } else {
                            this._vacRect[0] = this._vacRectSnapshot[0] + diffX;
                        }
                        if (topLeftVacuumPoint[1] === this._vacRectSnapshot[1]) {
                            this._vacRect[3] = this._vacRectSnapshot[3] + diffY;
                        } else {
                            this._vacRect[1] = this._vacRectSnapshot[1] + diffY;
                        }
                        if (
                            Math.sign(this._vacRect[0] - this._vacRect[2]) !=
                                Math.sign(tmpSnapshot[0] - tmpSnapshot[2]) ||
                            Math.sign(this._vacRect[1] - this._vacRect[3]) != Math.sign(tmpSnapshot[1] - tmpSnapshot[3])
                        )
                            this._vacRect = tmpSnapshot;
                        this._setup(this.vacuumToMapRect(this._vacRect)[0]);
                        break;
                    case DragMode.ROTATE:
                        break;
                    case DragMode.NONE:
                        break;
                }
            }
        }
    }

    private _setup(mapRect: RectangleType): void {
        this._selectedElement?.children?.item(0)?.setAttribute("points", Furniture._toPoints(mapRect));
        const descriptionPoint = mapRect[0];
        const rotatePoint = mapRect[1];
        const movePoint = mapRect[2];
        const deletePoint = mapRect[3];
        const angle = Furniture.calcAngle(mapRect[0], mapRect[3]);
        this._selectedElement?.style?.setProperty("--x-resize", movePoint[0] + "px");
        this._selectedElement?.style?.setProperty("--y-resize", movePoint[1] + "px");
        this._selectedElement?.style?.setProperty("--x-delete", deletePoint[0] + "px");
        this._selectedElement?.style?.setProperty("--y-delete", deletePoint[1] + "px");
        this._selectedElement?.style?.setProperty("--x-rotate", rotatePoint[0] + "px");
        this._selectedElement?.style?.setProperty("--y-rotate", rotatePoint[1] + "px");
        this._selectedElement?.style?.setProperty("--x-description", descriptionPoint[0] + "px");
        this._selectedElement?.style?.setProperty("--y-description", descriptionPoint[1] + "px");
        this._selectedElement?.style?.setProperty("--angle-description", angle + "rad");
    }

    private _rotateNext(): void{
        //[this._vacRect[0], this._vacRect[1]] = [this._vacRect[1], this._vacRect[0]];
        //[this._vacRect[2], this._vacRect[3]] = [this._vacRect[3], this._vacRect[2]];

        //const rect = this.vacuumToMapRect(this._vacRect)[0];

        //const nextRect = [rect[1], rect[0], rect[3], rect[2]];

        //this._setup(rect);

        this._rotation += 45;
        if (this._rotation >= 360)
            this._rotation -= 360;

        this._selectedElement?.style?.setProperty("--rotation", this._rotation + "deg");

        this.update();
    }

    private _endDrag(event: MouseEvent | TouchEvent): void {
        if (this._dragMode === DragMode.ROTATE) {
            this._rotateNext();
        }

        stopEvent(event);
        this._selectedElement = null;
        this._selectedTarget = null;
        this.update();
    }

    private _delete(event: MouseEvent | TouchEvent): void {
        stopEvent(event);
        const index = deleteFromArray(this._context.furniture(), this);
        if (index > -1) {
            forwardHaptic("selection");
            this.update();
        }
    }

    private _toVacuumFromDimensions(x, y, width, height): [number, number, number, number] {
        const imageX = this.realScaled(x);
        const imageY = this.realScaled(y);
        const imageWidth = this.realScaled(width);
        const imageHeight = this.realScaled(height);
        const vacuumStart = this.realMapToVacuum(imageX, imageY);
        const vacuumEnd = this.realMapToVacuum(imageX + imageWidth, imageY + imageHeight);
        const v1 = [vacuumStart[0], vacuumEnd[0]].sort();
        const v2 = [vacuumStart[1], vacuumEnd[1]].sort();
        return [v1[0], v2[0], v1[1], v2[1]];
    }

    public static get styles(): CSSResultGroup {
        return css`
            .resizer {
                cursor: nwse-resize;
            }

            .movable {
                cursor: move;
            }

            .rotatable {
                cursor: pointer;
            }

            .furniture-wrapper {
            }

            .furniture-wrapper.selected {
            }

            .furniture {
                stroke: var(--map-card-internal-manual-rectangle-line-color);
                stroke-linejoin: round;
                stroke-dasharray: calc(var(--map-card-internal-manual-rectangle-line-segment-line) / var(--map-scale)),
                    calc(var(--map-card-internal-manual-rectangle-line-segment-gap) / var(--map-scale));
                fill: var(--map-card-internal-manual-rectangle-fill-color);
                stroke-width: calc(var(--map-card-internal-manual-rectangle-line-width) / var(--map-scale));
                x: var(--x-description);
                y: var(--y-description);
                width: calc(var(--x-resize) - var(--x-description));
                height: calc(var(--y-resize) - var(--y-description));
                transform: rotate(var(--rotation));
                transform-origin: center;
                transform-box: fill-box;
            }

            .furniture-wrapper.selected > .furniture {
                stroke: var(--map-card-internal-manual-rectangle-line-color-selected);
                fill: var(--map-card-internal-manual-rectangle-fill-color-selected);
            }

            .furniture-description {
                transform: translate(
                        calc(
                            var(--x-description) + var(--map-card-internal-manual-rectangle-description-offset-x) /
                                var(--map-scale)
                        ),
                        calc(
                            var(--y-description) + var(--map-card-internal-manual-rectangle-description-offset-y) /
                                var(--map-scale)
                        )
                    )
                    rotate(var(--angle-description));
                font-size: calc(var(--map-card-internal-manual-rectangle-description-font-size) / var(--map-scale));
                fill: var(--map-card-internal-manual-rectangle-description-color);
                background: transparent;
            }

            .furniture-delete-circle {
                r: calc(var(--map-card-internal-manual-rectangle-delete-circle-radius) / var(--map-scale));
                cx: var(--x-delete);
                cy: var(--y-delete);
                stroke: var(--map-card-internal-manual-rectangle-delete-circle-line-color);
                fill: var(--map-card-internal-manual-rectangle-delete-circle-fill-color);
                stroke-width: calc(
                    var(--map-card-internal-manual-rectangle-delete-circle-line-width) / var(--map-scale)
                );
            }

            .furniture-delete-icon {
                fill: var(--map-card-internal-manual-rectangle-delete-icon-color);
                transform: translate(
                        calc(var(--x-delete) - 8.5px / var(--map-scale)),
                        calc(var(--y-delete) - 8.5px / var(--map-scale))
                    )
                    scale(calc(0.71 / var(--map-scale)));
                pointer-events: none;
            }

            .furniture-wrapper.selected > .furniture-delete-circle {
                stroke: var(--map-card-internal-manual-rectangle-delete-circle-line-color-selected);
                fill: var(--map-card-internal-manual-rectangle-delete-circle-fill-color-selected);
                opacity: 50%;
            }

            .furniture-wrapper.selected > .furniture-delete-icon {
                fill: var(--map-card-internal-manual-rectangle-delete-icon-color-selected);
                opacity: 50%;
            }

            .furniture-resize-circle {
                r: calc(var(--map-card-internal-manual-rectangle-resize-circle-radius) / var(--map-scale));
                cx: var(--x-resize);
                cy: var(--y-resize);
                stroke: var(--map-card-internal-manual-rectangle-resize-circle-line-color);
                fill: var(--map-card-internal-manual-rectangle-resize-circle-fill-color);
                stroke-width: calc(
                    var(--map-card-internal-manual-rectangle-resize-circle-line-width) / var(--map-scale)
                );
            }

            .furniture-rotate-circle {
                r: calc(var(--map-card-internal-manual-rectangle-resize-circle-radius) / var(--map-scale));
                cx: var(--x-rotate);
                cy: var(--y-rotate);
                stroke: var(--map-card-internal-manual-rectangle-resize-circle-line-color);
                fill: var(--map-card-internal-manual-rectangle-resize-circle-fill-color);
                stroke-width: calc(
                    var(--map-card-internal-manual-rectangle-resize-circle-line-width) / var(--map-scale)
                );
            }

            .furniture-rotate-icon {
                fill: var(--map-card-internal-manual-rectangle-resize-icon-color);
                transform: translate(
                        calc(var(--x-rotate) - 7.5px / var(--map-scale)),
                        calc(var(--y-rotate) - 7.5px / var(--map-scale))
                    )
                    scale(calc(0.71 / var(--map-scale)));
                pointer-events: none;
            }

            .furniture-resize-icon {
                fill: var(--map-card-internal-manual-rectangle-resize-icon-color);
                transform: translate(
                        calc(var(--x-resize) - 8.5px / var(--map-scale)),
                        calc(var(--y-resize) - 8.5px / var(--map-scale))
                    )
                    scale(calc(0.71 / var(--map-scale)));
                pointer-events: none;
            }

            .furniture-wrapper.selected > .furniture-resize-circle {
                stroke: var(--map-card-internal-manual-rectangle-resize-circle-line-color-selected);
                fill: var(--map-card-internal-manual-rectangle-resize-circle-fill-color-selected);
                opacity: 50%;
            }

            .furniture-wrapper.selected > .furniture-resize-icon {
                fill: var(--map-card-internal-manual-rectangle-resize-icon-color-selected);
                opacity: 50%;
            }
        `;
    }
}
