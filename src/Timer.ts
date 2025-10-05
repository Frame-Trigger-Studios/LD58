import {Entity, SysFn, System, TextDisp, Timer} from "lagom-engine";
import {mode7System} from "./Scroller";
import {Score, ScoreComponent} from "./Score";
import {HighScores, submitScore} from "./HighScores";
import {MainScene, TEXT_COLOUR} from "./LD58";

export class TimerComponent extends TextDisp {

    constructor(xOff: number, yOff: number, private time: number) {
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
    }


    onAdded() {
        super.onAdded();
        this.addComponent(new TextDisp(0, 0, "Time: ", {
            fontFamily: "retro",
            fill: TEXT_COLOUR,
            fontSize: 8,
        }));
        const time = this.addComponent(new TimerComponent(35, 0, 99));
        this.addComponent(new Timer(1000, time, true)).onTrigger.register((caller, data) => {
            data.decrement();

            if (data.finished()) {
                caller.repeat = false;
                MainScene.gameOver = true;

                const score = this.scene.getEntityWithName<Score>("Scoreboard")?.getComponent<ScoreComponent>(ScoreComponent)?.score;
                if (score <= 0) {
                    return;
                }
                submitScore("test", score).then(value => {
                        // show highscores
                        this.scene.addGUIEntity(new HighScores(20, 10, 1))
                    },
                    value => {}
                );
            }
        });
    }
}
