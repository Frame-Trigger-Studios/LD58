import {Entity, TextDisp} from "lagom-engine";

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
