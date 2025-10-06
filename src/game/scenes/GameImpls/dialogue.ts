import { Game } from "../Game";

function addDialogue(){
    Game.prototype.writeDialogue = function(npc: Phaser.GameObjects.Sprite, name:string|Array<string>, words:Array<string>, interpret?:Array<string>, duration:number = 3000){
        let n = 0;
        if(typeof name == "string")
            name = new Array(words.length).fill(name)
        npc.setInteractive().on('pointerup', () => {
            let showCurPop = () => {
                console.log(n);
                if(n>=words.length)
                    return;
                let message = words[n++]
                if(interpret&&interpret[n]!=undefined)
                    message = message+"\n*"+interpret[n]+"*"
                this.showPopup(message,
                10, this.camera.height - 210, this.camera.width - 20, 200, duration, 30,
                name[n],showCurPop)
            }
            showCurPop();
        })
    }
}
export {addDialogue}