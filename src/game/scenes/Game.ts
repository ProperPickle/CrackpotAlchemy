import { Scene } from 'phaser';
export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;

    isDragging: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = []
    isDropped: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = []

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
    }

    //private field 
    player:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    create (){
        // loaded via public/assets
        let bg = this.add.image(0, 0, 'sky').setOrigin(0, 0)
        // stretch asset
        bg.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height)

        // Defining the item
        this.player = this.physics.add.sprite(450, 450, 'dude');
        this.player.scale *= 2

        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.player.anims.play('turn');

        this.items.push(this.player)
        
    }

    update() {
        // This is purely in here for debugging
        let keyboard = this.input.keyboard
        let cursors;
        if(keyboard!= null)
            cursors = keyboard.createCursorKeys();
        else
            throw new Error("no keyboard")
        
        if (cursors.left.isDown){
            this.player.body.x -= 10
        }
        else if (cursors.right.isDown){
            this.player.body.x += 10
        }
        else if (cursors.up.isDown){
            this.player.body.y -= 10
        }
        else if (cursors.down.isDown){
            this.player.body.y += 10
        }
        // end purely in here for debug



        const mouse = this.input.mousePointer;
        if (!mouse) return;

        const center = new Phaser.Math.Vector2(this.sys.canvas.width/2, this.sys.canvas.height/2);
        const maxRadius = 200;

        let mousePos = new Phaser.Math.Vector2(mouse.x, mouse.y);

        let mouseToPlayer = mousePos.clone().subtract(center);

        if (mouseToPlayer.length() > maxRadius) {
            mouseToPlayer = mouseToPlayer.normalize().scale(maxRadius);
        }

        const clampedMousePos = center.clone().add(mouseToPlayer);

        if (mouse.primaryDown) {

            // Loop all items to check for clicks
            for (let item of this.items) {
                if (item.getBounds().contains(clampedMousePos.x, clampedMousePos.y) && !this.isDragging.includes(this.player)) {
                    
                        this.isDragging.push(this.player)

                        if (this.isDropped.includes(this.player)) {
                            this.isDropped.splice(this.isDropped.indexOf(this.player), 1)
                        }
                }
            }

        } else {
            this.isDragging.forEach(element => {
                this.isDropped.push(element)
            });
            this.isDragging = []
        }
        
        // Move currently dragged objects (option to have multiple at once with this?)
        for (let object of this.isDragging) {

            let toTarget = clampedMousePos.clone().subtract(this.player.getCenter())

            const maxSpeed = 3000
            const distance = toTarget.length()
            const speed = Math.min(distance * 10, maxSpeed)
            let desiredVelocity = toTarget.clone().normalize().scale(speed)

            // Smooth velocity changes
            const k = 0.3; 
            object.body.velocity.x += (desiredVelocity.x - object.body.velocity.x) * k
            object.body.velocity.y += (desiredVelocity.y - object.body.velocity.y) * k
        }

        for (let i = this.isDropped.length - 1; i >= 0; i--) {
            const object = this.isDropped[i]

            // Drag
            const k = 0.1;
            object.body.velocity.x -= object.body.velocity.x * k
            object.body.velocity.y -= object.body.velocity.y * k

            // Once item is slowed enough, stop and remove it as a sliding item
            if (object.body.speed < 10) {
                this.isDropped.splice(i, 1)
                object.body.setVelocity(0)
            }
        }

        
    }
}