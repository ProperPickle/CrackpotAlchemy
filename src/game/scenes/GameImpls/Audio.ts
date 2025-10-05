import {Game} from '../Game'
function addAudio(){
    Game.prototype.loadAudio = function(){
        this.load.audio("craft", ["assets/craft.mp3"]);
        this.load.audio("cart", ["assets/cart.mp3"]);
    }

    Game.prototype.createAudio = function () {
        this.craftSound = this.sound.add('craft', {loop:false})
        this.cartSound = this.sound.add('cart', {loop:false, volume:1.5});
    }
}
export default addAudio