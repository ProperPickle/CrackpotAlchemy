import { Game } from "./scenes/Game.ts";
import { Item, itemKeys } from "./scenes/GameImpls/Item.ts";

// Define an interface for interactable objects
export interface Interactable {
    id: symbol;
    position: { x: number; y: number };
    isActive: boolean;
    state: number;
    interact(): void;
}

class TrashCan extends Phaser.GameObjects.Sprite implements Interactable {
    id: symbol;
    position: { x: number; y: number };
    isActive: boolean;  
    state: number;
    gameScene: Game;
    heldItems: Array<itemKeys>

    constructor(scene: Phaser.Scene, id: string, x: number, y: number, heldItems: Array<itemKeys> = [itemKeys.fries]) {
        const randFrame = Phaser.Math.Between(0, 1) == 1 ? 0 : 2
        super(scene, x, y, 'trash_can', randFrame);
        this.id = Symbol(id);
        this.position = { x, y };
        this.isActive = true;
        this.state = randFrame;
        this.heldItems = heldItems;
        this.gameScene = scene as Game;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        (this.body as Phaser.Physics.Arcade.Body).setImmovable(true);
        this.setInteractive();
        this.on('pointerdown', () => {
            const objX = this.x;
            const objY = this.y;
            const dx = this.gameScene.player.x - objX;
            const dy = this.gameScene.player.y - objY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const triggerRadius = 100;
            if (distance <= triggerRadius) {
                // On-click action within the radius
                this.interact();
            }
        });
    }

    interact(): void {
        if(!this.isActive) return; 
        this.setFrame(++this.state);
        this.isActive = false; // Disable further interactions
        (this.body as Phaser.Physics.Arcade.Body).enable = false;
        //console.log(`Trash can interacted with by player ${playerId}`);
        for(let item of this.heldItems){
            this.gameScene.createItem(this.x, this.y, item);
        }
    }
}
class Bouncer extends Phaser.GameObjects.Sprite implements Interactable {
    id: symbol;
    position: { x: number; y: number };
    isActive: boolean = true;
    state: number = 0;
    gameScene: Game;
    connectedDoor: Door;
    neededItem: itemKeys = itemKeys.can; // Example needed item
    constructor (scene: Phaser.Scene, id: string, x: number, y: number, connectedDoorID: number, neededItem: itemKeys = itemKeys.can) {
        super(scene, x, y, 'bouncer');
        //console.log(connectedDoorID);
        this.id = Symbol(id);
        this.position = { x, y };
        for(const kid of (scene as Game).doors.getChildren()){
            const door = kid as Door;
            if(door.doorId === connectedDoorID){
                this.connectedDoor = door;
                break;
            }
            console.log("Door not found for doorID " + connectedDoorID);
        }
        this.gameScene = scene as Game;
        this.neededItem = neededItem;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        (this.body as Phaser.Physics.Arcade.Body).setImmovable(true);
        this.setInteractive();
        if((scene as Game).itemsGroup != null){
            scene.physics.add.overlap(this, (scene as Game).itemsGroup, (bouncerObj, itemObj) => {
                const item = itemObj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
                if (!item) return;
                if(item.texture.key === this.neededItem && this.isActive) {
                    for (let item of this.gameScene.items) {
                        if (item.sprite === itemObj) {
                            this.gameScene.items.delete(item)
                            itemObj.destroy(true)
                            break;
                        }
                    }
                    this.interact();
                }
            });
        }
    }
    interact(): void {
        if(!this.isActive) return; 
        this.connectedDoor.isActive = true;
        this.connectedDoor.interact();
        this.isActive = false;
        //this.setTexture('bouncer', 'bouncer_happy.png');
    }
}
class Door extends Phaser.GameObjects.Sprite implements Interactable {
    id: symbol;
    position: { x: number; y: number };
    isActive: boolean = false;
    state: number = 0;
    doorId: number;
    gameScene: Game;
    
    constructor (scene: Phaser.Scene, id: string, x: number, y: number, doorId: number, open: boolean = false) {
        super(scene, x, y, 'door', 0);
        this.id = Symbol(id);
        this.position = { x, y };
        this.state = open ? 1 : 0;
        this.gameScene = scene as Game;
        this.doorId = doorId;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        (this.body as Phaser.Physics.Arcade.Body).setImmovable(true);
        this.setInteractive();
        this.anims.create({
            key: 'door_open',
            frames: this.anims.generateFrameNumbers('door', { start: 0, end: 3 }),
            frameRate: 12,
            repeat: 0
        });
        this.anims.create({
            key: 'door_close',
            frames: this.anims.generateFrameNumbers('door', { start: 3, end: 0 }),
            frameRate: 12,
            repeat: 0
        });
        this.on('pointerdown', () => {
            const objX = this.x;
            const objY = this.y;
            const dx = this.gameScene.player.x - objX;
            const dy = this.gameScene.player.y - objY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const triggerRadius = 125;
            if (distance <= triggerRadius) {
                // On-click action within the radius
                this.interact();
            }
        });
    }
    interact(): void {
        if(!this.isActive) return; 
        if(this.frame.name == "0") {
            console.log("open " + this.frame.name);
            this.anims.play('door_open', true);
        } else {
            console.log("close " + this.frame.name);
            this.anims.play('door_close', true);
        }
        this.state=(this.state + 1) % 2;
        (this.body as Phaser.Physics.Arcade.Body).enable = this.state===0;
    }
}

export {TrashCan, Bouncer, Door};