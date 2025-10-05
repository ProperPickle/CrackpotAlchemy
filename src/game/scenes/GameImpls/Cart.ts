import {Game} from '../Game'
import { Item } from './Item';
function addCart(){
    Game.prototype.loadCart = function(){
        this.load.spritesheet('cart', 
            'assets/bomb.png',
            { frameWidth: 64, frameHeight: 64 }
        );
    }

    Game.prototype.createCart = function(){
        this.cart = this.physics.add.sprite(400, 400, 'cart').setScale(2)

        this.physics.add.collider(this.cart, this.platforms);
        this.physics.add.collider(this.cart, this.player);

        this.cart.setDamping(false)
        this.cart.setDrag(.5)

        this.cart.setInteractive().on('pointerdown', ()=>{
            function rand(min: number, max: number): number {
                return Math.random() * (max - min) + min;
            }

            function rSign(n: number): number{
                return Math.random()<.5?-n:n
            }
            
            const min_buffer = 35
            const max_buffer = 60;

            this.hiddenItems.forEach((e:Item)=>{
                e.sprite.setPosition(this.cart.x+rSign(rand(min_buffer,max_buffer)),
                             this.cart.y+rSign(rand(min_buffer,max_buffer)))
                e.sprite.setActive(true).setVisible(true)
            })
            this.hiddenItems.clear()
        })
    }

    Game.prototype.slowCart = function(){
        let vx = this.cart.body.velocity.x
        let vy = this.cart.body.velocity.y
        this.cart.setAccelerationX(-vx*.75)   
        this.cart.setAccelerationY(-vy*.75)
        if(vx*vx+vy*vy<2){
            this.cart.body.setVelocity(0,0)
        }    
    }
}
export default addCart