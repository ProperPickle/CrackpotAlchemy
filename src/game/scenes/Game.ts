import { Scene } from 'phaser';
export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;

    isDragging = new Set<Phaser.Types.Physics.Arcade.SpriteWithDynamicBody>();
    isThrown = new Set<Phaser.Types.Physics.Arcade.SpriteWithDynamicBody>();

    items: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = []

    fpsText: Phaser.GameObjects.Text;

    smoothedMouse = new Phaser.Math.Vector2();
    virtualMouse: Phaser.Math.Vector2;
    prevCamPos: Phaser.Math.Vector2;
    lastPhysicalMouse: Phaser.Math.Vector2;


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
    create () {

        this.virtualMouse = new Phaser.Math.Vector2(
            this.input.mousePointer.worldX,
            this.input.mousePointer.worldY
        );
        this.lastPhysicalMouse = new Phaser.Math.Vector2(
            this.input.mousePointer.worldX,
            this.input.mousePointer.worldY
        );
        this.prevCamPos = new Phaser.Math.Vector2(this.cameras.main.worldView.x, this.cameras.main.worldView.y);


        
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
        this.item.scale *= 0.75

        this.item.setBounce(0.2);
        this.item.setCollideWorldBounds(true);

        this.items.push(this.item)

        // Defining the item2
        this.item2 = this.physics.add.sprite(50, 450, 'dude');
        this.item2.scale *= 0.75

        this.item2.setBounce(0.2);
        this.item2.setCollideWorldBounds(true);
        this.items.forEach((it) => it.setMaxVelocity(1000))

        this.items.push(this.item2)

        this.physics.world.setBounds(0, 0, myMap.widthInPixels, myMap.heightInPixels);

        this.physics.add.collider(this.items, this.#platforms as Phaser.Tilemaps.TilemapLayer);


        this.fpsText = this.add.text(10, 10, 'FPS: 0', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setScrollFactor(0)

    }

    update() {

        this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);

        const mouse = this.input.mousePointer;
        if (!mouse) return;

        const camDelta = new Phaser.Math.Vector2(
            this.camera.worldView.x - this.prevCamPos.x,
            this.camera.worldView.y - this.prevCamPos.y
        );

        const physicalMouse = new Phaser.Math.Vector2(
            this.input.mousePointer.worldX,
            this.input.mousePointer.worldY
        );

        // Check if real mouse moved
        if (!physicalMouse.equals(this.lastPhysicalMouse)) {
            this.virtualMouse.copy(physicalMouse);
            this.lastPhysicalMouse.copy(physicalMouse); // update last physical position
        } else {
            // Mouse didn't move -> move virtualMouse by camera delta
            this.virtualMouse.add(camDelta);
        }

        this.prevCamPos.set(this.camera.worldView.x, this.camera.worldView.y);

        // Use this instead of mouse.worldX/Y from now on:
        const mousePos = this.virtualMouse.clone();

        this.smoothedMouse.x += (mousePos.x - this.smoothedMouse.x) * 0.25;
        this.smoothedMouse.y += (mousePos.y - this.smoothedMouse.y) * 0.25;


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
    
        
        let cursors;
        if(this.input.keyboard!= null)
            cursors = this.input.keyboard.createCursorKeys();
        else
            throw new Error("no keyboard")

        let speed = 240
        let move_dir = new Phaser.Math.Vector2(0, 0)
        
        if (cursors.left.isDown){
            move_dir.x -= 1
        }
        if (cursors.right.isDown){
            move_dir.x += 1
        }
        if (cursors.up.isDown){
            move_dir.y -= 1
        }
        if (cursors.down.isDown){
            move_dir.y += 1
        }

        move_dir.normalize()

        this.player.setVelocity(speed * move_dir.x, speed * move_dir.y);

        //const center = new Phaser.Math.Vector2(this.sys.canvas.width/2, this.sys.canvas.height/2);
        const center = this.player.body.position
        const maxRadius = 200;

        //let mousePos = new Phaser.Math.Vector2(this.smoothedMouse.x, this.smoothedMouse.y);

        let mouseToPlayer = this.smoothedMouse.clone().subtract(center);

        if (mouseToPlayer.length() > maxRadius) {
            mouseToPlayer = mouseToPlayer.normalize().scale(maxRadius);
        }

        let clampedMousePos = center.clone().add(mouseToPlayer);

        clampedMousePos = this.getLineOfSightClamped(center, clampedMousePos)

        this.repelObjects(this.items, 20, 10); // tweak radius and strength

        if (mouse.primaryDown) {

            // Loop all items to check for clicks
            for (let item of this.items) {
                if (item.getBounds().contains(clampedMousePos.x, clampedMousePos.y) && !this.isDragging.has(item)) {
                    
                        this.isDragging.add(item)

                        if (this.isThrown.has(item)) {
                            this.isThrown.delete(item)
                        }
                }

                /*
                if (this.isDragging.includes(item)) {
                    if (!item.getBounds().contains(clampedMousePos.x, clampedMousePos.y)) 
                        this.isDragging.splice(this.isDragging.indexOf(item), 1)
                }*/
            }

        } else {
            this.isDragging.forEach(element => {
                this.isThrown.add(element)
            });
            this.isDragging.clear()
        }
        
        // Move currently dragged objects (option to have multiple at once with this?)
        for (let item of this.isDragging) {

            let toTarget = clampedMousePos.clone().subtract(item.getCenter());
            const maxSpeed = 3000;
            const distance = toTarget.length();
            const speed = Math.min(distance * 10, maxSpeed);
            let desiredVelocity = toTarget.clone().normalize().scale(speed);

            const k = 0.5;
            item.body.velocity.x += (desiredVelocity.x - item.body.velocity.x) * k;
            item.body.velocity.y += (desiredVelocity.y - item.body.velocity.y) * k;

            if (this.checkIfItemBehindWall(item)) {
                this.isDragging.delete(item);
                this.isThrown.add(item);
            }
        }


        for (let object of this.isThrown) {

            // Drag
            const k = 0.1;
            object.body.velocity.x -= object.body.velocity.x * k
            object.body.velocity.y -= object.body.velocity.y * k

            // Once item is slowed enough, stop and remove it as a thrown item
            if (object.body.velocity.length() < 10) {
                this.isThrown.delete(object)
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

                    if (!this.isDragging.has(a)) this.isThrown.add(a)
                    if (!this.isDragging.has(b)) this.isThrown.add(b)
                };

                if (distance < repulsionRadius) {
                    const force = delta.normalize().scale((repulsionRadius - distance) * strength);

                    // apply equal and opposite velocity changes
                    a.body.velocity.add(force);
                    b.body.velocity.subtract(force);

                    if (!this.isDragging.has(a)) this.isThrown.add(a)
                    if (!this.isDragging.has(b)) this.isThrown.add(b)
                }
        
            }
        }
    }

    getLineOfSightClamped(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): Phaser.Math.Vector2 {
        if (!this.#platforms) return to;

        const tilemap = this.#platforms.tilemap;
        const layerIndex = this.#platforms.layerIndex;
        const dir = to.clone().subtract(from);
        const maxDist = dir.length();
        const dirNorm = dir.clone().normalize();

        const rayAngles = [0, -5, 5]
        const rayDistances: number[] = []

        for (let angle of rayAngles) {
            const rad = Phaser.Math.DEG_TO_RAD * angle
            const dirRotated = dirNorm.clone().rotate(rad)

            const step = 4
            const steps = Math.ceil(maxDist / step)
            const stepVec = dirRotated.clone().scale(step)

            let current = from.clone()
            let distance = maxDist

            for (let i = 0; i < steps; i++) {
                current.add(stepVec)
                const tile = tilemap.getTileAtWorldXY(current.x, current.y, true, this.cameras.main, layerIndex)
                if (tile && tile.collides) {
                    distance = i * step
                    break
                }
            }

            rayDistances.push(distance)
        }

        const avgDist = rayDistances.reduce((a, b) => a + b, 0) / rayDistances.length

        // Clamp result vector to the averaged distance
        const finalPos = from.clone().add(dirNorm.scale(avgDist))
        return finalPos
    }

    checkIfItemBehindWall(item: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, buffer: number = 8) {
        if (!this.#platforms) return false;

        const from = this.player.body.position;
        const to = item.body.position;

        const dir = to.clone().subtract(from);
        const maxDist = Math.max(0, dir.length() - buffer); // subtract buffer
        if (maxDist <= 0) return false; // item is too close, don't drop

        const dirNorm = dir.clone().normalize();
        const step = 4;
        const steps = Math.ceil(maxDist / step);
        const stepVec = dirNorm.clone().scale(step);

        let current = from.clone();

        for (let i = 0; i < steps; i++) {
            current.add(stepVec);
            const tile = this.#platforms.tilemap.getTileAtWorldXY(current.x, current.y, true, this.cameras.main, this.#platforms.layerIndex);
            if (tile && tile.collides) {
                return true; // wall detected between player and item
            }
        }

        return false; // no wall in between
    }





}
