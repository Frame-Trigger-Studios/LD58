import {Entity, RenderRect, TextDisp} from "lagom-engine";
import {LD58} from "./LD58";

export async function submitScore(name, score) {
    const secret = "lol_this_is_very_secure_obviously";
    const hash = await sha256(score + secret);

    await fetch("https://quackqack.pythonanywhere.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score, hash })
    });
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function getScores() {
    return await fetch("https://quackqack.pythonanywhere.com/leaderboard");
}

export class HighScores extends Entity {

    constructor(x: number, y: number, depth: number) {
        super("highscores", x, y, depth);
    }


    onAdded() {
        super.onAdded();

        this.addComponent(new RenderRect(0, 0, LD58.GAME_WIDTH - 40, LD58.GAME_HEIGHT - 20, 0x112233, 0x112233));
        this.addComponent(new TextDisp(25, 2, "HighScores", {
            fontFamily: "retro",
            fill: 0xffffff,
            fontSize: 8
        }));

        getScores().then(value => {
            value.json().then((v: any[]) => {
                const scores = v.slice(0, 6);
                let yoff = 15
                scores.forEach(score => {
                    this.addComponent(new TextDisp(5, yoff, score["name"], {
                        fontFamily: "retro",
                        fill: 0xffffff,
                        fontSize: 8
                    }));

                    this.addComponent(new TextDisp(LD58.GAME_WIDTH/2 - 10, yoff, score["score"], {
                        fontFamily: "retro",
                        fill: 0xffffff,
                        fontSize: 8
                    }));

                    yoff += 10;
                })
            });

        })

    }
}
