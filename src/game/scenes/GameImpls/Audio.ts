import {Game} from '../Game'
function addAudio(){
    Game.prototype.loadAudio = function(){
        this.load.audio("craft", ["assets/craft.mp3"]);
    }

    Game.prototype.createAudio = function () {
        this.craftSound = this.sound.add('craft', {loop:false})
        console.log(this.craftSound)
    }
}
export default addAudio