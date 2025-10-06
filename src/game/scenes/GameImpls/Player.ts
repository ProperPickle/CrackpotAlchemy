import {Game} from '../Game'
import { itemKeys } from './Item';

function addPlayer(){

    Game.prototype.loadPlayer = function(){
        for(let key of Object.keys(itemKeys)){
            this.load.spritesheet(key, 
                `assets/${key}.png`,
                { frameWidth: 64, frameHeight: 64 }
            );
        }

        this.load.spritesheet('crackpot', 
            'assets/crackpot.png',
            { frameWidth: 64, frameHeight: 64 }
        );
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
            key: 'right_still',
            frames: [ { key: 'crackpot', frame: 5 } ],
            frameRate: 20,
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('crackpot', { start: 23, end: 18 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up_still',
            frames: [ { key: 'crackpot', frame: 23 } ],
            frameRate: 20
        });
        
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('crackpot', { start: 17, end: 12 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down_still',
            frames: [ { key: 'crackpot', frame: 17 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('crackpot', { start: 11, end: 6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'left_still',
            frames: [ { key: 'crackpot', frame: 11 } ],
            frameRate: 20,
        });


        this.anims.create({
            key: 'face',
            frames: [ { key: 'crackpot', frame: 17 } ],
            frameRate: 20,
        });
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
                //this.player.anims.play('face')
            } else {
                this.player.anims.play('up', true)
            }
        } else {
            this.player.anims.play('left', true)
        }

        if (move_dir.length() == 0) {
            if (this.player.anims.currentAnim == this.anims.get('right')) {
                this.player.anims.play('right_still')
            }
            if (this.player.anims.currentAnim == this.anims.get('left')) {
                this.player.anims.play('left_still')
            }
            if (this.player.anims.currentAnim == this.anims.get('up')) {
                this.player.anims.play('up_still')
            }
            if (this.player.anims.currentAnim == this.anims.get('down')) {
                this.player.anims.play('down_still')
            }
        }

        this.player.setVelocity(speed * move_dir.x, speed * move_dir.y);

    }

}
export default addPlayer