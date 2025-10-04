import {Component, newSystem, Sprite, types} from "lagom-engine";
import {LD58} from "./LD58.ts";

export class Mode7Me extends Component
{
    constructor(readonly startX: number)
    {
        super();
    }
}

export const mode7System = newSystem(types(Mode7Me, Sprite), (delta, entity, m, spr) => {

    const height = entity.transform.position.y;

    let scale_factor = 0.3 + (height / 100) * (1.0 - 0.3)
    scale_factor = Math.pow(scale_factor, 2);

    const t = (LD58.GAME_HEIGHT - 32) / 100;
    const x = LD58.GAME_WIDTH / 2 + m.startX * (1 + (scale_factor - 1) * t);


    entity.transform.y += delta * 0.05 * scale_factor;
    entity.transform.x = x;

    spr.applyConfig({xScale: scale_factor, yScale: scale_factor})
})
