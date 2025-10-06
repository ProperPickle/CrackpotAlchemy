import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    playB: GameObjects.Image;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'title');

        this.playB = this.add.image(512, 400, 'startB').setOrigin(0.5)

        this.playB.setInteractive().on('pointerdown', () => {
            this.scene.start('Game');
        })
        //.on('pointerover', () => {
        //     this.playB.setFill("#ff4444")
        // }).on('pointerout', () => {
        //     this.playB.setFill("#ffffff")
        // });
    }
}
