import {Component, newSystem, Sprite, types} from "lagom-engine";


export class Gravity extends Component
{
}

export class Phys extends Component
{
    xVel = 0;
    yVel = 0;
    rot = 0;
}

export const gravSystem = newSystem(types(Phys, Gravity), (delta, entity, phys, gravity) => {
    phys.yVel += delta * 0.3;
    // phys.yVel = MathUtil.clamp(phys.yVel, -500, 500);

    // phys.xVel = phys.xVel * delta;


    entity.transform.y += phys.yVel * delta * 0.001;
    entity.transform.x += phys.xVel * delta * 0.001;
});


export const rotSystem = newSystem(types(Phys, Sprite), (delta, entity, phys, spr) => {
    spr.applyConfig({rotation: spr.pixiObj.rotation + phys.rot * delta * 0.001});
})

