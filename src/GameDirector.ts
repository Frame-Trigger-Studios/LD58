import {Entity, MathUtil, Timer, Util, VariantSprite} from "lagom-engine";
import {Bin} from "./Bin.ts";
import {Mode7Me} from "./Scroller.ts";

export class GameDirector extends Entity
{
    constructor()
    {
        super("director");

    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new Timer(1000, null, true)).onTrigger.register((caller, data) => {
            this.scene.addEntity(new Bin(-70, 32));
            this.scene.addEntity(new Bin(70, 32));
        })

        queueTree(this);
        queueSign(this);
    }
}

function queueTree(entity: Entity)
{
    entity.addComponent(new Timer(MathUtil.randomRange(500, 1500), null, false)).onTrigger.register((caller, data) => {
        const x = Util.choose(MathUtil.randomRange(70, 100), MathUtil.randomRange(-70, -100));
        const tree = entity.scene.addEntity(new Entity("tree", x, 32));
        tree.addComponent(new VariantSprite(entity.scene.game.getResource("trees").textureSliceFromSheet(), {xAnchor: 0.5, yAnchor: 1}));
        tree.addComponent(new Mode7Me(x));
        queueTree(entity);
    })
}
function queueSign(entity: Entity)
{
    entity.addComponent(new Timer(MathUtil.randomRange(3500, 10500), null, false)).onTrigger.register((caller, data) => {
        const x = Util.choose(58, -58);
        const tree = entity.scene.addEntity(new Entity("tree", x, 32));
        tree.addComponent(new VariantSprite(entity.scene.game.getResource("signs").textureSliceFromSheet(), {xAnchor: 0.5, yAnchor: 1}));
        tree.addComponent(new Mode7Me(x, 0.5));
        queueSign(entity);
    })
}