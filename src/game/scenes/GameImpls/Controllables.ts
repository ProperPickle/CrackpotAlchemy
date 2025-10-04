import {Game} from '../Game'
import { Item } from './Item';


function addControllables(){

    let smoothedMouse = new Phaser.Math.Vector2();
    let virtualMouse: Phaser.Math.Vector2;
    let prevCamPos: Phaser.Math.Vector2;
    let lastPhysicalMouse: Phaser.Math.Vector2;

    Game.prototype.createPlayer = function(){
        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setCollideWorldBounds(true);
    }

    Game.prototype.createInteractions = function(){
        this.physics.add.collider(this.player, this.platforms);
        this.camera.startFollow(this.player, true, 0.5, 0.5);

        this.physics.world.setBounds(0, 0, this.myMap.widthInPixels, this.myMap.heightInPixels);

        this.physics.add.collider(Array.from(this.items), this.platforms);

        virtualMouse = new Phaser.Math.Vector2(
            this.input.mousePointer.worldX,
            this.input.mousePointer.worldY
        );
        lastPhysicalMouse = new Phaser.Math.Vector2(
            this.input.mousePointer.worldX,
            this.input.mousePointer.worldY
        );
        prevCamPos = new Phaser.Math.Vector2(this.cameras.main.worldView.x, this.cameras.main.worldView.y);

    }

    Game.prototype.createItems = function(){

        for (let i = 0; i < 10; i++) {
            let pos = new Phaser.Math.Vector2()
            Phaser.Math.RandomXY(pos, 40)

            let item = new Item(this, pos.x+300, pos.y+400, 'item' + i, 'dude')
            item.scale *= 0.75

            item.setBounce(0.2)
            item.setCollideWorldBounds(true)

            this.items.add(item)
        }

    }

    Game.prototype.controlItems = function(){
         const mouse = this.input.mousePointer;
        if (!mouse) return;

        const camDelta = new Phaser.Math.Vector2(
            this.camera.worldView.x - prevCamPos.x,
            this.camera.worldView.y - prevCamPos.y
        );

        const physicalMouse = new Phaser.Math.Vector2(
            this.input.mousePointer.worldX,
            this.input.mousePointer.worldY
        );

        // Check if real mouse moved
        if (!physicalMouse.equals(lastPhysicalMouse)) {
            virtualMouse.copy(physicalMouse);
            lastPhysicalMouse.copy(physicalMouse); // update last physical position
        } else {
            // Mouse didn't move -> move virtualMouse by camera delta
            virtualMouse.add(camDelta);
        }

        prevCamPos.set(this.camera.worldView.x, this.camera.worldView.y);

        // Use this instead of mouse.worldX/Y from now on:
        const mousePos = virtualMouse.clone();

        smoothedMouse.x += (mousePos.x - smoothedMouse.x) * 0.25;
        smoothedMouse.y += (mousePos.y - smoothedMouse.y) * 0.25;

         //const center = new Phaser.Math.Vector2(this.sys.canvas.width/2, this.sys.canvas.height/2);
        const center = this.player.body.position.clone().add(
            new Phaser.Math.Vector2(this.player.displayWidth/2 , 0 /*this.player.displayHeight/2*/))
        const maxRadius = 200;

        //let mousePos = new Phaser.Math.Vector2(this.smoothedMouse.x, this.smoothedMouse.y);

        let mouseToPlayer = smoothedMouse.clone().subtract(center);

        if (mouseToPlayer.length() > maxRadius) {
            mouseToPlayer = mouseToPlayer.normalize().scale(maxRadius);
        }

        let clampedMousePos = center.clone().add(mouseToPlayer);

        clampedMousePos = this.getLineOfSightClamped(center, clampedMousePos)

        this.repelItems(this.items, 20, 10); // tweak radius and strength

        if (mouse.primaryDown) {

            // Loop all items to check for clicks
            for (let item of this.items) {
                if (item.getBounds().contains(clampedMousePos.x, clampedMousePos.y) && !item.isHeld) {
                    
                        item.isHeld = true

                        if (item.isThrown) {
                            item.isThrown = false
                        }
                }
            }

        } else {
            this.items.forEach((item) => { if (item.isHeld) item.drop() } )
        }
        
        // Move currently dragged objects
        for (let item of this.items) {
            if (item.body == null) continue

            if (item.isHeld) {
                let toTarget = clampedMousePos.clone().subtract(item.getCenter());
                const maxSpeed = 3000;
                const distance = toTarget.length();
                const speed = Math.min(distance * 10, maxSpeed);
                let desiredVelocity = toTarget.clone().normalize().scale(speed);

                const k = 0.5;
                item.body.velocity.x += (desiredVelocity.x - item.body.velocity.x) * k;
                item.body.velocity.y += (desiredVelocity.y - item.body.velocity.y) * k;

                if (this.checkIfItemBehindWall(item)) {
                    item.isHeld = false
                    item.isThrown = true
                }
            }

            if (item.isThrown) {
                // Drag
                const k = 0.1;
                item.body.velocity.x -= item.body.velocity.x * k
                item.body.velocity.y -= item.body.velocity.y * k

                // Once item is slowed enough, stop and remove it as a thrown item
                if (item.body.velocity.length() < 10) {
                    item.drop()
                    item.setVelocity(0)
                }
            }

        }
          
    }

    Game.prototype.repelItems = function(items: Set<Item>, repulsionRadius: number, strength: number) {
        // Convert set to array for index-based iteration
        const itemArray = Array.from(items);

        for (let i = 0; i < itemArray.length; i++) {
            for (let j = i + 1; j < itemArray.length; j++) {
                const a = itemArray[i];
                const b = itemArray[j];

                if (!a.body || !b.body) continue;

                const delta = a.body.position.clone().subtract(b.body.position);
                const distance = delta.length();

                if (distance === 0) {
                    const force = Phaser.Math.RandomXY(new Phaser.Math.Vector2());

                    a.body.velocity.add(force);
                    b.body.velocity.subtract(force);

                }

                if (distance < repulsionRadius) {
                    const force = delta.normalize().scale((repulsionRadius - distance) * strength);

                    a.body.velocity.add(force);
                    b.body.velocity.subtract(force);

                }
            }
        }
    }

    Game.prototype.getLineOfSightClamped = function(from, to) {

        const tilemap = this.platforms.tilemap;
        const layerIndex = this.platforms.layerIndex;
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

        const p = 2; // higher p = more skew toward large distances
        const avgDist = Math.pow(
            rayDistances.reduce((sum, d) => sum + Math.pow(d, p), 0) / rayDistances.length,
            1 / p
        );

        // Clamp result vector to the averaged distance
        const finalPos = from.clone().add(dirNorm.scale(avgDist))
        return finalPos
    }

    Game.prototype.checkIfItemBehindWall = function(item, buffer: number = 8) {
        if (item.body == null) return false
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
            const tile = this.platforms.tilemap.getTileAtWorldXY(current.x, current.y, true, this.cameras.main, this.platforms.layerIndex);
            if (tile && tile.collides) {
                return true; // wall detected between player and item
            }
        }

        return false; // no wall in between
    }


    Game.prototype.movePlayer = function(){

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

    }

    Game.prototype.logTile = function(){
        //changed to pointerdown so it shouldn't blow up the console
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Get the tile at the pointer's world position
            const tile = this.platforms.getTileAtWorldXY(pointer.worldX, pointer.worldY);
            if (tile) {
                // Display the tile's index (for example, in the console or on-screen)
                console.log("Tile index:", tile.index);
                // Optionally display it on screen using a text object
                // this.indexText.setText('Tile index: ' + tile.index);
                // this.indexText.setPosition(pointer.x + 10, pointer.y + 10);
            }
        });
    }
}

export default addControllables