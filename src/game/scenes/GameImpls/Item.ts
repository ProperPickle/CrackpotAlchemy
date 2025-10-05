import Phaser from 'phaser';

export enum itemKeys{
    rat = "rat",
    can = "can",
    fries = "fries",
    dude = "dude"
}

export class Item {//extends Phaser.Physics.Arcade.Sprite {
    name: itemKeys;
    imageKey: string;
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    isHeld: boolean = false;
    isThrown: boolean = true;
    id: Symbol
    body: Phaser.Physics.Arcade.Body;

    constructor(scene: Phaser.Scene, x: number, y: number, name: itemKeys, imageKey: string) {
        //super(scene, x, y, imageKey);

        this.name = name;
        this.imageKey = imageKey;

        // Enable physics for this sprite
        this.sprite = scene.physics.add.sprite(x, y, imageKey);

        this.sprite.setBounce(0.2);
        this.sprite.setCollideWorldBounds(true);

        // Add it to the scene
        //scene.add.existing(this);

        this.body = this.sprite.body

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

export function checkCraft(a:itemKeys, b:itemKeys):itemKeys | null{
    switch(a){
        case itemKeys.can: break;
    }
    return null;
}