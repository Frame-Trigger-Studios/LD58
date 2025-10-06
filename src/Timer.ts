import {Entity, TextDisp, Timer} from "lagom-engine";
import {Score, ScoreComponent} from "./Score";
import {getScores, HighScores, SubmitScore} from "./HighScores";
import {MainScene, TEXT_COLOUR} from "./LD58";

export class TimerComponent extends TextDisp {

    constructor(xOff: number, yOff: number, public time: number) {
        super(xOff, yOff, time.toString(), {
            fontFamily: "retro",
            fill: TEXT_COLOUR,
            fontSize: 8
        });
    }

    decrement() {
        this.time -= 1;
        this.pixiObj.text = this.time;
    }

    finished() {
        return this.time == 0;
    }
}

export class TimerDisplay extends Entity {

    constructor(x: number, y: number, depth: number) {
        super("gameTime", x, y, depth);

        TimerDisplay.GAME_TIME = 99;
    }

    static GAME_TIME = 99;

    onAdded() {
        super.onAdded();
        this.addComponent(new TextDisp(0, 0, "Time: ", {
            fontFamily: "retro",
            fill: TEXT_COLOUR,
            fontSize: 8,
        }));
        const time = this.addComponent(new TimerComponent(35, 0, TimerDisplay.GAME_TIME));
        this.addComponent(new Timer(1000, time, true)).onTrigger.register((caller, data) => {
            data.decrement();

            if (data.finished()) {
                caller.repeat = false;
                MainScene.gameOver = true;

                const score = this.scene.getEntityWithName<Score>("Scoreboard")?.getComponent<ScoreComponent>(ScoreComponent)?.score ?? 0;

                getScores().then(resp => {
                    if (resp === null || (resp.length == 10 && score < resp[9].score)) {
                        this.scene.addGUIEntity(new HighScores(score, true))
                    } else {
                        // new high score
                        this.scene.addGUIEntity(new SubmitScore(score));
                    }
                })
            }
        });
    }
}
