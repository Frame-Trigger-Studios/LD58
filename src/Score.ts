import {Component, Entity, newSystem, TextDisp, Timer, types} from "lagom-engine";
import {Layers} from "./LD58.ts";

export class BasePoints extends Component {
    constructor(readonly points: number) {
        super();
    }
}

class MoveUp extends Component {}

export const toastUp = newSystem(types(TextDisp, MoveUp), (delta, entity, txt, _) => {
    entity.transform.y -= delta * 0.025;
    txt.pixiObj.alpha -= delta * 0.001;
})

export class ScoreToast extends Entity {
    constructor(x: number, y: number, readonly points: number) {
        super("scoretoast", x, y, Layers.TOAST);
    }

    onAdded() {
        super.onAdded();

        this.addComponent(new TextDisp(0, 0, `+${this.points}`, {
            fontFamily: "retro",
            fill: 0xffffff,
            fontSize: 4
        }))
        this.addComponent(new MoveUp());
        this.addComponent(new Timer(1000, null)).onTrigger.register(caller => caller.parent.destroy());
    }
}

export class ScoreComponent extends TextDisp {

    constructor(xOff: number, yOff: number, public score: number) {
        super(xOff, yOff, score.toString(), {
            fontFamily: "retro",
            fill: 0xffffff,
            fontSize: 8
        });
    }

    addScore(points: number) {
        this.score += points;
        this.pixiObj.text = this.score;
    }

    removeScore(points: number) {
        this.score -= points;
        this.pixiObj.text = this.score;
    }

    resetScore() {
        this.score = 0;
        this.pixiObj.text = this.score;
    }
}

export class Score extends Entity {
    constructor(x: number, y: number, depth: number) {
        super("Scoreboard", x, y, depth);
    }


    onAdded() {
        super.onAdded();

        this.addComponent(new TextDisp(0, 0, "Score: ", {
            fontFamily: "retro",
            fill: 0xffffff,
            fontSize: 8
        }));
        this.addComponent(new ScoreComponent(40, 0, 0));
    }
}
