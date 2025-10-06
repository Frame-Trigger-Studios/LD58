import {
    ActionOnPress,
    AnimatedSprite,
    AudioAtlas,
    CollisionMatrix,
    Component,
    DiscreteCollisionSystem,
    Entity,
    FrameTriggerSystem,
    Game,
    Log,
    LogLevel,
    newSystem,
    Scene,
    ScreenShaker,
    Sprite,
    SpriteSheet,
    Timer,
    TimerSystem,
    types
} from 'lagom-engine';
import WebFont from 'webfontloader';
import startScreenSpr from "./art/start-screen.png";
import binChickenSpr from "./art/bin-chicken.png";
import tutorialTextSpr from "./art/tutorial.png";
import muteButtonSpr from "./art/mute_button.png";
import binSpr from "./art/bin.png";
import background from "./art/background.png";
import truckSpr from "./art/truck.png";
import roadLineSpr from "./art/road-line.png";
import flipper from "./art/flipper.png";
import signSpr from "./art/signs.png";
import treeSpr from "./art/tree.png";
import shrubSpr from "./art/shrubs.png";
import trashSpr from "./art/trash.png";
import powerSpr from "./art/power-bar.png";
import musicTrack from "./audio/music.mp3";
import {SoundManager} from "./util/SoundManager";
import {DadTruck} from "./Truck.ts";
import {gravSystem, rotSystem} from "./Physics.ts";
import {Score, toastUp} from "./Score.ts";
import {Mode7Me, mode7System} from "./Scroller.ts";
import {GameDirector} from "./GameDirector.ts";
import {TimerDisplay} from "./Timer";
import {trashSpawnSystem} from "./Bin.ts";


export enum Layers {
    BACKGROUND,
    ROAD_LINE,
    FLIPPER,
    BIN,
    TRUCK,
    AIR_ITEM,
    TOAST
}

export const TEXT_COLOUR = 0x655057;
export const LIGHT_TEXT_COLOUR = 0xf6edcd;


const collisions = new CollisionMatrix();
collisions.addCollision(Layers.FLIPPER, Layers.BIN);
collisions.addCollision(Layers.AIR_ITEM, Layers.TRUCK);

class TitleScene extends Scene {
    onAdded() {
        super.onAdded();

        this.addGUIEntity(new SoundManager());
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new FrameTriggerSystem());

        this.addGUIEntity(new Entity("bg")).addComponent(new Sprite(this.game.getResource("start_screen").texture(0, 0)));

        this.addGUIEntity(new Entity("chicken", 4, 61)).addComponent(new AnimatedSprite(
            this.game.getResource("bin_chicken").textureSliceFromSheet(), {animationSpeed: 500}
        ));

        this.addSystem(new ActionOnPress(() => {
            this.game.setScene(new MainScene(this.game))
        }));
    }
}


export class MainScene extends Scene {
    static collSystem: DiscreteCollisionSystem;
    // Bad (I cant work out how to destroy a functional system).
    static gameOver: boolean = false;

    constructor(game: Game) {
        super(game);

        // Reset statics. I should make a better way of doing this.
        MainScene.gameOver = false;
    }

    onAdded() {
        super.onAdded();

        this.addGUIEntity(new SoundManager());
        this.addGUIEntity(new Score(4, 2, 0));
        this.addGUIEntity(new TimerDisplay(LD58.GAME_WIDTH - 52.5, 2, 0))
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new FrameTriggerSystem());
        this.addGlobalSystem(new ScreenShaker(LD58.GAME_WIDTH / 2, LD58.GAME_HEIGHT / 2));

        this.addFixedFnSystem(gravSystem)
        this.addFnSystem(rotSystem)
        this.addFnSystem(mode7System)
        this.addFnSystem(trashSpawnSystem)
        this.addFnSystem(toastUp)

        MainScene.collSystem = this.addGlobalSystem(new DiscreteCollisionSystem(collisions));

        this.addEntity(new DadTruck());
        this.addEntity(new GameDirector());

        // @ts-ignore
        this.addFixedFnSystem(newSystem(types(Component), (delta, entity, _) => {
            if (entity.transform.y > LD58.GAME_HEIGHT + 100)
            {
                entity.destroy();
            }
        }))

