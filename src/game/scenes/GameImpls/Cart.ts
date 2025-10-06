import {Game} from '../Game'
import { Item } from './Item';

function addCart(){

    let smoothedMouse = new Phaser.Math.Vector2();
    let virtualMouse: Phaser.Math.Vector2;
    let prevCamPos: Phaser.Math.Vector2;
    let lastPhysicalMouse: Phaser.Math.Vector2;
    let mouseHeldTime: number;
    const maxRadius = 200;

    let cartHeldPlayerAngle: number;

    Game.prototype.loadCart = function(){
        this.load.spritesheet('cart', 
            'assets/cart.png',
            { frameWidth: 64, frameHeight: 64 }
        );
    }

    Game.prototype.createCart = function(){
        this.cart = this.physics.add.sprite(400, 400, 'cart', 1).setFlipX(false)

        this.physics.add.collider(this.cart, this.platforms);
        this.physics.add.collider(this.cart, this.player);

        this.cart.setDamping(false)
        this.cart.setDrag(.5)
        this.cart.setCollideWorldBounds(true)
        this.cart.body.setSize(40, 30)
        this.cart.setBounce(0.2)

        enableDoubleClick(this.cart, this, () =>{

            if (this.cart.body.position.distance(this.player.body.position) > maxRadius * 2) return

            function rand(min: number, max: number): number {
                return Math.random() * (max - min) + min;
            }

            function rSign(n: number): number{
                return Math.random()<.5?-n:n
            }
            
            const min_buffer = 35
            const max_buffer = 60;

            this.hiddenItems.forEach((e:Item)=>{
                e.sprite.setPosition(this.cart.x+rSign(rand(min_buffer,max_buffer)),
                this.cart.y+rSign(rand(min_buffer,max_buffer)))
                e.sprite.setActive(true).setVisible(true)
            })
            this.hiddenItems.clear()
        })

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

    Game.prototype.cartMovement = function(){

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
            new Phaser.Math.Vector2(this.player.displayWidth/8 , this.player.displayHeight/8))

        //let mousePos = new Phaser.Math.Vector2(this.smoothedMouse.x, this.smoothedMouse.y);

        let mouseToPlayer = smoothedMouse.clone().subtract(center);

        if (mouseToPlayer.length() > maxRadius) {
            mouseToPlayer = mouseToPlayer.normalize().scale(maxRadius);
        }

        let clampedMousePos = center.clone().add(mouseToPlayer);

        clampedMousePos = this.getAverageRayToWall(center, clampedMousePos)

        if (this.input.mousePointer.primaryDown) {
            mouseHeldTime++

            if (this.cart.getBounds().contains(clampedMousePos.x, clampedMousePos.y) && !this.cartIsHeld
                && this.cart.getBounds().contains(mouse.worldX, mouse.worldY))
                if (mouseHeldTime == 10)
                this.cartIsHeld = true
            
        } else {
            mouseHeldTime = 0
            this.cartIsHeld = false
            //this.cart.setVelocity(0)
        }
        if (this.cartIsHeld) {
                // --- Compute current and target polar angles relative to player ---
                const cartPos = this.cart.body.position;
                let aCenter = center//.subtract(new Phaser.Math.Vector2(this.player.displayWidth/8 * 3, this.player.displayHeight/4))
                const currentVec = cartPos.clone().subtract(aCenter);
                const currentAngle = Phaser.Math.Angle.Normalize(currentVec.angle());
                const targetVec = smoothedMouse.clone().subtract(aCenter);
                const targetAngle = Phaser.Math.Angle.Normalize(targetVec.angle());

                let angleDiff = Phaser.Math.Angle.Wrap(targetAngle - currentAngle);

                const maxAngularSpeed = 1;
                angleDiff = Phaser.Math.Clamp(angleDiff, -maxAngularSpeed, maxAngularSpeed);

                cartHeldPlayerAngle = Phaser.Math.Angle.Normalize(currentAngle + angleDiff);

                const holdRadius = 70;
                const targetX = aCenter.x + Math.cos(cartHeldPlayerAngle) * holdRadius;
                const targetY = aCenter.y + Math.sin(cartHeldPlayerAngle) * holdRadius;

                const toTarget = new Phaser.Math.Vector2(targetX - cartPos.x, targetY - cartPos.y);
                const maxSpeed = 1000;
                const speed = Math.min(toTarget.length() * 20, maxSpeed);
                const desiredVelocity = toTarget.normalize().scale(speed);

                const k = 0.5;
                this.cart.body.velocity.x += (desiredVelocity.x - this.cart.body.velocity.x) * k;
                this.cart.body.velocity.y += (desiredVelocity.y - this.cart.body.velocity.y) * k;

                
                if (this.cartIsOccluded()) {
                    this.cartIsHeld = false;
                    this.cart.setVelocity(0)
                }

                let cartAngle = currentAngle * Phaser.Math.RAD_TO_DEG
                if ((270 < cartAngle) || (cartAngle < 90))
                    this.cart.setFlipY(false)
                else
                    this.cart.setFlipY(true)
                
                this.cart.setAngle(cartAngle)
                

            } else {
                let cartAngle = this.cart.body.velocity.angle() * Phaser.Math.RAD_TO_DEG

                if (this.cart.body.speed > 0.1) {
                    if ((270 < cartAngle) || (cartAngle < 90))
                        this.cart.setFlipY(false)
                    else
                        this.cart.setFlipY(true)
                    
                    this.cart.setAngle(cartAngle)
                }
            }


        let vx = this.cart.body.velocity.x
        let vy = this.cart.body.velocity.y
        this.cart.setAccelerationX(-vx*.75)   
        this.cart.setAccelerationY(-vy*.75)
        if(vx*vx+vy*vy<2){
            this.cart.body.setVelocity(0,0)
        }
    }

    function enableDoubleClick(
        obj: Phaser.GameObjects.GameObject,
        scene: Phaser.Scene,
        callback: () => void,
        delay = 300
    ) {
        let lastClick = 0;
        obj.setInteractive();
        obj.on('pointerdown', () => {
            const now = scene.time.now;
            if (now - lastClick < delay) {
                callback();
            }
            lastClick = now;
        });
    }

    Game.prototype.cartIsOccluded = function (buffer: number = 8) {
        //if (item.body == null) return false
        const from = this.player.body.position;
        const to = this.cart.body.position;

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
            const tile = this.platforms.tilemap.getTileAtWorldXY(
                current.x, current.y, true, this.camera, this.platforms.layerIndex);
            if (tile && tile.collides) {
                return true; // wall detected between player and item
            }
        }

        return false; // no wall in between
    }

    Game.prototype.updateCartFrame = function(){
        // if(this.cart.body.velocity.x>0){
        //     this.cart.setFrame(1)
        // }else if(this.cart.body.velocity.x<0){
        //     this.cart.setFrame(0)
        // }
        this.cart.setFlipX(false)
    }

}
export default addCart