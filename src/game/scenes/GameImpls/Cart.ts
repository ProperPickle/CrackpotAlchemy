import {Game} from '../Game'
import { Item } from './Item';

function addCart(){

    let smoothedMouse = new Phaser.Math.Vector2();
    let virtualMouse: Phaser.Math.Vector2;
    let prevCamPos: Phaser.Math.Vector2;
    let lastPhysicalMouse: Phaser.Math.Vector2;
    let mouseHeldTime: number;

    let cartAngle: number;

    Game.prototype.loadCart = function(){
        this.load.spritesheet('cart', 
            'assets/bomb.png',
            { frameWidth: 64, frameHeight: 64 }
        );
    }

    Game.prototype.createCart = function(){
        this.cart = this.physics.add.sprite(400, 400, 'cart').setScale(2)

        this.physics.add.collider(this.cart, this.platforms);
        this.physics.add.collider(this.cart, this.player);

        this.cart.setDamping(false)
        this.cart.setDrag(.5)
        this.cart.setCollideWorldBounds(true)

        enableDoubleClick(this.cart, this, () =>{
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
        /*
        this.cart.setInteractive().on('pointerdown', ()=>{
            function rand(min: number, max: number): number {
                return Math.random() * (max - min) + min;
            }

            function rSign(n: number): number{
                return Math.random()<.5?-n:n
            }
            
            const min_buffer = 25
            const max_buffer = 50;

            this.hiddenItems.forEach((e:Item)=>{
                e.sprite.setPosition(this.cart.x+rSign(rand(min_buffer,max_buffer)),
                             this.cart.y+rSign(rand(min_buffer,max_buffer)))
                e.sprite.setActive(true).setVisible(true)
            })
            this.hiddenItems.clear()
        })*/

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
            new Phaser.Math.Vector2(this.player.displayWidth/2 , this.player.displayHeight/2))
        const maxRadius = 300;

        //let mousePos = new Phaser.Math.Vector2(this.smoothedMouse.x, this.smoothedMouse.y);

        let mouseToPlayer = smoothedMouse.clone().subtract(center);

        if (mouseToPlayer.length() > maxRadius) {
            mouseToPlayer = mouseToPlayer.normalize().scale(maxRadius);
        }

        let clampedMousePos = center.clone().add(mouseToPlayer);

        clampedMousePos = this.getLineOfSightClamped(center, clampedMousePos)

        if (this.input.mousePointer.primaryDown) {
            mouseHeldTime++

            if (this.cart.getBounds().contains(clampedMousePos.x, clampedMousePos.y) && !this.cartIsHeld)
                if (mouseHeldTime > 10)
                this.cartIsHeld = true
            
        } else {
            mouseHeldTime = 0
            this.cartIsHeld = false
            //this.cart.setVelocity(0)
        }
        if (this.cartIsHeld) {
                // --- Compute current and target polar angles relative to player ---
                const cartPos = this.cart.body.position;
                let aCenter = center.subtract(new Phaser.Math.Vector2(this.player.displayWidth/2, this.player.displayHeight/4))
                const currentVec = cartPos.clone().subtract(aCenter);
                const currentAngle = Phaser.Math.Angle.Normalize(currentVec.angle());
                const targetVec = smoothedMouse.clone().subtract(aCenter);
                const targetAngle = Phaser.Math.Angle.Normalize(targetVec.angle());

                let angleDiff = Phaser.Math.Angle.Wrap(targetAngle - currentAngle);

                const maxAngularSpeed = 1;
                angleDiff = Phaser.Math.Clamp(angleDiff, -maxAngularSpeed, maxAngularSpeed);

                cartAngle = Phaser.Math.Angle.Normalize(currentAngle + angleDiff);

                const holdRadius = 55;
                const targetX = aCenter.x + Math.cos(cartAngle) * holdRadius;
                const targetY = aCenter.y + Math.sin(cartAngle) * holdRadius;

                const toTarget = new Phaser.Math.Vector2(targetX - cartPos.x, targetY - cartPos.y);
                const maxSpeed = 3000;
                const speed = Math.min(toTarget.length() * 20, maxSpeed);
                const desiredVelocity = toTarget.normalize().scale(speed);

                const k = 0.5;
                this.cart.body.velocity.x += (desiredVelocity.x - this.cart.body.velocity.x) * k;
                this.cart.body.velocity.y += (desiredVelocity.y - this.cart.body.velocity.y) * k;


                if (this.checkIfItemBehindWall(this.cart)) {
                    this.cartIsHeld = false;
                    this.cart.setVelocity(0)
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

}
export default addCart