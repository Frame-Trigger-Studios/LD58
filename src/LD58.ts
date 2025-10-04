import {
    ActionOnPress,
    AudioAtlas,
    CollisionMatrix,
    DiscreteCollisionSystem,
    Entity,
    FrameTriggerSystem,
    Game,
    Log,
    LogLevel,
    Scene, Sprite,
    SpriteSheet,
    TextDisp,
    TimerSystem
} from 'lagom-engine';
import WebFont from 'webfontloader';
import muteButtonSpr from "./art/mute_button.png";
import binSpr from "./art/bin.png";
import background from "./art/background.png";
import truckSpr from "./art/truck.png";
import {SoundManager} from "./util/SoundManager";
import {Truck} from "./Truck.ts";
import {gravSystem, rotSystem} from "./Physics.ts";


export enum Layers
{
    BACKGROUND,
    TRUCK,
    FLIPPER,
    BIN,
    TRASH,
    SOLIDS
}

const collisions = new CollisionMatrix();
collisions.addCollision(Layers.FLIPPER, Layers.BIN);

class TitleScene extends Scene
{
    onAdded()
    {
        super.onAdded();

        this.addGUIEntity(new SoundManager());
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new FrameTriggerSystem());

        this.addGUIEntity(new Entity("title")).addComponent(new TextDisp(100, 10, "GAME NAME", {
            fontFamily: "retro",
            fill: 0xffffff
        }));

        this.addSystem(new ActionOnPress(() => {
            this.game.setScene(new MainScene(this.game))
        }));
    }
}



export class MainScene extends Scene
{
    static collSystem: DiscreteCollisionSystem;

    onAdded()
    {
        super.onAdded();

        this.addGUIEntity(new SoundManager());
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new FrameTriggerSystem());

        this.addFixedFnSystem(gravSystem)
        this.addFnSystem(rotSystem)

        this.addEntity(new Truck());

        MainScene.collSystem = this.addGlobalSystem(new DiscreteCollisionSystem(collisions));

        this.addGUIEntity(new Entity("main scene")).addComponent(new TextDisp(100, 10, "MAIN SCENE", {
            fontFamily: "pixeloid",
            fill: 0xffffff
        }));

        const background = this.addEntity(new Entity("background", 0, 0, Layers.BACKGROUND));
        background.addComponent(new Sprite(this.game.getResource("background").texture(0, 0)));
    }
}

export class LD58 extends Game
{
    static GAME_WIDTH = 160;
    static GAME_HEIGHT = 100;

    static muted = false;
    static musicPlaying = false;
    static audioAtlas: AudioAtlas = new AudioAtlas();

    constructor()
    {
        super({
            width: LD58.GAME_WIDTH,
            height: LD58.GAME_HEIGHT,
            resolution: 6,
            backgroundColor: 0x200140
        });

        // Set the global log level
        Log.logLevel = LogLevel.WARN;

        this.addResource("mute_button", new SpriteSheet(muteButtonSpr, 16, 16));
        this.addResource("bin", new SpriteSheet(binSpr, 10, 10));
        this.addResource("truck", new SpriteSheet(truckSpr, 44, 51))
        this.addResource("background", new SpriteSheet(background, 160, 100))

        // Load an empty scene while we async load the resources for the main one
        this.setScene(new Scene(this));

        // Import sounds and set their properties
        // const music = LD58.audioAtlas.load("music", "ADD_ME")
        //     .loop(true)
        //     .volume(0.3);

        // Import fonts. See index.html for examples of how to add new ones.
        const fonts = new Promise<void>((resolve, _) => {
            WebFont.load({
                custom: {
                    families: ["pixeloid", "retro"]
                },
                active()
                {
                    resolve();
                }
            });
        });

        // Wait for all resources to be loaded and then start the main scene.
        Promise.all([fonts, this.resourceLoader.loadAll()]).then(
            () => {
                this.setScene(new MainScene(this));
            }
        )

    }
}
