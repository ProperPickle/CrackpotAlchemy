import { Scene } from 'phaser';
export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;

    constructor (){
        super('Game');
    }

    preload(){
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
        this.load.image('tiles', 'assets/tilemaps/tileset.png');
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/world.json');
    }

    //private field
    #platforms: Phaser.Tilemaps.TilemapLayer | null = null;
    player:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    create (){
        
        // loaded via public/assets
        let bg = this.add.image(0, 0, 'sky').setOrigin(0, 0)
        //Adding in tilemap
        const myMap = this.make.tilemap({ key: 'map' });
        // the first arg must match the "name" of the tileset in Tiled (see public/assets/tilemaps/world.json)
        const tileset = myMap.addTilesetImage('fucked_up_chungus_world', 'tiles');
        // stretch asset
        bg.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height)
        let camera = this.cameras.main;

        let star = this.physics.add.staticImage(400, 300, 'star');
        if (!tileset) {
            throw new Error("Tileset 'map' with image key 'tiles' not found.");
        }
    const platforms = myMap.createLayer('Floor', tileset, 0, 0);
        if (!platforms) {
            throw new Error("Tilemap layer 'Platforms' not found or failed to create.");
        }
        // store layer and enable collisions for non-empty tiles
        this.#platforms = platforms;
        this.#platforms.setCollisionByExclusion([1], true);
        
        //different way of defining private variables. no this.player, however variable is scoped to create(){}
        this.player = this.physics.add.sprite(100, 450, 'dude');

        this.physics.add.overlap(this.player, star, function(){
            star.destroy(true)
        });
        camera.startFollow(this.player, true, 0.5, 0.5);
        //player physics
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(false);
        // platforms is definitely non-null here because of the guard above
        this.physics.add.collider(this.player, this.#platforms as Phaser.Tilemaps.TilemapLayer);

        //animations for player
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        // Function for finding tile indices (blows the console the fuck up).
        /*
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        // Get the tile at the pointer's world position
        const tile = this.#platforms.getTileAtWorldXY(pointer.worldX, pointer.worldY);
        if (tile) {
            // Display the tile's index (for example, in the console or on-screen)
            console.log("Tile index:", tile.index);
            // Optionally display it on screen using a text object
            // this.indexText.setText('Tile index: ' + tile.index);
            // this.indexText.setPosition(pointer.x + 10, pointer.y + 10);
        }
        });
        */
    }

    update(){
        let keyboard = this.input.keyboard
        let cursors;
        if(keyboard!= null)
            cursors = keyboard.createCursorKeys();
        else
            throw new Error("no keyboard")
        
        if (cursors.left.isDown&&!cursors.right.isDown){
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
        }
        else if (cursors.right.isDown&&!cursors.left.isDown){
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);
        }
        else{
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }

        if (cursors.up.isDown&&!cursors.down.isDown){
            this.player.setVelocityY(-160);
        } else if (cursors.down.isDown&&!cursors.up.isDown){
            this.player.setVelocityY(160);
        } else{
            this.player.setVelocityY(0);
        }
    }
}
