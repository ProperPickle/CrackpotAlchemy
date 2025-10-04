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
    //#platforms:Phaser.Physics.Arcade.StaticGroup;
    player:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    create (){
        // loaded via public/assets
        let bg = this.add.image(0, 0, 'sky').setOrigin(0, 0)
        // stretch asset
        bg.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height)

        //let star = this.physics.add.staticImage(400, 300, 'star')

        //different way of defining private variables. no this.player, however variable is scoped to create(){}
        this.player = this.physics.add.sprite(450, 450, 'dude');
        this.player.scale *= 2
        this.player.setMaxVelocity(3000)

        /*
        this.physics.add.overlap(this.player, star, function(){
            star.destroy(true)
        });
        */
        //player physics
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(0);
        //this.physics.add.collider(this.player, this.#platforms);


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

        this.player.anims.play('turn');

        this.items.push(this.player)
        
    }

    update() {
        const mouse = this.input.mousePointer;
        if (!mouse) return;

        const center = new Phaser.Math.Vector2(this.sys.canvas.width/2, this.sys.canvas.height/2);
        const maxRadius = 200;

        let target = new Phaser.Math.Vector2(mouse.x, mouse.y);

        let offset = target.clone().subtract(center);

        if (offset.length() > maxRadius) {
            offset = offset.normalize().scale(maxRadius);
        }

        const clampedPos = center.clone().add(offset);

        if (mouse.primaryDown) {
            for (let item of this.items) {
                if (item.getBounds().contains(mouse.x, mouse.y)) {
                    if (!this.isDragging.includes(this.player)) {
                        this.isDragging.push(this.player)
                        if (this.isDropped.includes(this.player)) {
                            this.isDropped.splice(this.isDropped.indexOf(this.player), 1)
                        }
                    }
                }
            }
        } else {
            this.isDragging.forEach(element => {
                this.isDropped.push(element)
            });
            this.isDragging = []
        }
        

        for (let object of this.isDragging) {

            let toTarget = clampedPos.clone().subtract(this.player.getCenter())

            const maxSpeed = 3000
            const distance = toTarget.length()
            const speed = Math.min(distance * 10, maxSpeed)
            let desiredVelocity = toTarget.clone().normalize().scale(speed)

            const k = 0.3; 
            object.body.velocity.x += (desiredVelocity.x - object.body.velocity.x) * k
            object.body.velocity.y += (desiredVelocity.y - object.body.velocity.y) * k

        }

        for (let i = this.isDropped.length - 1; i >= 0; i--) {
            const object = this.isDropped[i]

            const k = 0.1;
            object.body.velocity.x -= object.body.velocity.x * k
            object.body.velocity.y -= object.body.velocity.y * k

            if (object.body.speed < 10) {
                this.isDropped.splice(i, 1)
                object.body.setVelocity(0)
            }
        }


        
    }

    clickWithinRadius(sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, radius: number) {
        return sprite.scene.input.mousePointer.position.distance(
            new Phaser.Math.Vector2(sprite.x, sprite.y))
            <= radius

    }
}