import {Entity, Timer} from "lagom-engine";
import {Bin} from "./Bin.ts";

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
            this.scene.addEntity(new Bin( 70, 32));
        })
    }
}