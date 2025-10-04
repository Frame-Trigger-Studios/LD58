import {
    ActionOnPress,
    AudioAtlas,
    CollisionMatrix, Component,
    DiscreteCollisionSystem,
    Entity,
    FrameTriggerSystem,
    Game,
    Log,
    LogLevel,
    newSystem,
    Scene,
    Sprite,
    SpriteSheet,
    TextDisp,
    Timer,
    TimerSystem, types
} from 'lagom-engine';
import WebFont from 'webfontloader';
import muteButtonSpr from "./art/mute_button.png";
import binSpr from "./art/bin.png";
import background from "./art/background.png";
import truckSpr from "./art/truck.png";
import roadLineSpr from "./art/road-line.png";
import flipper from "./art/flipper.png";
import signSpr from "./art/sign-roo.png";
import treeSpr from "./art/tree.png";
import {SoundManager} from "./util/SoundManager";
import {Truck} from "./Truck.ts";
import {gravSystem, rotSystem} from "./Physics.ts";
import {Score} from "./Score.ts";
import {Mode7Me, mode7System} from "./Scroller.ts";
import {GameDirector} from "./GameDirector.ts";
import {TimerDisplay} from "./Timer";


export enum Layers
{
    BACKGROUND,
    ROAD_LINE,
    FLIPPER,
    TRUCK,
    BIN,
    TRASH,
    SOLIDS
}

const collisions = new CollisionMatrix();
collisions.addCollision(Layers.FLIPPER, Layers.BIN);
collisions.addCollision(Layers.TRASH, Layers.BIN);

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
        this.addGUIEntity(new Score(2, 2, 0));
        this.addGUIEntity(new TimerDisplay(LD58.GAME_WIDTH - 60, 2, 0))
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new FrameTriggerSystem());

        this.addFixedFnSystem(gravSystem)
        this.addFnSystem(rotSystem)
        this.addFnSystem(mode7System)
        MainScene.collSystem = this.addGlobalSystem(new DiscreteCollisionSystem(collisions));

        this.addEntity(new Truck());
        this.addEntity(new GameDirector());


        // @ts-ignore
        this.addFixedFnSystem(newSystem(types(Component), (delta, entity, _) => {
            if (entity.transform.y > LD58.GAME_HEIGHT + 100)
            {
                entity.destroy();
            }
        }))


        const road = this.addEntity(new Entity("road", 0, 0, Layers.ROAD_LINE));
        road.addComponent(new Timer(500, null, true)).onTrigger.register((caller, data) => {
            const roadLine = caller.parent.scene.addEntity(new Entity("roadline", LD58.GAME_WIDTH / 2, 32, Layers.ROAD_LINE));
            roadLine.addComponent(new Sprite(caller.parent.scene.game.getResource("road_line").textureFromIndex(0),
                {xAnchor: 0.5}));
            roadLine.addComponent(new Mode7Me(0));
        })

        // this.addGUIEntity(new Entity("main scene")).addComponent(new TextDisp(100, 10, "MAIN SCENE", {
        //     fontFamily: "pixeloid",
        //     fill: 0xffffff
        // }));

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
        this.addResource("bin", new SpriteSheet(binSpr, 13, 17));
        this.addResource("truck", new SpriteSheet(truckSpr, 44, 51))
        this.addResource("background", new SpriteSheet(background, 160, 100));
        this.addResource("trees", new SpriteSheet(treeSpr, 50, 44));
        this.addResource("signs", new SpriteSheet(signSpr, 20, 56));
        this.addResource("flipper", new SpriteSheet(flipper, 30, 7));
        this.addResource("road_line", new SpriteSheet(roadLineSpr, 2, 8));

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
