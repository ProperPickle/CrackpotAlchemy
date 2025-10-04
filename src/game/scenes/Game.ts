import { Scene } from 'phaser';
import addWorld from './GameImpls/World'
import addControllables from './GameImpls/Controllables'

class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;

    isDragging: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = []
    isThrown: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = []

    items: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = []

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

    //private field 
    item:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    item2:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

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

    repelObjects(objects: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[], repulsionRadius: number, strength: number){}

    update() {
        
        this.controlItems()
    
        this.movePlayer()

        
        //this.logTile()
        
    }
}
addWorld()
addControllables()
export {Game}