import {Entity, MathUtil, Timer, Util, VariantSprite} from "lagom-engine";
import {Bin} from "./Bin.ts";
import {Mode7Me} from "./Scroller.ts";
import {MainScene} from "./LD58";

export class GameDirector extends Entity
{
    constructor()
    {
        super("director");

    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new Timer(1500, null, true)).onTrigger.register((caller, data) => {
            let side = Util.choose(-1, 1);
            let x = MathUtil.randomRange(30, 35);
            this.scene.addEntity(new Bin(x * side, 32));

            if (MainScene.gameOver) {
                caller.destroy();
            }
        })

        queueTree(this);
        queueSign(this);
    }
}

function queueTree(entity: Entity)
{
    entity.addComponent(new Timer(MathUtil.randomRange(250, 450), null, false)).onTrigger.register((caller, data) => {
        if (MainScene.gameOver) {
            return;
        }
        const x = Util.choose(MathUtil.randomRange(35, 80), MathUtil.randomRange(-35, -80));
        const tree = entity.scene.addEntity(new Entity("tree", x, 32));
        tree.addComponent(new VariantSprite(entity.scene.game.getResource("trees").textureSliceFromSheet(), {xAnchor: 0.5, yAnchor: 1}));
        tree.addComponent(new Mode7Me(x));
        queueTree(entity);
    })
}
function queueSign(entity: Entity)
{
    entity.addComponent(new Timer(MathUtil.randomRange(3500, 10500), null, false)).onTrigger.register((caller, data) => {
        if (MainScene.gameOver) {
            return;
        }
        const x = Util.choose(28, -28);
        const tree = entity.scene.addEntity(new Entity("tree", x, 32));
        tree.addComponent(new VariantSprite(entity.scene.game.getResource("signs").textureSliceFromSheet(), {xAnchor: 0.5, yAnchor: 1}));
        tree.addComponent(new Mode7Me(x, 0.7));
        queueSign(entity);
    })
}
