import {Component, newSystem, Sprite, types} from "lagom-engine";
import {LD58, MainScene} from "./LD58.ts";

export class Mode7Me extends Component {
    constructor(readonly startX: number, readonly scale: number = 1) {
        super();
    }
}

export const mode7System = newSystem(types(Mode7Me, Sprite), (delta, entity, m, spr) => {

    if (MainScene.gameOver) {
        return;
    }

    const HORIZON_Y = 32;
    const TARGET_Y = HORIZON_Y + 0.8 * (LD58.GAME_HEIGHT - HORIZON_Y);
    const depth = (entity.transform.y - HORIZON_Y) / (TARGET_Y - HORIZON_Y);

    const xOffset = m.startX;
    // const xOffset = LD58.GAME_WIDTH / 2 - m.startX;


    // add the % we want at the horizon line
    const scale = 0.1 + 0.9 * Math.tanh(depth);

    entity.transform.y += delta * 0.05 * scale;


    // figure out offset based on centre?
    const offsetRatio = xOffset / (52 / 2);
    const roadWidth = 52 + (96 - 52) * depth;
    const xPos = (LD58.GAME_WIDTH / 2) + offsetRatio * (roadWidth / 2);


    entity.transform.x = xPos;

    let image_scale = scale * m.scale;

    spr.applyConfig({xScale: image_scale, yScale: image_scale})
    //
    // const height = entity.transform.position.y;
    //
    // let scale_factor = 0.3 + (height / 100) * (1.0 - 0.3)
    // scale_factor = Math.pow(scale_factor, 2);
    //
    // const t = (LD58.GAME_HEIGHT - 32) / 100;
    // const x = LD58.GAME_WIDTH / 2 + m.startX * (1 + (scale_factor - 1) * t);
    //
    //
    // entity.transform.y += delta * 0.05 * scale_factor;
    // entity.transform.x = x;

})
