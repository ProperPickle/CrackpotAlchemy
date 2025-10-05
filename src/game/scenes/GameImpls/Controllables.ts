import {Game} from '../Game'
import {TrashCan} from '../../interactables';
import { Item , itemKeys, checkCraft} from './Item';


function addControllables(){

    let smoothedMouse = new Phaser.Math.Vector2();
    let virtualMouse: Phaser.Math.Vector2;
    let prevCamPos: Phaser.Math.Vector2;
    let lastPhysicalMouse: Phaser.Math.Vector2;


    Game.prototype.loadItems = function(){
        for(let key of Object.keys(itemKeys)){
            this.load.spritesheet(key, 
                'assets/'+key+'.png',
                { frameWidth: 64, frameHeight: 64 }
            );
        }
    }

    Game.prototype.createPlayer = function(){
        this.player = this.physics.add.sprite(100, 450, 'crackpot');
        this.player.body.setSize(40, 56)
        this.player.setCollideWorldBounds(true);
        this.player.setDrag(0.5)

        //animations for player
        
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('crackpot', { start: 5, end: 0 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('crackpot', { start: 23, end: 18 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('crackpot', { start: 17, end: 12 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('crackpot', { start: 11, end: 6 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'still',
            frames: [ { key: 'crackpot', frame: 17 } ],
            frameRate: 10,
            repeat: -1
        });
    }

    Game.prototype.createInteractions = function(){
        this.physics.add.collider(this.player, this.platforms);
        this.camera.startFollow(this.player, true, 0.5, 0.5);

        let worldLeft = 0
        let worldRight = this.myMap.widthInPixels
        let worldTop = 0
        let worldBottom = this.myMap.heightInPixels
        this.camera.setBounds(worldLeft, worldTop, worldRight, worldBottom)


        this.physics.world.setBounds(0, 0, this.myMap.widthInPixels, this.myMap.heightInPixels);

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

    Game.prototype.createItem = function(x, y, key: itemKeys):Item{
        let item = Item.createFromKey(this, x, y, key)
        item.sprite.scale *= 0.75

        item.sprite.setBounce(0.2)
        item.sprite.setCollideWorldBounds(true)

        this.items.add(item)

        this.physics.add.overlap(this.cart, item.sprite, ()=>{
            item.sprite.setActive(false).setVisible(false)
            this.hiddenItems.add(item)
        })

        this.physics.add.overlap(Array.from(this.items).map(it => it.sprite),
        Array.from(this.items).map(it => it.sprite),
        //item collision handler
            (a,b)=> {
                let itemA, itemB;
                for (let item of this.items) {
                    if (item.sprite === a) {
                        itemA = item
                    }
                    if (item.sprite === b) {
                        itemB = item
                    }
                }
                if(!(itemA instanceof Item && itemB instanceof Item))
                    throw new Error("not an item collision")
                if(this.hiddenItems.has(itemA) || this.hiddenItems.has(itemB))
                    return;
                let craft:itemKeys|null = checkCraft(itemA.name, itemB.name)
                if(craft){
                    this.craftSound.play()
                    //don't add the new item to this.items
                    let c = this.createItem(itemA.sprite.x, itemA.sprite.y, craft)
                    c.body.setVelocityX(itemA.body.velocity.x)
                    c.body.setVelocityY(itemA.body.velocity.y)
                    c.isHeld = itemA.isHeld
                    c.isThrown = itemB.isThrown

                    this.items.delete(itemA)
                    this.items.delete(itemB)

                    a.destroy(true)
                    b.destroy(true)
                }
            }
        )
        this.physics.add.collider(Array.from(this.items).map(it => it.sprite), this.platforms);


        return item
    }

    Game.prototype.deleteItem = function(item: Item){
        this.items.delete(item)
        item.sprite.destroy(true)
    }

    Game.prototype.createItems = function(){
        for (let i = 0; i < 3; i++) {
            let pos = new Phaser.Math.Vector2()
            Phaser.Math.RandomXY(pos, 40)

            this.createItem(pos.x+200, pos.y+200, itemKeys.fries)
        }
        for (let i = 0; i < 3; i++) {
            let pos = new Phaser.Math.Vector2()
            Phaser.Math.RandomXY(pos, 80)

            this.createItem(pos.x+400, pos.y+200, itemKeys.rat)
        }
    }

    Game.prototype.createInteractables = function(){
        this.trashCans = this.physics.add.group({immovable: true});
        const trashCanLayer = this.myMap.getObjectLayer('trash_cans');
        if(trashCanLayer && trashCanLayer.objects) {
            trashCanLayer.objects.forEach((obj, idx) => {
                const x = (obj.x ?? 0) + 30;
                const y = (obj.y ?? 0) + 30 - (obj.height ?? 0);
                const trashCan = new TrashCan(this, `trash${idx}`, x, y);
                (trashCan.body as Phaser.Physics.Arcade.Body).setSize(trashCan.width/2, 20);
                this.trashCans.add(trashCan);
                console.log(`Created trash can at (${x}, ${y})`);
                
            });
        }
        this.physics.add.collider(this.trashCans, this.player);
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

            if (!this.cartIsHeld) {

            // Loop all items to check for clicks
            for (let item of this.items) {
                if (item.sprite.getBounds().contains(clampedMousePos.x, clampedMousePos.y) && !item.isHeld &&
                    item.sprite.getBounds().contains(mouse.worldX, mouse.worldY)) {
                    
                        item.isHeld = true

                        
                        if (item.isThrown) {
                            item.isThrown = false
                        }
                }
            }
            }
        } else {
            this.items.forEach((item) => { if (item.isHeld) 
                item.isHeld = false
                item.isThrown = true
             } )
        }
        
        // Move currently dragged objects
        for (let item of this.items) {
            //if (item.body == null) continue

            if (item.isHeld) {
                let toTarget = clampedMousePos.clone().subtract(item.sprite.getCenter());
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
                    item.sprite.setVelocity(0)
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

                //if (!a.sprite.body || !b.sprite.body) continue;

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
        //if (item.body == null) return false
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

        //if (this.camera.worldView.x)

        let cursors;
        if(this.input.keyboard!= null)
            cursors = this.input.keyboard.createCursorKeys();
        else
            throw new Error("no keyboard")

        interface wasd {
            up:Phaser.Input.Keyboard.Key
            left:Phaser.Input.Keyboard.Key
            down:Phaser.Input.Keyboard.Key
            right:Phaser.Input.Keyboard.Key
        }

        let wasdKeys:wasd;
        wasdKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D
        }) as wasd;


        let speed = 240
        let move_dir = new Phaser.Math.Vector2(0, 0)
        
        if (cursors.left.isDown || wasdKeys.left.isDown){
            move_dir.x -= 1
        }
        if (cursors.right.isDown || wasdKeys.right.isDown){
            move_dir.x += 1
        }
        if (cursors.up.isDown || wasdKeys.up.isDown){
            move_dir.y -= 1
        }
        if (cursors.down.isDown || wasdKeys.down.isDown){
            move_dir.y += 1
        }

        move_dir.normalize()

        if (move_dir.dot(new Phaser.Math.Vector2(1,0)) > 0) {
            this.player.anims.play('right', true)
        } else if (move_dir.dot(new Phaser.Math.Vector2(1,0)) == 0) {
            if (move_dir.dot(new Phaser.Math.Vector2(0,1)) > 0) {
                this.player.anims.play('down', true)
            } else if (move_dir.dot(new Phaser.Math.Vector2(0,1)) == 0) {
                this.player.anims.play('still', true)
            } else {
                this.player.anims.play('up', true)
            }
        } else {
            this.player.anims.play('left', true)
        }

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