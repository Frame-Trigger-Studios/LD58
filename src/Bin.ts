import {Entity, MathUtil, RectCollider, Sprite, VariantSprite} from "lagom-engine";
import {Layers, MainScene} from "./LD58.ts";
import {Gravity, Phys} from "./Physics.ts";
import {FlipVals} from "./Flipper.ts";
import {Mode7Me} from "./Scroller.ts";

export class BinLid extends Entity {


    constructor(x: number, y: number) {
        super("binlid", x, y, Layers.BIN);
    }

    onAdded() {
        super.onAdded();
        this.addComponent(new Mode7Me(this.transform.x));
        this.addComponent(new VariantSprite(this.scene.game.getResource("bin").textureSliceFromRow(1, 0, 2), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }))
    }
}

export class Bin extends Entity {
    constructor(x: number, y: number) {
        super("bin", x, y, Layers.BIN);
    }

    onAdded() {
        super.onAdded();

        this.addComponent(new Mode7Me(this.transform.x));

        // Bin.
        this.addComponent(new Sprite(this.scene.game.getResource("bin").textureFromIndex(0), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }))

        const lid = this.scene.addEntity(new BinLid(this.transform.x, this.transform.y));

        const phys = this.addComponent(new Phys());
        this.addComponent(new RectCollider(MainScene.collSystem, {
            width: 9,
            height: 16,
            xOff: -5,
            yOff: -8,
            layer: Layers.BIN
        })).onTriggerEnter.register((caller, data) => {
            // console.log(data.result)
            if (data.other.layer === Layers.FLIPPER) {
                const flip = data.other.parent.getComponent<FlipVals>(FlipVals);
                if (flip == null) return;

                phys.yVel = -75 + -flip.power * 2;
                phys.xVel = MathUtil.randomRange(10, 80) * -flip.side;
                phys.rot = MathUtil.randomRange(2, 10) * -flip.side;

                if (caller.parent.getComponent(Gravity) == null) {
                    this.addComponent(new Gravity());
                    this.getComponent(Mode7Me)?.destroy();

                    lid.addComponent(new Gravity());
                    lid.getComponent(Mode7Me)?.destroy();

                    const lidPhys = lid.addComponent(new Phys());
                    lidPhys.yVel = -75 + -flip.power * 2.3;
                    lidPhys.xVel = MathUtil.randomRange(10, 80) * -flip.side;
                    lidPhys.rot = phys.rot * 0.7
                }
            }
        });

        // this.addComponent(new RenderCircle(0, 0, 3));
    }
}
