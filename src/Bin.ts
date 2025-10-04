import {Entity, MathUtil, RectCollider, RenderCircle, Sprite, VariantSprite} from "lagom-engine";
import {Layers, MainScene} from "./LD58.ts";
import {Gravity, Phys} from "./Physics.ts";
import {FlipVals} from "./Flipper.ts";
import {Mode7Me} from "./Scroller.ts";

export class BinLid extends Entity {


    constructor() {
        super("binlid", 0, 0, Layers.BIN);
    }

    onAdded() {
        super.onAdded();
        // this.addComponent(new Mode7Me(this.transform.x, 5));
        this.addComponent(new VariantSprite(this.scene.game.getResource("bin").textureSliceFromRow(1, 0, 2), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }))
    }
}

export class Bin extends Entity
{
    constructor(x: number, y: number)
    {
        super("bin", x, y, Layers.BIN);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new Mode7Me(this.transform.x));

        // Bin.
        this.addComponent(new Sprite(this.scene.game.getResource("bin").textureFromIndex(0), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }))

        this.addChild(new BinLid());

        const phys = this.addComponent(new Phys());
        this.addComponent(new RectCollider(MainScene.collSystem, {
            width: 9,
            height: 16,
            xOff: -5,
            yOff: -8,
            layer: Layers.BIN
        })).onTriggerEnter.register((caller, data) => {
            // console.log(data.result)
            if (data.other.layer === Layers.FLIPPER)
            {
                const flip = data.other.parent.getComponent<FlipVals>(FlipVals);
                if (flip == null) return;

                phys.yVel = - 75 + -flip.power * 2;
                phys.xVel = MathUtil.randomRange(10, 80) * -flip.side;
                phys.rot = MathUtil.randomRange(2, 10) * -flip.side;

                if (caller.parent.getComponent(Gravity) == null)
                {
                    this.addComponent(new Gravity());
                    this.getComponent(Mode7Me)?.destroy();
                }
            }
        });

        // this.addComponent(new RenderCircle(0, 0, 3));
    }
}
