import {Component, Entity, newSystem, RenderRect, TextDisp, types} from "lagom-engine";
import {LD58} from "./LD58";

export async function submitScore(name: string, score: number) {
    const secret = "lol_this_is_very_secure_obviously";
    const hash = await sha256(score + secret);

    try {
        const resp = await fetch("https://quackqack.pythonanywhere.com/submit", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, score, hash})
        });
        return resp.ok
    } catch (e) {
        return false;
    }
}

async function sha256(message: string) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function getScores(): Promise<Score[] | null> {
    try {
        const resp = await fetch("https://quackqack.pythonanywhere.com/leaderboard");
        if (!resp.ok) {
            return null;
        }
        return resp.json().then(data => data.slice(0, 10));
    } catch (error) {
        return null;
    }
}

interface Score {
    name: string,
    score: number
}

class NameComp extends Component {
    letters: string[] = ["_", "_", "_"];
    index: number = 0;
}

class RenderName extends TextDisp {
}

export class SubmitScore extends Entity {
    constructor(readonly score: number) {
        super("submitter", LD58.GAME_WIDTH / 2, 0);
    }

    onAdded() {
        super.onAdded();

        this.addComponent(new RenderRect(-40, 15, 80, LD58.GAME_HEIGHT - 30, 0x3f5e5c, 0x6d8d8a));

        this.addComponent(new TextDisp(0, 20, "New High Score!", {
            fontFamily: "retro",
            fill: 0xf6edcd,
            fontSize: 7
        })).pixiObj.anchor.set(0.5);


        this.addComponent(new TextDisp(0, 40, "Enter Name", {
            fontFamily: "retro",
            fill: 0xf6edcd,
            fontSize: 6
        })).pixiObj.anchor.set(0.5);

        this.addComponent(new RenderName(0, 50, "___", {
            fontFamily: "retro",
            fill: 0xf6edcd,
            fontSize: 8
        })).pixiObj.anchor.set(0.5);

        this.addComponent(new TextDisp(0, 75, "Press Space\n to Submit", {
            fontFamily: "retro",
            fill: 0xf6edcd,
            fontSize: 6
        })).pixiObj.anchor.set(0.5);

        const nameComp = this.addComponent(new NameComp());

        const updateName = (e: KeyboardEvent) => {
            const key = e.key;

            if (/^[a-zA-Z0-9]$/.test(key) && nameComp.index < 3) {
                nameComp.letters[nameComp.index] = key;
                nameComp.index = (nameComp.index + 1) % 4;
            } else if (key === 'Backspace') {
                nameComp.index = (nameComp.index - 1 + nameComp.letters.length) % 3;
                nameComp.letters[nameComp.index] = '_';
            } else if (key === ' ' && nameComp.index == 3) {
                submitScore(nameComp.letters.join(''), this.score).then(success => {
                    document.removeEventListener("keydown", updateName);
                    this.destroy();
                    this.scene.addGUIEntity(new HighScores(this.score, success));
                })
            }
        }

        document.addEventListener("keydown", updateName);

        this.scene.addFnSystem(newSystem(types(NameComp, RenderName), (delta, entity, name, txt) => {
            txt.pixiObj.text = name.letters.join('');
        }));
    }
}

export class HighScores extends Entity {

    constructor(readonly score: number, readonly submitSuccess: boolean) {
        super("highscores", LD58.GAME_WIDTH / 2, 0);
    }

    onAdded() {
        super.onAdded();

        this.addComponent(new RenderRect(-40, 5, 80, LD58.GAME_HEIGHT - 10, 0x3f5e5c, 0x6d8d8a));
        this.addComponent(new TextDisp(0, 10, "HighScores", {
            fontFamily: "retro",
            fill: 0xf6edcd,
            fontSize: 7
        })).pixiObj.anchor.set(0.5);

        this.addComponent(new TextDisp(0, 85, `Your Score: ${this.score}`, {
            fontFamily: "retro",
            fill: 0xf6edcd,
            fontSize: 5
        })).pixiObj.anchor.set(0.5);

        if (!this.submitSuccess) {
            this.addComponent(new TextDisp(0, 78, "Failed to submit score", {
                fontFamily: "retro",
                fill: 0xf6edcd,
                fontSize: 3
            })).pixiObj.anchor.set(0.5);
        }

        getScores().then(scores => {

            if (scores === null) {
                this.addComponent(new TextDisp(0, 40, "Error\nFetching Scores", {
                    fontFamily: "retro",
                    fill: 0xf6edcd,
                    align: "center",
                    fontSize: 5,
                })).pixiObj.anchor.set(0.5);
                return;
            }

            let yoff = 20
            scores.forEach(score => {
                this.addComponent(new TextDisp(-35, yoff, score.name, {
                    fontFamily: "retro",
                    fill: 0xf6edcd,
                    fontSize: 5
                }));

                this.addComponent(new TextDisp(5, yoff, score.score.toString(), {
                    fontFamily: "retro",
                    align: "left",

                    fill: 0xf6edcd,
                    fontSize: 5
                }));

                yoff += 5;
            })
        });
    }
}
