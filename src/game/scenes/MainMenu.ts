import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(512, 460, 'Play Game', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5)

        this.title.setInteractive().on('pointerdown', () => {
            this.scene.start('Game');
        }).on('pointerover', () => {
            this.title.setFill("#ff4444")
        }).on('pointerout', () => {
            this.title.setFill("#ffffff")
        });


        let fullscreenB = this.add.text(970, 25, 'F', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).on('pointerover', () => {
            fullscreenB.setFill("#ff4444")
        }).on('pointerout', () => {
            fullscreenB.setFill("#ffffff")
        });

        fullscreenB.setInteractive().on('pointerdown', () => {
            if (this.scale.isFullscreen)
                this.scale.stopFullscreen()
            else{
                this.scale.startFullscreen()
            }
            this.scale.refresh()
        })
    }
}
