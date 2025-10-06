import {Game} from '../Game'

function addWorld():void{
    Game.prototype.loadSimpleBgAssets = function(){
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
    }

    Game.prototype.loadMap = function(){
        this.load.image('tiles', 'assets/tilemaps/Town_Tileset_LD58.png');
        this.load.image('decor_tiles', 'assets/decor.png');
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/world.json');
    }

    Game.prototype.loadInteractables = function(){
        this.load.spritesheet('trash_can', 'assets/trash_can.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('bouncer', 'assets/bouncer_neutral.png');
        this.load.spritesheet('door', 'assets/door.png', { frameWidth: 64, frameHeight: 64 });
    }

    Game.prototype.loadDecor = function(){
            this.load.image('glass_shards', 'assets/glass_shards.png');
            this.load.image('trash_bag', 'assets/trash_bag.png');
            this.load.image('lamp_small_l', 'assets/lamp_small_l.png');
            this.load.image('lamp_small_r', 'assets/lamp_small_r.png');
            this.load.image('lamp_bottom_l', 'assets/lamp_bottom_l.png');
            this.load.image('lamp_top_l', 'assets/lamp_top_l.png');
            this.load.image('lamp_bottom_r', 'assets/lamp_bottom_r.png');
            this.load.image('lamp_top_r', 'assets/lamp_top_r.png');
            this.load.image('can_clean', 'assets/can_clean.png');
            this.load.image('can_dirty', 'assets/can_dirty.png');
            this.load.image('entrance', 'assets/entrance.png');
            this.load.image('entrance_crossed_swords', 'assets/entrance_crossed_swords.png');
        }

    Game.prototype.createSimpleBgAssets = function(){
        let bg = this.add.image(0, 0, 'sky').setOrigin(0, 0)
        bg.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height)
    }  

    Game.prototype.createMap = function(){
        //Adding in tilemap
        this.myMap = this.make.tilemap({ key: 'map' });
        //the first arg must match the "name" of the tileset in Tiled (see public/assets/tilemaps/world.json)
        const tileset = this.myMap.addTilesetImage('grungy_ass_town', 'tiles');
        const decorTileset = this.myMap.addTilesetImage('decor', 'decor_tiles');
        if (!tileset) {
            throw new Error("Tileset 'map' with image key 'tiles' not found.");
        }
        this.tileset = tileset;
        const floors = this.myMap.createLayer('Floors', this.tileset, 0, 0);
        const walls = this.myMap.createLayer('Walls', this.tileset, 0, 0);
        if (!walls || !floors) {
            throw new Error("Tilemap layer 'Walls' or 'Floors' not found or failed to create.");
        }

        // store layer and enable collisions for non-empty tiles
        this.walls = walls;


        //all tiles on layer 1 collide
        this.walls.setCollisionByExclusion([-1], true);

        // walls is definitely non-null here because of the guard above
        // this.physics.add.collider(this.player, this.walls);
        // this.physics.add.collider(this.items, this.walls as Phaser.Tilemaps.TilemapLayer);

        // this.physics.world.setBounds(0, 0, this.myMap.widthInPixels, this.myMap.heightInPixels);
    }

    Game.prototype.createCamera = function(){
        this.camera = this.cameras.main;
    }
}
export default addWorld