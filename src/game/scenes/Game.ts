import { Scene } from 'phaser';
import addWorld from './GameImpls/World'
import addControllables from './GameImpls/Controllables'
import { Item, itemKeys, repelItems } from './GameImpls/Item';
import addCart from './GameImpls/Cart';
import addAudio, { phaserAudio } from './GameImpls/Audio';
import addUI from './GameImpls/UI';
import addPlayer from './GameImpls/Player';
import { addDialogue } from './GameImpls/dialogue';

class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;

    fpsText: Phaser.GameObjects.Text;


    items: Set<Item> = new Set()
    itemsGroup: Phaser.Physics.Arcade.Group;
    hiddenItems: Set<Item> = new Set()
    trashCans: Phaser.Physics.Arcade.Group;
    bouncers: Phaser.Physics.Arcade.Group;
    doors: Phaser.Physics.Arcade.Group;
    constructor (){
        super('Game');
    }
    
    loadSimpleBgAssets(){}
    loadPlayer(){}
    loadMap(){}
    loadItems(){}
    loadCart(){}
    loadInteractables(){}
    loadUIAssets(){}
    loadDecor(){}
    loadKen(){}

    craftSound: phaserAudio
    cartSound: phaserAudio

    themes: Array<phaserAudio> = []

    preload(){
        this.loadSimpleBgAssets()
        this.loadPlayer()
        this.loadMap()
        this.loadItems()
        this.loadCart()
        this.loadInteractables()
        this.loadDecor()
        this.loadUIAssets()
        this.loadKen()
    }


    walls: Phaser.Tilemaps.TilemapLayer;
    player:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

    myMap: Phaser.Tilemaps.Tilemap
    tileset: Phaser.Tilemaps.Tileset

    amy: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

    createSimpleBgAssets(){}
    createPlayer(){}
    createMap(){}
    createCamera(){}
    createInteractions(){}
    createItems(){}
    createCart(){}
    createInteractables(){}
    createDecor(){}

    // @ts-ignore
    createItem(x:number, y:number, key:itemKeys):Item{
        return Item.createFromKey(this,0,0,itemKeys.can)
    }

    createAudio(){}

    cart:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    cartIsHeld: boolean = false;
    
    //@ts-ignore
    showPopup(message: string, x, y, width, height, duration = 2000, fontSize: number, name:string, callback?:Function) {}

    createMagicBeams(){}
    updateMagicBeams(){}

    restartB:Phaser.GameObjects.Text;
    createRestartB(){}

    createKen(){}

    create (){
        //defined in world.ts
        this.createSimpleBgAssets()
        this.createMap()
        this.createCamera()
        
        //defined in player.ts
        this.createPlayer()
        //between player, platrforms, items, and worldborder
        this.createInteractions()

        this.createCart()

        this.createItems()

        this.createInteractables()

        this.createAudio()

        this.createDecor()

        // this.showPopup("Welcome brave adventurer!", 10, 10, 300, 100, 3000, 30, "test name")
        this.showPopup("Crackpot alchemy balls", 
            10, this.camera.height - 210, this.camera.width - 20, 200, 3000, 30, "name2")
        
        this.createMagicBeams()
        this.createRestartB();
        this.createKen();
    }


    controlItems(){}
    movePlayer(){}
    logTile(){}

    // @ts-ignore
    repelItems(items: Set<Item>, repulsionRadius: number, strength: number){} // @ts-ignore
    getAverageRayToWall(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): Phaser.Math.Vector2 {throw new Error("Not implemented")} // @ts-ignore
    checkIfItemBehindWall(item: any, buffer: number = 8): boolean {throw new Error("Not implemented")}

    cartMovement(){}
    cartIsOccluded(): boolean { return false }
    updateCartFrame(){}

    //@ts-ignore
    showDialogue(name:string|Array<string>, words:Array<string>, interpret?:Array<string>,duration:number = 3000, probability:number = 1){}
    //@ts-ignore
    writeDialogue(npc: Phaser.GameObjects.Sprite, name:string|Array<string>, words:Array<string>, interpret?:Array<string>,duration:number = 3000, probability:number = .2){}

    update() {
        //console.log(this.input.mousePointer.position)
        
        this.controlItems()
    
        this.movePlayer()

        repelItems(this.items, 20, 10); // tweak radius and strength
        
        //this.logTile()

        //this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
        this.cartMovement()
        this.updateCartFrame()

        this.updateMagicBeams()
    }
}

export function addAll(){
    addWorld()
    addPlayer()
    addControllables()
    addCart()
    addAudio()
    addUI()
    addDialogue()
}

addAll()

export {Game}