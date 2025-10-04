import Phaser from 'phaser';

export class Item extends Phaser.Physics.Arcade.Sprite {
    name: string;
    imageKey: string;
    isHeld: boolean = false;
    isThrown: boolean = true;

    constructor(scene: Phaser.Scene, x: number, y: number, name: string, imageKey: string) {
        super(scene, x, y, imageKey);

        this.name = name;
        this.imageKey = imageKey;

        // Enable physics for this sprite
        scene.physics.add.existing(this);

        this.setBounce(0.2);
        this.setCollideWorldBounds(true);

        // Add it to the scene
        scene.add.existing(this);
    }

    drop() {
        this.isHeld = false
        this.isThrown = true
    }

}
