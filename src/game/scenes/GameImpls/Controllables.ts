import {Game} from '../Game'
function addControllables(){
    Game.prototype.createPlayer = function(){
        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setCollideWorldBounds(true);
    }

    Game.prototype.createInteractions = function(){
        this.physics.add.collider(this.player, this.platforms as Phaser.Tilemaps.TilemapLayer);
        this.camera.startFollow(this.player, true, 0.5, 0.5);

        this.physics.world.setBounds(0, 0, this.myMap.widthInPixels, this.myMap.heightInPixels);

        this.physics.add.collider(this.items, this.platforms as Phaser.Tilemaps.TilemapLayer);
    }

    Game.prototype.createItems = function(){
        // Defining the item
        this.item = this.physics.add.sprite(20, 450, 'dude');
        this.item.scale *= 2

        this.item.setBounce(0.2);
        this.item.setCollideWorldBounds(true);

        this.items.push(this.item)

        // Defining the item2
        this.item2 = this.physics.add.sprite(50, 450, 'dude');
        this.item2.scale *= 2

        this.item2.setBounce(0.2);
        this.item2.setCollideWorldBounds(true);

        this.items.push(this.item2)
    }
}

export default addControllables