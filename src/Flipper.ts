import {Component, Entity, RectCollider, RenderCircle, RenderRect, Timer} from "lagom-engine";
import {Layers, MainScene} from "./LD58.ts";

export class Flipper extends Entity
{
    constructor(x: number, y: number, readonly power: number, readonly side: number)
    {
        super("flipper", x, y);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new RenderRect(-10, 0, 20, 2));
        // this.addComponent(new RenderCircle(-10 * this.side, 0, 4));
        this.addComponent(new FlipVals(this.power, this.side));
        this.addComponent(new RectCollider(MainScene.collSystem, {
            xOff: -10,
            yOff: 0,
            width: 20,
            height: 2,
            layer: Layers.FLIPPER
        }))
        this.addComponent(new Timer(100, null)).onTrigger.register((caller, data) => {
            caller.parent.destroy()
        });
    }
}

export class FlipVals extends Component
{
    constructor(readonly power: number, readonly side: number)
    {
        super();
    }
}