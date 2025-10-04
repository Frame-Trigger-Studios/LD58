import {
    Component,
    Entity,
    Key,
    MathUtil,
    newSystem,
    RectSatCollider,
    RenderRect,
    Sprite,
    Timer,
    types
} from "lagom-engine";
import {Layers} from "./LD58.ts";

export class Truck extends Entity
{
    constructor()
    {
        super("truck", 50, 80);
    }

    onAdded()
    {
        super.onAdded();

        // this.addChild(new Flipper(-10, 0))
        this.addChild(new Flipper(10, 0))

        this.scene.addFixedFnSystem(gravSystem)
        this.scene.addFnSystem(rotSystem)
        this.scene.addFnSystem(driveSystem)

        this.addComponent(new Drive());

        this.addComponent(new Timer(1000, null, true)).onTrigger.register((caller, data) => {
            this.scene.addEntity(new Bin(60, 50));
        })
    }
}

class Bin extends Entity
{
    constructor(x: number, y: number)
    {
        super("bin", x, y);
    }

    onAdded()
    {
        super.onAdded();

        // this.addComponent(new RenderRect(-5, -5, 10, 10, null, 0xffffff));
        this.addComponent(new Sprite(this.scene.game.getResource("bin").textureFromIndex(0), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }))
        const phys = this.addComponent(new Phys());
        this.addComponent(new Gravity());
        this.addComponent(new RectSatCollider({
            width: 10,
            height: 10,
            xOff: -5,
            yOff: -5,
            layer: Layers.BIN
        })).onTriggerEnter.register((caller, data) => {
            if (data.other.layer == Layers.FLIPPER)
            {
                phys.yVel = -200;
                phys.xVel = MathUtil.randomRange(-50, 50);
                phys.rot = MathUtil.randomRange(-10, 10);
            }
        })
    }
}

class Flipper extends Entity
{
    constructor(x: number, y: number)
    {
        super("flipper", x, y);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new RenderRect(-5, 0, 10, 5));
        this.addComponent(new RectSatCollider({xOff: -5, yOff: 0, width: 10, height: 5, layer: Layers.FLIPPER}))
    }
}

class Gravity extends Component
{
}

class Phys extends Component
{
    xVel = 0;
    yVel = 0;
    rot = 0;
}

class Drive extends Component
{
}

const driveSystem = newSystem(types(Drive),(delta, entity, _) => {
    const kb = entity.scene.game.keyboard;
    if (kb.isKeyDown(Key.KeyA)) {
        entity.transform.position.x -= delta * .10;
    }
    if (kb.isKeyDown(Key.KeyD)) {
        entity.transform.position.x += delta * .10;
    }
});

const gravSystem = newSystem(types(Phys, Gravity), (delta, entity, phys, gravity) => {
    phys.yVel += delta * 0.3;
    // phys.yVel = MathUtil.clamp(phys.yVel, -500, 500);

    // phys.xVel = phys.xVel * delta;


    entity.transform.y += phys.yVel * delta * 0.001;
    entity.transform.x += phys.xVel * delta * 0.001;
});

const rotSystem = newSystem(types(Phys, Sprite), (delta, entity, phys, spr) => {
    spr.applyConfig({rotation: spr.pixiObj.rotation + phys.rot * delta * 0.001});
})