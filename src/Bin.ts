import {Entity, MathUtil, RectCollider, RenderRect, Sprite} from "lagom-engine";
import {Layers, MainScene} from "./LD58.ts";
import {Gravity, Phys} from "./Physics.ts";
import {Power} from "./Flipper.ts";

export class Bin extends Entity
{
    constructor(x: number, y: number)
    {
        super("bin", x, y);
    }

    onAdded()
    {
        super.onAdded();

        // this.addComponent(new Gravity());

        this.addComponent(new RenderRect(-5, -5, 10, 10, null, 0xffffff));
        this.addComponent(new Sprite(this.scene.game.getResource("bin").textureFromIndex(0), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }))
        const phys = this.addComponent(new Phys());
        this.addComponent(new RectCollider(MainScene.collSystem, {
            width: 10,
            height: 10,
            xOff: -5,
            yOff: -5,
            layer: Layers.BIN
        })).onTriggerEnter.register((caller, data) => {
            console.log(data.result)
            if (data.other.layer === Layers.FLIPPER)
            {
                // Based on the relative position to the centre of the flipper, we want to adjust the launch angle
                const power = data.other.parent.getComponent<Power>(Power);
                if (power == null) return;

                phys.yVel = -power.value * 2;
                phys.xVel = MathUtil.randomRange(-50, 50);
                phys.rot = MathUtil.randomRange(-10, 10);

                if (caller.parent.getComponent(Gravity) == null)
                {
                    this.addComponent(new Gravity());
                }
            }
        });
    }
}