import {Component, Entity, MathUtil, RectCollider, RenderRect, Sprite, Timer} from "lagom-engine";
import {Layers, LD58, MainScene} from "./LD58.ts";

export class Flipper extends Entity
{
    constructor(x: number, y: number, readonly power: number, readonly side: number)
    {
        super("flipper", x, y, Layers.FLIPPER);
    }

    onAdded()
    {
        super.onAdded();

        let xoff = -20;

        if (this.side == -1) {
            xoff = 10;
        }

        this.addComponent(new FlipVals(this.power, this.side));
        // this.addComponent(new RenderRect(xoff, 0, 10, 6));
        this.addComponent(new RectCollider(MainScene.collSystem, {
            xOff: xoff,
            yOff: 0,
            width: 10,
            height: 6,
            layer: Layers.FLIPPER
        }))
        this.addComponent(new Timer(100, null)).onTrigger.register((caller, data) => {
            caller.parent.destroy()
            caller.parent.scene.getEntityWithName("LeftFlipper")?.getComponent<Sprite>(Sprite)?.applyConfig({
                rotation: MathUtil.degToRad(0),
            });
            caller.parent.scene.getEntityWithName("RightFlipper")?.getComponent<Sprite>(Sprite)?.applyConfig({
                rotation: MathUtil.degToRad(0)
            });
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