import {
    CircleCollider,
    Component,
    Entity,
    MathUtil,
    newSystem,
    RectCollider,
    RenderRect,
    Sprite,
    types,
    Util,
    VariantSprite
} from "lagom-engine";
import {Layers, MainScene} from "./LD58.ts";
import {Gravity, Phys} from "./Physics.ts";
import {FlipVals} from "./Flipper.ts";
import {Mode7Me} from "./Scroller.ts";
import {BasePoints} from "./Score.ts";

export class BinLid extends Entity {

    variant = Util.choose(0, 1, 2)

    constructor(x: number, y: number, layer: number) {
        super("binlid", x, y, layer);
    }

    onAdded() {
        super.onAdded();
        this.addComponent(new Mode7Me(this.transform.x));
        this.addComponent(new Sprite(this.scene.game.getResource("bin").textureSliceFromRow(1, 0, 2)[this.variant], {
            xAnchor: 0.5,
            yAnchor: 0.5,
        }))
    }
}

export class AirBinLid extends Entity {
    constructor(x: number, y: number, readonly phys: Phys, readonly variant: number, readonly scale: number) {
        super("airbinlid", x, y, Layers.AIR_ITEM);
    }

    onAdded() {
        super.onAdded();
        this.addComponent(new Sprite(this.scene.game.getResource("bin").textureSliceFromRow(1, 0, 2)[this.variant], {
            xAnchor: 0.5,
            yAnchor: 0.5,
            xScale: this.scale,
            yScale: this.scale
        }))

        this.addComponent(new CircleCollider(MainScene.collSystem, {layer: Layers.AIR_ITEM, radius: 3}))
        this.addComponent(new Gravity());
        this.addComponent(new BasePoints(20))

        this.addComponent(this.phys);
    }
}

class Trash extends Entity {
    constructor(x: number, y: number) {
        super("trash", x, y, Layers.AIR_ITEM);
    }

    onAdded() {
        super.onAdded();
        this.addComponent(new VariantSprite(this.scene.game.getResource("trash").textureSliceFromSheet(), {
            xAnchor: 0.5,
            yAnchor: 0.5,
            rotation: MathUtil.degToRad(MathUtil.randomRange(0, 360))
        }))

        this.addComponent(new Gravity());
        this.addComponent(new CircleCollider(MainScene.collSystem, {layer: Layers.AIR_ITEM, radius: 3}))
        this.addComponent(new BasePoints(5))
    }
}

export class MakeTrash extends Component {
}

export const trashSpawnSystem = newSystem(types(Phys, MakeTrash), (delta, entity, phys, mkTrash) => {
    // randomly make trash if we are going fast enough and we trigger the random thing
    if (phys.yVel < -140 && Math.abs(phys.rot) > 4) {
        for (let i = 0; i < MathUtil.randomRange(1, 10); i++) {
            let trash = entity.scene.addEntity(new Trash(entity.transform.x, entity.transform.y - 5));
            const trashPhys = trash.addComponent(new Phys())
            trashPhys.yVel = phys.yVel * MathUtil.randomRange(80, 130) * 0.01;
            trashPhys.xVel = phys.xVel * MathUtil.randomRange(50, 130) * 0.01;
            trashPhys.rot = phys.rot * 0.7
        }

        mkTrash.destroy();
    }
});

export class AirBin extends Entity {
    constructor(x: number, y: number, readonly phys: Phys, readonly scale: number) {
        super("airbin", x, y, Layers.AIR_ITEM);
    }

    onAdded() {
        super.onAdded();

        // Bin.
        this.addComponent(new Sprite(this.scene.game.getResource("bin").textureFromIndex(0), {
            xAnchor: 0.5,
            yAnchor: 0.5,
            xScale: this.scale,
            yScale: this.scale
        }))

        this.addComponent(this.phys);
        this.addComponent(new Gravity());
        this.addComponent(new MakeTrash());
        this.addComponent(new BasePoints(50))

        this.addComponent(new CircleCollider(MainScene.collSystem, {layer: Layers.AIR_ITEM, radius: 3}))
    }
}

export class Bin extends Entity {
    constructor(x: number, y: number, readonly inLayer: number) {
        super("bin", x, y, inLayer);
    }

    onAdded() {
        super.onAdded();

        this.addComponent(new Mode7Me(this.transform.x));

        // Bin.
        const sprite = this.addComponent(new Sprite(this.scene.game.getResource("bin").textureFromIndex(0), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }))

        const lid = this.scene.addEntity(new BinLid(this.transform.x, this.transform.y, this.inLayer + 0.00001));

        // this.addComponent(new RenderRect(-3, -4, 5, 9))
        this.addComponent(new RectCollider(MainScene.collSystem, {
            xOff: -3,
            yOff: -4,
            width: 5,
            height: 9,
            layer: Layers.BIN
        })).onTriggerEnter.register((caller, data) => {
            if (data.other.layer === Layers.FLIPPER) {
                const flip = data.other.parent.getComponent<FlipVals>(FlipVals);
                if (flip == null) return;

                const phys = new Phys();
                phys.yVel = -75 + -flip.power * 2;
                phys.xVel = MathUtil.randomRange(10, 80) * -flip.side;
                phys.rot = MathUtil.randomRange(2, 10) * -flip.side;

                this.scene.addEntity(new AirBin(this.transform.x, this.transform.y, phys, sprite.pixiObj.scale.x))

                const lidPhys = new Phys();
                lidPhys.yVel = -75 + -flip.power * 2.3;
                lidPhys.xVel = MathUtil.randomRange(10, 80) * -flip.side;
                lidPhys.rot = phys.rot * 0.7
                this.scene.addEntity(new AirBinLid(lid.transform.x, lid.transform.y, lidPhys, lid.variant, lid.getComponent<Sprite>(Sprite)?.pixiObj.scale.x ?? 1))

                this.destroy();
                lid.destroy();
            }
        });
    }
}
