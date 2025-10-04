import {
    Component,
    Entity,
    Key,
    MathUtil,
    newSystem,
    RectCollider,
    RenderCircle,
    RenderRect,
    Sprite,
    TextDisp,
    Timer,
    types
} from "lagom-engine";
import {Layers, MainScene} from "./LD58.ts";

export class Truck extends Entity
{
    constructor()
    {
        super("truck", 50, 80);
    }

    onAdded()
    {
        super.onAdded();

        this.scene.addFixedFnSystem(gravSystem)
        this.scene.addFnSystem(rotSystem)
        this.scene.addFnSystem(driveSystem)
        this.scene.addFnSystem(powerSystem)

        this.addComponent(new Drive());
        this.addComponent(new Charger());

        this.addComponent(new TextDisp(0, -40, "POWER", {fontSize: 5, fill: "white"}));
        this.addComponent(new RenderCircle(0, 0, 11));

        this.addComponent(new Timer(1000, null, true)).onTrigger.register((caller, data) => {
            this.scene.addEntity(new Bin(60, 80));
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

class Power extends Component
{
    constructor(readonly value: number)
    {
        super();
    }
}

class Flipper extends Entity
{
    constructor(x: number, y: number, readonly power: number)
    {
        super("flipper", x, y);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new RenderRect(-10, 0, 20, 2));
        this.addComponent(new Power(this.power));
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

class Charger extends Component
{
    level: number = 0;
}

const driveSystem = newSystem(types(Drive), (delta, entity, _) => {
    const kb = entity.scene.game.keyboard;
    if (kb.isKeyDown(Key.KeyA))
    {
        entity.transform.position.x -= delta * .10;
    }
    if (kb.isKeyDown(Key.KeyD))
    {
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

const powerSystem = newSystem(types(Charger, TextDisp), (delta, entity, power, txt) => {
    if (entity.scene.game.keyboard.isKeyDown(Key.Space))
    {
        power.level += delta * 0.08;
    }
    if (entity.scene.game.keyboard.isKeyReleased(Key.Space))
    {
        entity.addChild(new Flipper(-10, 0, power.level))
        power.level = 0;
    }

    txt.pixiObj.text = `POWER ${power.level.toFixed(0)}`;
})

const rotSystem = newSystem(types(Phys, Sprite), (delta, entity, phys, spr) => {
    spr.applyConfig({rotation: spr.pixiObj.rotation + phys.rot * delta * 0.001});
})