import {Game} from '../Game'
import {Bouncer, TrashCan, Door} from '../../interactables';
import { checkCraft, Item , itemKeys } from './Item';


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


    Game.prototype.createInteractions = function(){
        this.physics.add.collider(this.player, this.walls);
        this.camera.startFollow(this.player, true, 0.5, 0.5);

        let worldLeft = 0
        let worldRight = this.myMap.widthInPixels
        let worldTop = 0
        let worldBottom = this.myMap.heightInPixels
        this.camera.setBounds(worldLeft, worldTop, worldRight, worldBottom)


        this.physics.world.setBounds(0, 0, this.myMap.widthInPixels, this.myMap.heightInPixels);

        // ensure the items physics group exists before any items are created
        if (!this.itemsGroup) {
            this.itemsGroup = this.physics.add.group();
        }

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
        this.itemsGroup = this.physics.add.group();
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

    Game.prototype.createItem = function(x, y, key): Item {
        let item = Item.createFromKey(this, x, y, key)
        item.sprite.scale *= .8
        if(key.substr(key.length - 3)=="pot")
            item.sprite.scale*=1.8

        item.sprite.setBounce(0.2)
        item.sprite.setCollideWorldBounds(true)

        this.items.add(item)
        this.itemsGroup.add(item.sprite)
        
        this.physics.add.overlap(this.cart, item.sprite, ()=>{
            if(!item.sprite.active || item.exitCartDelay > 0)
                return;
            this.cartSound.play()
            item.sprite.setActive(false).setVisible(false)
            this.hiddenItems.add(item)
        })

        
        this.physics.add.overlap(Array.from(this.items).map(it => it.sprite),
        Array.from(this.items).map(it => it.sprite), (a,b)=> {
            //item collision handler
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
        })

        this.physics.add.collider(Array.from(this.items).map(it => it.sprite), this.walls);


        return item
    }

    Game.prototype.createInteractables = function(){
        //adding trashcans from object layer
        this.trashCans = this.physics.add.group({immovable: true});
        const trashCanLayer = this.myMap.getObjectLayer('trash_cans');
        if(trashCanLayer && trashCanLayer.objects) {
            trashCanLayer.objects.forEach((obj, idx) => {
                const x = (obj.x ?? 0) + 30;
                const y = (obj.y ?? 0) + 30 - (obj.height ?? 0);
                const trashCan = new TrashCan(this, `trash${idx}`, x, y);
                (trashCan.body as Phaser.Physics.Arcade.Body).setSize(trashCan.width/2, 20);
                this.trashCans.add(trashCan);
                trashCan.setDepth(2);
                // console.log(`Created trash can at (${x}, ${y})`);
                
            });
        }   
        this.physics.add.collider(this.trashCans, this.player);
        this.physics.add.collider(this.trashCans, this.cart);
        //adding doors from object layer
        this.doors = this.physics.add.group({immovable: true});
        const doorLayer = this.myMap.getObjectLayer('doors');
        if(doorLayer && doorLayer.objects) {
            doorLayer.objects.forEach((obj,idx) => {
                const x = (obj.x ?? 0)+(obj.width ?? 0)/2;
                const y = (obj.y ?? 0)-(obj.height ?? 0)/2;
                const door = new Door(this, `door${idx}`, x, y, obj.id, obj.properties.open);
                this.doors.add(door);
                door.setDepth(2);
                // console.log(`Created door at (${x}, ${y})`);
            });
        }
        this.physics.add.collider(this.doors, this.player);
        this.physics.add.collider(this.doors, this.cart);
        this.physics.add.collider(this.doors, this.itemsGroup);
        //adding bouncers from object layer
        this.bouncers = this.physics.add.group({immovable: true});
        const bouncerLayer = this.myMap.getObjectLayer('bouncers');
        if(bouncerLayer && bouncerLayer.objects) {
            bouncerLayer.objects.forEach((obj,idx) => { 
                const x = (obj.x ?? 0) + 30;
                const y = (obj.y ?? 0) + 30 - (obj.height ?? 0);
                const bouncer = new Bouncer(this, `bouncer${idx}`, x, y, obj.properties[0].value, obj.properties[1].value);
                (bouncer.body as Phaser.Physics.Arcade.Body).setSize(40, 40);
                this.bouncers.add(bouncer);
                bouncer.setDepth(2);
                // console.log(`Created bouncer at (${x}, ${y})`);
            });
        }
        this.physics.add.collider(this.bouncers, this.player);
        this.physics.add.collider(this.bouncers, this.cart);
        this.physics.add.collider(this.bouncers, this.itemsGroup);
        
    }
    Game.prototype.createDecor = function(){
        //adding decor from object layer
        const decorLayer = this.myMap.getObjectLayer('decor');
        if(decorLayer && decorLayer.objects) {
            decorLayer.objects.forEach((obj, idx) => {
                const x = (obj.x ?? 0) + (obj.width ?? 0)/2;
                const y = (obj.y ?? 0) - (obj.height ?? 0)/2;
                console.log(obj.name);
                const decor = this.add.image(x, y, obj.name ?? 'glass_shards');
                decor.setDisplaySize((obj.width ?? decor.width), (obj.height ?? decor.height))
                    decor.setFlipX(obj.flippedHorizontal ?? false);
                    decor.setFlipY(obj.flippedVertical ?? false);
                    decor.setDepth(0);
                    // console.log(`Created decor at (${x}, ${y})`);
            });
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

        clampedMousePos = this.getAverageRayToWall(center, clampedMousePos)

        if (mouse.primaryDown) {

            if (!this.cartIsHeld) {

            // Loop all items to check for clicks
            for (let item of this.items) {
                if (!item.sprite.active) { item.isHeld = false; item.body.setVelocity(0) }
                if (item.sprite.getBounds().contains(clampedMousePos.x, clampedMousePos.y) && !item.isHeld &&
                    item.sprite.getBounds().contains(mouse.worldX, mouse.worldY) && item.sprite.active &&
                    item.exitCartDelay < 30) {
                    
                        item.isHeld = true

                        
                        if (item.isThrown) {
                            item.isThrown = false
                        }
                }
            }
            }
        } else {
            this.items.forEach((item) => { 
                if (item.isHeld) 
                item.isHeld = false
                item.isThrown = true
             } )
        }
        
        // Move currently dragged objects
        for (let item of this.items) {

            if (item.exitCartDelay > 0) item.exitCartDelay--
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

                
                if (item.isOccluded()) {
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
    
    Game.prototype.getAverageRayToWall = function(from, to) {

        const tilemap = this.walls.tilemap;
        const layerIndex = this.walls.layerIndex;
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

    Game.prototype.logTile = function(){
        //changed to pointerdown so it shouldn't blow up the console
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Get the tile at the pointer's world position
            const tile = this.walls.getTileAtWorldXY(pointer.worldX, pointer.worldY);
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