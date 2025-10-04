import {Component, Entity, Key, MathUtil, newSystem, Sprite, TextDisp, Timer, types} from "lagom-engine";
import {Bin} from "./Bin.ts";
import {Flipper} from "./Flipper.ts";
import {Layers, LD58} from "./LD58.ts";

export class LeftFlipper extends Entity
{

    constructor()
    {
        super("LeftFlipper", -20, 15, Layers.TRUCK);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new Sprite(this.scene.getGame().getResource("flipper").texture(0, 0), {
            xScale: 1, xAnchor: 1, yAnchor: 1
        }))
    }
}

export class RightFlipper extends Entity
{

    constructor()
    {
        super("RightFlipper", 18, 8, Layers.TRUCK);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new Sprite(this.scene.getGame().getResource("flipper").texture(0, 0), {
            xScale: -1, xAnchor: 1
        }));
    }
}

export class Truck extends Entity
{
    constructor()
    {
        super("truck", 50, 60, Layers.TRUCK);
    }

    onAdded()
    {
        super.onAdded();

        this.scene.addFnSystem(driveSystem)
        this.scene.addFnSystem(powerSystem)

        this.addComponent(new Drive());
        this.addComponent(new Charger());

        this.addComponent(new TextDisp(0, -40, "POWER", {fontSize: 5, fill: "black"}));
        this.addComponent(new Sprite(this.scene.game.getResource("truck").textureFromIndex(0), {
            xAnchor: 0.5, yAnchor: 0.5
        }));
        this.addChild(new LeftFlipper());
        this.addChild(new RightFlipper());
        // this.addComponent(new RenderCircle(0, 0, 11));

        this.addComponent(new Timer(1000, null, true)).onTrigger.register((caller, data) => {
            this.scene.addEntity(new Bin(60, 65));
        })
    }
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

    entity.transform.position.x = MathUtil.clamp(entity.transform.position.x, LD58.GAME_WIDTH / 2 - 25, LD58.GAME_WIDTH / 2 + 25);
});


const powerSystem = newSystem(types(Charger, TextDisp), (delta, entity, power, txt) => {
    if (entity.scene.game.keyboard.isKeyDown(Key.Space))
    {
        power.level += delta * 0.08;
    }
    if (entity.scene.game.keyboard.isKeyReleased(Key.Space))
    {
        entity.addChild(new Flipper(-50, 10, power.level, -1))
        entity.addChild(new Flipper(50, 10, power.level, 1))
        entity.scene.getEntityWithName("LeftFlipper")?.getComponent<Sprite>(Sprite)?.applyConfig({
            rotation: MathUtil.degToRad(30),
        });
        entity.scene.getEntityWithName("RightFlipper")?.getComponent<Sprite>(Sprite)?.applyConfig({
            rotation: MathUtil.degToRad(-30)
        });
        power.level = 0;
    }

    txt.pixiObj.text = `POWER ${power.level.toFixed(0)}`;
})
