import {Entity, MathUtil, RectCollider, RenderCircle, Sprite, VariantSprite} from "lagom-engine";
import {Layers, MainScene} from "./LD58.ts";
import {Gravity, Phys} from "./Physics.ts";
import {FlipVals} from "./Flipper.ts";

export class Bin extends Entity
{
    constructor(x: number, y: number)
    {
        super("bin", x, y, Layers.BIN);
    }

    onAdded()
    {
        super.onAdded();

        // Bin.
        this.addComponent(new Sprite(this.scene.game.getResource("bin").textureFromIndex(0), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }))

        this.addComponent(new VariantSprite(this.scene.game.getResource("bin").textureSliceFromRow(1, 0, 2), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }))
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
                // Based on the relative position to the centre of the flipper, we want to adjust the launch angle
                const flip = data.other.parent.getComponent<FlipVals>(FlipVals);
                if (flip == null) return;

                phys.yVel = - 100 + -flip.power * 2;

                let dist = 0;

                // Left
                if (flip.side === -1)
                {
                    dist = (data.other.body.x + 10) - caller.body.x
                } else
                {
                    dist = ((data.other.body.x - 10) - caller.body.x) * -1;
                }

                console.log(dist)
                phys.xVel = MathUtil.randomRange(-50, 50);
                phys.rot = MathUtil.randomRange(-10, 10);

                if (caller.parent.getComponent(Gravity) == null)
                {
                    this.addComponent(new Gravity());
                }
            }
        });

        this.addComponent(new RenderCircle(0, 0, 3));
    }
}