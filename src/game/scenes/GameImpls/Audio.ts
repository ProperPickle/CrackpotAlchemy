import {Game} from '../Game'
import { Preloader } from '../Preloader';
export const numThemes = 3;
let audioOn:boolean = true;


export function addAudioLoader(){
    Preloader.prototype.loadAudio = function(){
        this.load.audio("craft", ["assets/craft.mp3"]);
        this.load.audio("cart", ["assets/cart.mp3"]);
        for (let index = 0; index < numThemes; index++) {
            this.load.audio("theme"+index, ["assets/theme"+index+".mp3"])  
        }
    }
}

function addAudio(){
    

    Game.prototype.createAudio = function () {
        this.craftSound = this.sound.add('craft', {loop:false})
        this.cartSound = this.sound.add('cart', {loop:false, volume:1.5});
        for(let i = 0; i<numThemes; i++){
            this.themes.push(this.sound.add('theme'+i, {loop:false}))
        }

        let currentSongIndex = 0;

        const playNextSong = () => {
            if (currentSongIndex < this.themes.length) {
                const currentSong = this.themes[currentSongIndex];

                currentSong.once('complete', () => {
                    currentSongIndex++;
                    if(audioOn)
                        playNextSong(); // Play the next song when the current one completes
                });

                currentSong.play();
            } else {
                currentSongIndex = 0;
                playNextSong();
            }
        };

        if(audioOn)
            playNextSong();
    }
}

export type phaserAudio = Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

export default addAudio