        // Add some lines so it isn't empty to start
        for (let i = 0; i < 30; i++) {
            const roadLine = this.addEntity(new Entity("roadline", LD58.GAME_WIDTH / 2, 32 + 1 + i * 10 * 0.9, Layers.ROAD_LINE));
            roadLine.addComponent(new Sprite(this.game.getResource("road_line").textureFromIndex(0),
                {xAnchor: 0.5}));
            roadLine.addComponent(new Mode7Me(0));
        }

        const road = this.addEntity(new Entity("road", 0, 0, Layers.ROAD_LINE));
        road.addComponent(new Timer(500, null, true)).onTrigger.register((caller, data) => {
            if (MainScene.gameOver) {
                caller.destroy();
                return;
            }
            const roadLine = caller.parent.scene.addEntity(new Entity("roadline", LD58.GAME_WIDTH / 2, 32 + 1, Layers.ROAD_LINE));
            roadLine.addComponent(new Sprite(caller.parent.scene.game.getResource("road_line").textureFromIndex(0),
                {xAnchor: 0.5}));
            roadLine.addComponent(new Mode7Me(0));
        })

        const tutorial = this.addGUIEntity(new Entity("Tutorial", 0, 0));
        tutorial.addComponent(new AnimatedSprite(this.game.getResource("tutorial").textureSliceFromSheet(),
            {animationSpeed: 3000}));
        tutorial.addComponent(new Timer(14999, null, true)).onTrigger.register((caller, data) => {
            caller.parent.destroy();
        })

        const background = this.addEntity(new Entity("background", 0, 0, Layers.BACKGROUND));
        background.addComponent(new Sprite(this.game.getResource("background").texture(0, 0)));
    }
}

export class LD58 extends Game {
    static GAME_WIDTH = 160;
    static GAME_HEIGHT = 100;

    static muted = false;
    static musicPlaying = false;
    static audioAtlas: AudioAtlas = new AudioAtlas();

    constructor() {
        super({
            width: LD58.GAME_WIDTH,
            height: LD58.GAME_HEIGHT,
            resolution: 6,
            backgroundColor: 0xa8c8a6
        });

        // Set the global log level
        Log.logLevel = LogLevel.NONE;

        this.addResource("start_screen", new SpriteSheet(startScreenSpr, 160, 100));
        this.addResource("bin_chicken", new SpriteSheet(binChickenSpr, 33, 32));
        this.addResource("tutorial", new SpriteSheet(tutorialTextSpr, 160, 100));
        this.addResource("mute_button", new SpriteSheet(muteButtonSpr, 16, 16));
        this.addResource("bin", new SpriteSheet(binSpr, 13, 17));
        this.addResource("truck", new SpriteSheet(truckSpr, 44, 51))
        this.addResource("powerbar", new SpriteSheet(powerSpr, 32, 7))
        this.addResource("background", new SpriteSheet(background, 160, 100));
        this.addResource("trees", new SpriteSheet(treeSpr, 50, 44));
        this.addResource("shrubs", new SpriteSheet(shrubSpr, 50, 44));
        this.addResource("signs", new SpriteSheet(signSpr, 20, 56));
        this.addResource("flipper", new SpriteSheet(flipper, 30, 7));
        this.addResource("trash", new SpriteSheet(trashSpr, 8, 8));
        this.addResource("road_line", new SpriteSheet(roadLineSpr, 2, 8));

        // Load an empty scene while we async load the resources for the main one
        this.setScene(new Scene(this));

        // Import sounds and set their properties
        const music = LD58.audioAtlas.load("music", musicTrack);
        music.loop = true;
        music.volume = 0.3;

        // Import fonts. See index.html for examples of how to add new ones.
        const fonts = new Promise<void>((resolve, _) => {
            WebFont.load({
                custom: {
                    families: ["pixeloid", "retro"]
                },
                active() {
                    resolve();
                }
            });
        });

        // Wait for all resources to be loaded and then start the main scene.
        Promise.all([fonts, this.resourceLoader.loadAll()]).then(
            () => {
                this.setScene(new TitleScene(this));
            }
        )

    }
}
