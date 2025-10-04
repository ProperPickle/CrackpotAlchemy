import { Scene } from 'phaser';
import addWorld from './GameImpls/World'
import addControllables from './GameImpls/Controllables'
import { Item } from './GameImpls/Item';

class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;

    fpsText: Phaser.GameObjects.Text;

    items: Set<Item> = new Set()

    constructor (){
        super('Game');
    }
    
    loadSimpleBgAssets(){}
    loadPlayer(){}
    loadMap(){}

    preload(){
        this.loadSimpleBgAssets()
        /*this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');*/
        this.loadPlayer()
        this.loadMap()
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
    
    create (){
        //defined in world.ts
        this.createSimpleBgAssets()
        this.createMap()
        this.createCamera()
        
        //defined in controllables.ts
        this.createPlayer()
        //between player, platrforms, items, and worldborder
        this.createInteractions()


        this.createItems()
    }


    controlItems(){}
    movePlayer(){}
    logTile(){}

    repelItems(items: Set<Item>, repulsionRadius: number, strength: number){}
    getLineOfSightClamped(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): Phaser.Math.Vector2 {throw new Error("Not implemented")}
    checkIfItemBehindWall(item: Item, buffer: number = 8): boolean {throw new Error("Not implemented")}

    update() {
        
        this.controlItems()
    
        this.movePlayer()

        
        //this.logTile()

        this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
        
    }
}
addWorld()
addControllables()
export {Game}