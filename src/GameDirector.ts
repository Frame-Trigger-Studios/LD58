import {Entity, MathUtil, Timer, Util, VariantSprite} from "lagom-engine";
import {Bin} from "./Bin.ts";
import {HORIZON_Y, Mode7Me} from "./Scroller.ts";
import {Layers, LD58, MainScene} from "./LD58";
import {TimerComponent, TimerDisplay} from "./Timer.ts";

export class GameDirector extends Entity {
    static spawned = 0;

    constructor() {
        super("director");
        GameDirector.spawned = 0;
    }

    onAdded() {
        super.onAdded();

        // add some trees for fun
        for (let i = 0; i < 30; i++) {
            GameDirector.spawned += 1;
            const x = Util.choose(MathUtil.randomRange(35, 80), MathUtil.randomRange(-35, -80));
            const tree = this.scene.addEntity(new Entity("tree", x, MathUtil.randomRange(40, LD58.GAME_HEIGHT - 30), Layers.BIN - 0.00001 * GameDirector.spawned));
            tree.addComponent(new VariantSprite(this.scene.game.getResource("trees").textureSliceFromSheet(), {
                xAnchor: 0.5,
                yAnchor: 1
            }));
            tree.addComponent(new Mode7Me(x));
        }

        queueBin(this);
        queueTree(this);
        queueShrub(this);
        queueSign(this);
    }
}

function queueBin(entity: Entity) {
    const time = entity.scene.getEntityWithName("gameTime")?.getComponent<TimerComponent>(TimerComponent)?.time ?? 0;

    const scalar = 1 - (TimerDisplay.GAME_TIME - time) / TimerDisplay.GAME_TIME + 0.3;

    entity.addComponent(new Timer(MathUtil.randomRange(600, 2700) * scalar, null, false)).onTrigger.register((caller, data) => {
        GameDirector.spawned += 1;
        if (MainScene.gameOver) {
            return;
        }
        let side = Util.choose(-1, 1);
        let x = MathUtil.randomRange(30, 35);
        entity.scene.addEntity(new Bin(x * side, HORIZON_Y, Layers.BIN - 0.00001 * GameDirector.spawned));


        queueBin(entity);
    })
}

function queueTree(entity: Entity) {
    entity.addComponent(new Timer(MathUtil.randomRange(250, 450), null, false)).onTrigger.register((caller, data) => {
        GameDirector.spawned += 1;
        if (MainScene.gameOver) {
            return;
        }
        const x = Util.choose(MathUtil.randomRange(35, 80), MathUtil.randomRange(-35, -80));
        const tree = entity.scene.addEntity(new Entity("tree", x, HORIZON_Y, Layers.BIN - 0.00001 * GameDirector.spawned));
        tree.addComponent(new VariantSprite(entity.scene.game.getResource("trees").textureSliceFromSheet(), {
            xAnchor: 0.5,
            yAnchor: 1
        }));
        tree.addComponent(new Mode7Me(x));
        queueTree(entity);
    })
}

function queueShrub(entity: Entity) {
    entity.addComponent(new Timer(MathUtil.randomRange(250, 450), null, false)).onTrigger.register((caller, data) => {
        GameDirector.spawned += 1;
        if (MainScene.gameOver) {
            return;
        }
        const x = Util.choose(MathUtil.randomRange(30, 80), MathUtil.randomRange(-30, -80));
        const shrub = entity.scene.addEntity(new Entity("shrub", x, HORIZON_Y, Layers.BIN - 0.00001 * GameDirector.spawned));
        shrub.addComponent(new VariantSprite(entity.scene.game.getResource("shrubs").textureSliceFromSheet(), {
            xAnchor: 0.5,
            yAnchor: 1
        }));
        shrub.addComponent(new Mode7Me(x));
        queueShrub(entity);
    })
}

function queueSign(entity: Entity) {
    entity.addComponent(new Timer(MathUtil.randomRange(2000, 6000), null, false)).onTrigger.register((caller, data) => {
        GameDirector.spawned += 1;
        if (MainScene.gameOver) {
            return;
        }
        const x = Util.choose(28, -28);
        const tree = entity.scene.addEntity(new Entity("sign", x, HORIZON_Y, Layers.BIN - 0.00001 * GameDirector.spawned));
        tree.addComponent(new VariantSprite(entity.scene.game.getResource("signs").textureSliceFromSheet(), {
            xAnchor: 0.5,
            yAnchor: 1
        }));
        tree.addComponent(new Mode7Me(x, 0.7));
        queueSign(entity);
    })
}
