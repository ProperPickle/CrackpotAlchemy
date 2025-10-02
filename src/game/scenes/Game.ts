import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;

    constructor ()
    {
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
    #platforms:Phaser.Physics.Arcade.StaticGroup;
    #player:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    create (){
        // loaded via public/assets
        let bg = this.add.image(0, 0, 'sky').setOrigin(0, 0)
        // stretch asset
        bg.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height)

        let star = this.physics.add.staticImage(400, 300, 'star')
        
        this.physics.add.overlap(this.#player, star, function(){
            console.log("o")
            //star.disableBody()
        });

        this.#platforms = this.physics.add.staticGroup();

        this.#platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        this.#platforms.create(600, 400, 'ground');
        this.#platforms.create(50, 250, 'ground');
        this.#platforms.create(750, 220, 'ground');

        //different way of defining private variables. no this.player, however variable is scoped to create(){}
        this.#player = this.physics.add.sprite(100, 450, 'dude');

        //player physics
        this.#player.setBounce(0.2);
        this.#player.setCollideWorldBounds(true);
        this.#player.setGravityY(400);
        this.physics.add.collider(this.#player, this.#platforms);

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
        
    }

    update(){
        let keyboard = this.input.keyboard
        let cursors;
        if(keyboard!= null)
            cursors = keyboard.createCursorKeys();
        else
            throw new Error("no keyboard")
        
        if (cursors.left.isDown){
            this.#player.setVelocityX(-160);

            this.#player.anims.play('left', true);
        }
        else if (cursors.right.isDown){
            this.#player.setVelocityX(160);

            this.#player.anims.play('right', true);
        }
        else{
            this.#player.setVelocityX(0);

            this.#player.anims.play('turn');
        }

        if (cursors.up.isDown && this.#player.body.touching.down){
            this.#player.setVelocityY(-550);
        }
    }
}
