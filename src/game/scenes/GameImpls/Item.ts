import Phaser from 'phaser';
import { Game } from '../Game';

export enum itemKeys{
    rat = "rat",
    can = "can",
    fries = "fries",
    happy_pot = "happy_pot",
    sad_pot = "sad_pot",
    angry_pot = "angry_pot",
    death_pot = "death_pot",
    jelly_pot = "jelly_pot"    
}

export class Item {
    name: itemKeys;
    scene: Game;
    imageKey: string;
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    isHeld: boolean = false;
    isThrown: boolean = true;
    id: Symbol
    body: Phaser.Physics.Arcade.Body;

    constructor(scene: Phaser.Scene, x: number, y: number, name: itemKeys, imageKey: string) {
        //super(scene, x, y, imageKey);

        this.name = name;
        this.scene = scene as Game;
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

    deleteItem(item: Item) {
        Game.prototype.items.delete(item)
        item.sprite.destroy(true)
    }

    static createFromKey(scene: Phaser.Scene, x: number, y: number, key: itemKeys){
        return new Item(scene, x, y, key, key)
    }


    drop() {
        this.isHeld = false
        this.isThrown = true
    }

    isOccluded(buffer: number = 8) {
        //if (item.body == null) return false
        const from = this.scene.player.body.position;
        const to = this.body.position;

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
            const tile = this.scene.platforms.tilemap.getTileAtWorldXY(
                current.x, current.y, true, this.scene.camera, this.scene.platforms.layerIndex);
            if (tile && tile.collides) {
                return true; // wall detected between player and item
            }
        }

        return false; // no wall in between
    }

}

export function checkCraft(a:itemKeys, b:itemKeys):itemKeys | null{
    switch(a){
        case itemKeys.fries:
            switch(b){
                case itemKeys.rat:
                    return itemKeys.can;
                case itemKeys.can:
                    return itemKeys.happy_pot;
            }    
        break;
    }
    return null;
}

export function repelItems(items: Set<Item>, repulsionRadius: number, strength: number) {
        // Convert set to array for index-based iteration
        const itemArray = Array.from(items);

        for (let i = 0; i < itemArray.length; i++) {
            for (let j = i + 1; j < itemArray.length; j++) {
                const a = itemArray[i];
                const b = itemArray[j];
                const itemA = a as Item;
                const itemB = b as Item;

                const delta = itemA.body.position.clone().subtract(itemB.body.position);
                const distance = delta.length();

                if (distance === 0) {
                    const force = Phaser.Math.RandomXY(new Phaser.Math.Vector2());

                    itemA.body.velocity.add(force);
                    itemB.body.velocity.subtract(force);

                }

                if (distance < repulsionRadius) {
                    const force = delta.normalize().scale((repulsionRadius - distance) * strength);

                    itemA.body.velocity.add(force);
                    itemB.body.velocity.subtract(force);

                }
            }
        }
    }