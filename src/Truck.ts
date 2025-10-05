import {
    AnimatedSprite,
    Component,
    Entity,
    Key,
    MathUtil,
    newSystem,
    RectCollider,
    RenderRect,
    Sprite,
    TextDisp,
    types,
    Util
} from "lagom-engine";
import {Flipper} from "./Flipper.ts";
import {Layers, LD58, MainScene} from "./LD58.ts";
import {BasePoints, ScoreComponent, ScoreToast} from "./Score.ts";

export class LeftFlipper extends Entity {

    constructor() {
        super("LeftFlipper", -10, 15, Layers.FLIPPER);
    }

    onAdded() {
        super.onAdded();

        this.addComponent(new Sprite(this.scene.getGame().getResource("flipper").texture(0, 0), {
            xScale: 1, xAnchor: 1, yAnchor: 1
        }))
        this.addComponent(new Jiggle());
    }
}

export class RightFlipper extends Entity {

    constructor() {
        super("RightFlipper", 10, 8, Layers.FLIPPER);
    }

    onAdded() {
        super.onAdded();

        this.addComponent(new Sprite(this.scene.getGame().getResource("flipper").texture(0, 0), {
            xScale: -1, xAnchor: 1
        }));
        this.addComponent(new Jiggle());

    }
}

export class DadTruck extends Entity {
    constructor() {
        super("truck_parent", 50, 60, Layers.TRUCK);
    }

    onAdded() {
        super.onAdded();

        this.addChild(new Truck());
        this.addChild(new LeftFlipper());
        this.addChild(new RightFlipper());

        this.scene.addFnSystem(driveSystem)

        this.addComponent(new Drive());

    }
}

export class Truck extends Entity {
    constructor() {
        super("truck", 0, 0, Layers.TRUCK);
    }

    onAdded() {
        super.onAdded();

        this.scene.addFixedFnSystem(jiggleSystem)
        this.scene.addFnSystem(powerSystem)

        this.addComponent(new Charger());
        this.addComponent(new Jiggle());
        this.addChild(new PowerBar());

        this.addComponent(new TextDisp(0, -40, "POWER", {fontSize: 5, fill: "black"}));
        this.addComponent(new Sprite(this.scene.game.getResource("truck").textureFromIndex(0), {
            xAnchor: 0.5, yAnchor: 0.5
        }));

        // this.addComponent(new RenderCircle(0, 0, 11));
        // this.addComponent(new RenderRect(-12, 0, 24, 2));
        this.addComponent(new RectCollider(MainScene.collSystem, {
            xOff: -12,
            yOff: 0,
            width: 24,
            height: 2,
            layer: Layers.TRUCK
        })).onTriggerEnter.register((caller, data) => {
            // console.log(data.result)
            if (data.other.layer === Layers.AIR_ITEM && data.other.parent.transform.y > caller.parent.transform.y) {
                const points = data.other.parent.getComponent<BasePoints>(BasePoints)?.points ?? 0
                this.scene.getEntityWithName("Scoreboard")?.getComponent<ScoreComponent>(ScoreComponent)?.addScore(points);
                this.scene.addEntity(new ScoreToast(data.other.parent.transform.x, data.other.parent.transform.y, points))
                data.other.parent.destroy();
            }
        });
    }
}

class PowerBar extends Entity {
    constructor() {
        super("PowerBar", -16, -40, Layers.TRUCK);
    }
    onAdded() {
        super.onAdded();

        this.addComponent(new Sprite(this.scene.game.getResource("powerbar").textureFromIndex(0)));
        this.addComponent(new AnimatedSprite(this.scene.game.getResource("powerbar").textureSliceFromRow(0, 1, 31)));
    }
}

class Drive extends Component {
}

class Charger extends Component {
    level: number = 0;
}

class Jiggle extends Component {
    frame = 0;
}

const driveSystem = newSystem(types(Drive), (delta, entity, dr) => {
    if (MainScene.gameOver) {
        return;
    }
    entity.transform.angle = 0;
    const kb = entity.scene.game.keyboard;
    if (kb.isKeyDown(Key.KeyA)) {
        entity.transform.position.x -= delta * .10;
        entity.transform.angle = -2;
    }
    if (kb.isKeyDown(Key.KeyD)) {
        entity.transform.position.x += delta * .10;
        entity.transform.angle = 2;
    }

    entity.transform.position.x = MathUtil.clamp(entity.transform.position.x, LD58.GAME_WIDTH / 2 - 25, LD58.GAME_WIDTH / 2 + 25);
});

const jiggleSystem = newSystem(types(Sprite, Jiggle), (delta, entity, sprite, drv) => {

    drv.frame += 1;
    if (drv.frame % 5 == 0) {
        if (drv.frame % 2 == 0) {
            sprite.applyConfig({
                yOffset: 0.3
            })
        } else {
            sprite.applyConfig({
                yOffset: 0
            })
        }
    }

    if (MathUtil.randomRange(0, 100) > 90) {
        sprite.applyConfig({
            rotation: MathUtil.degToRad(Util.choose(-0.3, 0, 0.3)),
        })
    }


})


const powerSystem = newSystem(types(Charger, TextDisp), (delta, entity, power, txt) => {
    if (MainScene.gameOver) {
        return;
    }
    if (entity.scene.game.keyboard.isKeyDown(Key.Space)) {
        power.level += delta * 0.08;
    }
    if (entity.scene.game.keyboard.isKeyReleased(Key.Space)) {
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
