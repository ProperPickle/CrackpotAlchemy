import Phaser from 'phaser';

export enum itemKeys{
    rat = "rat",
    can = "can",
    fries = "fries",
    dude = "dude"
}

export class Item extends Phaser.Physics.Arcade.Sprite {
    name: string;
    imageKey: string;
    isHeld: boolean = false;
    isThrown: boolean = true;
    id: Symbol

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

        this.id = Symbol(name);
    }

    static createFromKey(scene: Phaser.Scene, x: number, y: number, key:itemKeys){
        return new Item(scene, x, y, key, key)
    }

    drop() {
        this.isHeld = false
        this.isThrown = true
    }

}
