import {Game} from '../Game'

function addUI():void{
    Game.prototype.loadUIAssets = function(){
        this.load.image('banner', 'assets/banner_classic_curtain.png');
        this.load.image('panel', 'assets/panel_grey_dark.png');
        
        
    }

    Game.prototype.showPopup = function(message: string, x, y, width, height, duration = 2000, fontSize: number) {
        // Create a resizable textured panel
        const panel = createResizablePanel(this, 'panel', width, height, 12);

        // Start off-screen (right side)
        panel.setPosition(x-width, y)
        .setScrollFactor(0) // so it stays in place on screen
        .setDepth(1000);    // render above gameplay

        // Add some centered text
        const text = this.add.text(width/2, height/2, message, {
            fontFamily: 'Arial',
            fontSize: fontSize + 'px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: width - fontSize * 2 }
        }).setOrigin(0.5);

        panel.add(text);
        this.add.existing(panel);

        this.tweens.add({
            targets: panel,
            x: x - panel.width,     // final on-screen x position
            ease: 'Cubic.Out',
            duration: 600,
        });

        if (duration == -1) return

        this.time.delayedCall(duration, () => {
            this.tweens.add({
                targets: panel,
                x: -3000,  // slide off-screen again
                ease: 'Cubic.In',
                duration: 500,
                onComplete: () => panel.destroy(),
            });
        });
    }




}
export default addUI


export function createResizablePanel(
    scene: Phaser.Scene,
    key: string,
    width: number,
    height: number,
    edgeSize: number
) {
    const texture = scene.textures.get(key);
    const source = texture.getSourceImage();
    const texWidth = source.width;
    const texHeight = source.height;

    const container = scene.add.container(0, 0);

    // --- Corners ---
    const tl = scene.add.image(0, 0, key)
        .setCrop(0, 0, edgeSize, edgeSize)
        .setOrigin(0);
    const tr = scene.add.image(width - texWidth, 0, key)
        .setCrop(texWidth - edgeSize, 0, edgeSize, edgeSize)
        .setOrigin(0);
    const bl = scene.add.image(0, height - texHeight, key)
        .setCrop(0, texHeight - edgeSize, edgeSize, edgeSize)
        .setOrigin(0);
    const br = scene.add.image(width - texWidth, height - texHeight, key)
        .setCrop(texWidth - edgeSize, texHeight - edgeSize, edgeSize, edgeSize)
        .setOrigin(0);

    container.add([tl, tr, bl, br]);

    // --- Edges ---
    const hTileWidth = texWidth - 2 * edgeSize;
    const vTileHeight = texHeight - 2 * edgeSize;

    // Top and bottom edges
    let x = edgeSize;
    while (x < width - edgeSize) {
        const w = Math.min(hTileWidth, width - edgeSize - x);
        const topTile = scene.add.image(x-edgeSize, 0, key)
            .setCrop(edgeSize, 0, w, edgeSize)
            .setOrigin(0);
        const bottomTile = scene.add.image(x-edgeSize, height - texHeight, key)
            .setCrop(edgeSize, texHeight - edgeSize, w, edgeSize)
            .setOrigin(0);

        container.add([topTile, bottomTile]);
        x += w;
    }

    // Left and right edges
    let y = edgeSize;
    while (y < height - edgeSize) {
        const h = Math.min(vTileHeight, height - edgeSize - y);
        const leftTile = scene.add.image(0, y-edgeSize, key)
            .setCrop(0, edgeSize, edgeSize, h)
            .setOrigin(0);
        const rightTile = scene.add.image(width - texWidth, y-edgeSize, key)
            .setCrop(texWidth - edgeSize, edgeSize, edgeSize, h)
            .setOrigin(0);

        container.add([leftTile, rightTile]);
        y += h;
    }

    // --- Center tiles ---
    y = edgeSize;
    while (y < height - edgeSize) {
        const h = Math.min(vTileHeight, height - edgeSize - y);
        x = edgeSize;
        while (x < width - edgeSize) {
            const w = Math.min(hTileWidth, width - edgeSize - x);
            const centerTile = scene.add.image(x-edgeSize, y-edgeSize, key)
                .setCrop(edgeSize, edgeSize, w, h)
                .setOrigin(0);
            container.add(centerTile);
            x += w;
        }
        y += h;
    }

    return container;
}



