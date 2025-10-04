import { Scene } from 'phaser';
export class Game extends Scene
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
    item:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    item2:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

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
        this.camera = this.cameras.main;

        //let star = this.physics.add.staticImage(400, 300, 'star');
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

        /*
        this.physics.add.overlap(this.player, star, function(){
            star.destroy(true)
        });
        */

        this.camera.startFollow(this.player, true, 0.5, 0.5);
        //player physics
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        // platforms is definitely non-null here because of the guard above
        this.physics.add.collider(this.player, this.#platforms as Phaser.Tilemaps.TilemapLayer);


        // Defining the item
        this.item = this.physics.add.sprite(20, 450, 'dude');
        this.item.scale *= 2

        this.item.setBounce(0.2);
        this.item.setCollideWorldBounds(true);

        this.items.push(this.item)

        // Defining the item2
        this.item2 = this.physics.add.sprite(50, 450, 'dude');
        this.item2.scale *= 2

        this.item2.setBounce(0.2);
        this.item2.setCollideWorldBounds(true);

        this.items.push(this.item2)

        this.physics.world.setBounds(0, 0, myMap.widthInPixels, myMap.heightInPixels);

        this.physics.add.collider(this.items, this.#platforms as Phaser.Tilemaps.TilemapLayer);

    }

    update() {
        const mouse = this.input.mousePointer;
        if (!mouse) return;

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
    
        let keyboard = this.input.keyboard
        let cursors;
        if(keyboard!= null)
            cursors = keyboard.createCursorKeys();
        else
            throw new Error("no keyboard")
        
        if (cursors.left.isDown&&!cursors.right.isDown){
            this.player.setVelocityX(-160);
        } else if (cursors.right.isDown&&!cursors.left.isDown){
            this.player.setVelocityX(160);
        } else if (cursors.up.isDown&&!cursors.down.isDown){
            this.player.setVelocityY(-160);
        } else if (cursors.down.isDown&&!cursors.up.isDown){
            this.player.setVelocityY(160);
        } else {
            this.player.setVelocity(0);
        }

        //const center = new Phaser.Math.Vector2(this.sys.canvas.width/2, this.sys.canvas.height/2);
        const center = this.player.body.position
        const maxRadius = 200;

        let mousePos = new Phaser.Math.Vector2(mouse.worldX, mouse.worldY);

        let mouseToPlayer = mousePos.clone().subtract(center);

        if (mouseToPlayer.length() > maxRadius) {
            mouseToPlayer = mouseToPlayer.normalize().scale(maxRadius);
        }

        const clampedMousePos = center.clone().add(mouseToPlayer);

        this.repelObjects(this.items, 50, 20); // tweak radius and strength

        if (mouse.primaryDown) {

            // Loop all items to check for clicks
            for (let item of this.items) {
                if (item.getBounds().contains(clampedMousePos.x, clampedMousePos.y) && !this.isDragging.includes(item)) {
                    
                        this.isDragging.push(item)

                        if (this.isThrown.includes(item)) {
                            this.isThrown.splice(this.isThrown.indexOf(item), 1)
                        }
                }
            }

        } else {
            this.isDragging.forEach(element => {
                this.isThrown.push(element)
            });
            this.isDragging = []
        }
        
        // Move currently dragged objects (option to have multiple at once with this?)
        for (let object of this.isDragging) {

            let toTarget = clampedMousePos.clone().subtract(object.getCenter())

            const maxSpeed = 4000
            const distance = toTarget.length()
            const speed = Math.min(distance * 10, maxSpeed)
            let desiredVelocity = toTarget.clone().normalize().scale(speed)

            // Smooth velocity changes
            const k = 0.3; 
            object.body.velocity.x += (desiredVelocity.x - object.body.velocity.x) * k
            object.body.velocity.y += (desiredVelocity.y - object.body.velocity.y) * k
        }

        for (let i = this.isThrown.length - 1; i >= 0; i--) {
            const object = this.isThrown[i]

            // Drag
            const k = 0.1;
            object.body.velocity.x -= object.body.velocity.x * k
            object.body.velocity.y -= object.body.velocity.y * k

            // Once item is slowed enough, stop and remove it as a thrown item
            if (object.body.velocity.length() < 10) {
                this.isThrown.splice(i, 1)
                object.body.setVelocity(0)
            }
        }
          
    }

    repelObjects(objects: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[], repulsionRadius: number, strength: number) {
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            const a = objects[i];
            const b = objects[j];

            const delta = a.body.position.clone().subtract(b.body.position);
            const distance = delta.length();

            if (distance === 0) {
                const force = Phaser.Math.RandomXY(new Phaser.Math.Vector2)

                // apply equal and opposite velocity changes
                a.body.velocity.add(force);
                b.body.velocity.subtract(force);

                if (!this.isDragging.includes(a)) this.isThrown.push(a)
                if (!this.isDragging.includes(b)) this.isThrown.push(b)
            };

            if (distance < repulsionRadius) {
                const force = delta.normalize().scale((repulsionRadius - distance) * strength);

                // apply equal and opposite velocity changes
                a.body.velocity.add(force);
                b.body.velocity.subtract(force);

                if (!this.isDragging.includes(a)) this.isThrown.push(a)
                if (!this.isDragging.includes(b)) this.isThrown.push(b)
            }
    
    }
}
    }
}