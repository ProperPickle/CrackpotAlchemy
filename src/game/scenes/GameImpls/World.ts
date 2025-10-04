import {Game} from '../Game'
function addWorld():void{
    console.log("adding")
    Game.prototype.loadSimpleBgAssets = function(){
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
    }

    Game.prototype.loadPlayer = function(){
        this.load.spritesheet('dude', 
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    Game.prototype.loadMap = function(){
        this.load.image('tiles', 'assets/tilemaps/tileset.png');
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/world.json');
    }

    Game.prototype.createSimpleBgAssets = function(){
        let bg = this.add.image(0, 0, 'sky').setOrigin(0, 0)
        bg.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height)
    }

    Game.prototype.createMap = function(){
        //Adding in tilemap
        this.myMap = this.make.tilemap({ key: 'map' });
        //the first arg must match the "name" of the tileset in Tiled (see public/assets/tilemaps/world.json)
        const tileset = this.myMap.addTilesetImage('fucked_up_chungus_world', 'tiles');
        if (!tileset) {
            throw new Error("Tileset 'map' with image key 'tiles' not found.");
        }
        this.tileset = tileset       
        
        
        const platforms = this.myMap.createLayer('Floor', this.tileset, 0, 0);
        if (!platforms) {
            throw new Error("Tilemap layer 'Platforms' not found or failed to create.");
        }

        // store layer and enable collisions for non-empty tiles
        this.platforms = platforms;
        

        //all tiles on layer 1 collide
        this.platforms.setCollisionByExclusion([1], true);
        
        // platforms is definitely non-null here because of the guard above
        // this.physics.add.collider(this.player, this.platforms);
        // this.physics.add.collider(this.items, this.platforms as Phaser.Tilemaps.TilemapLayer);

        // this.physics.world.setBounds(0, 0, this.myMap.widthInPixels, this.myMap.heightInPixels);
    }

    Game.prototype.createCamera = function(){
        this.camera = this.cameras.main;
    }
}
export default addWorld