import { Scene } from 'phaser';
export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;

    isDragging: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = []
    isThrown: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = []

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
    item:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    item2:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    create (){
        // loaded via public/assets
        let bg = this.add.image(0, 0, 'sky').setOrigin(0, 0)
        // stretch asset
        bg.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height)

        // Defining the item
        this.item = this.physics.add.sprite(450, 450, 'dude');
        this.item.scale *= 2

        this.item.setBounce(0.2);
        this.item.setCollideWorldBounds(true);

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.item.anims.play('turn');

        this.items.push(this.item)

        // Defining the item2
        this.item2 = this.physics.add.sprite(600, 450, 'dude');
        this.item2.scale *= 2

        this.item2.setBounce(0.2);
        this.item2.setCollideWorldBounds(true);

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.item2.anims.play('turn');

        this.items.push(this.item2)
    }

    update() {
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

        this.repelObjects(this.items, 50, 20); // tweak radius and strength

        if (mouse.primaryDown) {

            // Loop all items to check for clicks
            for (let item of this.items) {
                if (item.getBounds().contains(clampedMousePos.x, clampedMousePos.y) && !this.isDragging.includes(item)) {
                    
                        this.isDragging.push(item)

                        if (this.isThrown.includes(item)) {
                            this.isThrown.splice(this.isThrown.indexOf(item), 1)
                        }
                }
            }

        } else {
            this.isDragging.forEach(element => {
                this.isThrown.push(element)
            });
            this.isDragging = []
        }
        
        // Move currently dragged objects (option to have multiple at once with this?)
        for (let object of this.isDragging) {

            let toTarget = clampedMousePos.clone().subtract(object.getCenter())

            const maxSpeed = 4000
            const distance = toTarget.length()
            const speed = Math.min(distance * 10, maxSpeed)
            let desiredVelocity = toTarget.clone().normalize().scale(speed)

            // Smooth velocity changes
            const k = 0.3; 
            object.body.velocity.x += (desiredVelocity.x - object.body.velocity.x) * k
            object.body.velocity.y += (desiredVelocity.y - object.body.velocity.y) * k
        }

        for (let i = this.isThrown.length - 1; i >= 0; i--) {
            const object = this.isThrown[i]

            // Drag
            const k = 0.1;
            object.body.velocity.x -= object.body.velocity.x * k
            object.body.velocity.y -= object.body.velocity.y * k

            // Once item is slowed enough, stop and remove it as a thrown item
            if (object.body.velocity.length() < 10) {
                this.isThrown.splice(i, 1)
                object.body.setVelocity(0)
            }
        }
    }

    repelObjects(objects: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[], repulsionRadius: number, strength: number) {
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            const a = objects[i];
            const b = objects[j];

            const delta = a.body.position.clone().subtract(b.body.position);
            const distance = delta.length();

            if (distance === 0) continue;

            if (distance < repulsionRadius) {
                const force = delta.normalize().scale((repulsionRadius - distance) * strength);

                // apply equal and opposite velocity changes
                a.body.velocity.add(force);
                b.body.velocity.subtract(force);

                if (!this.isDragging.includes(a)) this.isThrown.push(a)
                if (!this.isDragging.includes(b)) this.isThrown.push(b)
            }
        }
    }
}

}