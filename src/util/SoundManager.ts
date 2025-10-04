import {AnimatedSpriteController, Button, Component, CType, Entity, Key, System, Timer} from "lagom-engine";

import {LD58} from "../LD58.ts";

class MuteComp extends Component {
}

class MuteListener extends System<[AnimatedSpriteController, MuteComp]> {
    types: [CType<AnimatedSpriteController>, CType<MuteComp>] = [AnimatedSpriteController, MuteComp];

    runOnEntities(delta: number, e: Entity, spr: AnimatedSpriteController, args_1: MuteComp): void {
        if (this.scene.game.mouse.isButtonPressed(Button.LEFT)) {
            const pos = e.scene.game.renderer.plugins.interaction.mouse.global;

            if (pos.x >= LD58.GAME_WIDTH - 24 && pos.x <= LD58.GAME_WIDTH - 8 && pos.y >= LD58.GAME_HEIGHT - 24 && pos.y <= LD58.GAME_HEIGHT - 8) {
                (e.scene.getEntityWithName("audio") as SoundManager).toggleMute();
                spr.setAnimation(Number(LD58.muted));
            }
        } else if (this.scene.game.keyboard.isKeyPressed(Key.KeyM)) {
            (e.scene.getEntityWithName("audio") as SoundManager).toggleMute();
            spr.setAnimation(Number(LD58.muted));
        }
    }
}

export class SoundManager extends Entity {
    constructor() {
        super("audio", LD58.GAME_WIDTH - 16 - 2, LD58.GAME_HEIGHT - 20, 0);
        this.startMusic();
    }

    onAdded(): void {
        super.onAdded();

        this.addComponent(new MuteComp());
        const spr = this.addComponent(new AnimatedSpriteController(Number(LD58.muted), [
            {
                id: 0,
                textures: [this.scene.game.getResource("mute_button").texture(0, 0, 16, 16)]
            }, {
                id: 1,
                textures: [this.scene.game.getResource("mute_button").texture(1, 0, 16, 16)]
            }]));

        this.addComponent(new Timer(50, spr, false)).onTrigger.register((caller, data) => {
            data.setAnimation(Number(LD58.muted));
        });

        this.scene.addSystem(new MuteListener());
    }

    toggleMute() {
        LD58.muted = !LD58.muted;

        if (LD58.muted) {
            this.stopAllSounds();
        } else {
            this.startMusic();
        }
    }

    startMusic() {
        if (!LD58.muted && !LD58.musicPlaying) {
            LD58.audioAtlas.play("music");
            LD58.musicPlaying = true;
        }
    }

    stopAllSounds(music = true) {
        if (music) {
            LD58.audioAtlas.sounds.forEach((v: any, k: string) => v.stop());
            LD58.musicPlaying = false;
        } else {
            LD58.audioAtlas.sounds.forEach((v: any, k: string) => {
                if (k !== "music") v.stop();
            });
        }
    }

    onRemoved(): void {
        super.onRemoved();
        this.stopAllSounds(false);
    }

    playSound(name: string, restart = false) {
        if (!LD58.muted) {
            if (LD58.audioAtlas.sounds.get(name)?.isPlaying && !restart) return;
            LD58.audioAtlas.play(name);
        }
    }

    stopSound(name: string) {
        LD58.audioAtlas.sounds.forEach((value, key) => {
            if (key === name) {
                value.stop();
            }
        })
    }
}
