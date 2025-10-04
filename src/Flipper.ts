import {Component, Entity, RectCollider, RenderRect, Sprite, Timer} from "lagom-engine";
import {Layers, LD58, MainScene} from "./LD58.ts";

export class Flipper extends Entity {
    constructor(x: number, y: number, readonly power: number, private right: boolean) {
        super("flipper", x, y, Layers.FLIPPER);
    }

    onAdded() {
        super.onAdded();

        let xscale = 1;
        let xoff = 0;

        if (!this.right) {
            xscale = -1;
            xoff = -10;
        }

        this.addComponent(new RenderRect(xoff, 0,  10, 6));
        this.addComponent(new Sprite(this.scene.getGame().getResource("flipper").texture(0, 0), {
            xScale: xscale
        }));

        this.addComponent(new Power(this.power));
        this.addComponent(new RectCollider(MainScene.collSystem, {
            xOff: xoff,
            yOff: 0,
            width: 10,
            height: 6,
            layer: Layers.FLIPPER
        }))
        this.addComponent(new Timer(100, null)).onTrigger.register((caller, data) => {
            caller.parent.destroy()
        });
    }
}

export class Power extends Component {
    constructor(readonly value: number) {
        super();
    }
}