import { Scene } from 'phaser';
import addWorld from './GameImpls/World'
import addControllables from './GameImpls/Controllables'
import { Item, itemKeys, repelItems } from './GameImpls/Item';
import addCart from './GameImpls/Cart';
import addAudio from './GameImpls/Audio';
import addUI from './GameImpls/UI';
import addPlayer from './GameImpls/Player';

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
    constructor (){
        super('Game');
    }
    
    loadSimpleBgAssets(){}
    loadPlayer(){}
    loadMap(){}
    loadItems(){}
    loadCart(){}
    loadInteractables(){}
    loadAudio(){}
    loadUIAssets(){}

    // @ts-ignore
    showPopup(message: string, x: number, y: number, width: number, height: number, duration = 2000, fontSize: number){}

    craftSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound
    cartSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound

    preload(){
        this.loadSimpleBgAssets()
        /*this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');*/
        this.loadPlayer()
        this.loadMap()
        this.loadItems()
        this.loadCart()
        this.loadInteractables()
        this.loadAudio()
        this.loadUIAssets()
    }


    platforms: Phaser.Tilemaps.TilemapLayer;
    player:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

    myMap: Phaser.Tilemaps.Tilemap
    tileset: Phaser.Tilemaps.Tileset

    createSimpleBgAssets(){}
    createPlayer(){}
    createMap(){}
    createCamera(){}
    createInteractions(){}
    createItems(){}
    createCart(){}
    createInteractables(){}

    // @ts-ignore
    createItem(x:number, y:number, key:itemKeys):Item{
        return Item.createFromKey(this,0,0,itemKeys.can)
    }

    createAudio(){}

    cart:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    cartIsHeld: boolean = false;
    
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

        this.showPopup("Welcome brave adventurer!", 
            10, 10, 300, 100, 3000, 30)
    }


    controlItems(){}
    movePlayer(){}
    logTile(){}

    // @ts-ignore
    repelItems(items: Set<Item>, repulsionRadius: number, strength: number){} // @ts-ignore
    getAverageRayToWall(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): Phaser.Math.Vector2 {throw new Error("Not implemented")} // @ts-ignore
    checkIfItemBehindWall(item: any, buffer: number = 8): boolean {throw new Error("Not implemented")}

    cartMovement(){}

    update() {
        //console.log(this.input.mousePointer.position)
        
        this.controlItems()
    
        this.movePlayer()

        repelItems(this.items, 20, 10); // tweak radius and strength
        
        //this.logTile()

        //this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
        this.cartMovement()
    }
}
addWorld()
addPlayer()
addControllables()
addCart()
addAudio()
addUI()

export {Game}