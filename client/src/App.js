import React, { Component } from 'react';
import logo from './logo.svg';
import io from 'socket.io-client';
import './App.css';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 512;
const TILE_WIDTH = 64;
const TILE_HEIGHT = 64;
 


class Player {

  constructor(ctx, game) {
    this.x = 100;
    this.y = 100;
    this.dirx = 0;
    this.diry = 0;
    this.targetX= 100;
    this.targetY= 100;
    this.health = 100;
    this.coins = 0;
    this.bullets = 0;
    this.medkits = 0;
    this.ctx = ctx;
    this.game = game;
  }

  update = () => {
    this.targetX = this.targetX + this.dirx * 3;
    this.targetY = this.targetY + this.diry * 3;

    // current position
    this.x = this.x + (this.targetX - this.x) * 0.5;
    this.y = this.y + (this.targetY - this.y) * 0.5;
    

    // this.x = this.x + this.dirx * 5;
    // this.y = this.y + this.diry * 5;
  }

  draw = () => {

  this.ctx.drawImage(this.game.images.user0, 0, 0, TILE_WIDTH, TILE_HEIGHT, this.targetX, this.targetY, TILE_WIDTH, TILE_HEIGHT);

  //this.ctx.fillStyle = '#ccc'
  //this.ctx.fillRect(0, 0, 100, 100);

  }
}

class Game {

  constructor(ctx) {
    this.ctx = ctx;
    this.init();
    this.images = {};
    this.layers = [
      [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1
      ]
    ];
    this.players = [
      new Player(ctx, this)
    ];
  };

  // güncelleme ve ekrana yazdırma
  init = async () => {

    const tile0 = await this.loadImage('assets/tiles/0.png');
    const tile1 = await this.loadImage('assets/tiles/1.png');
    const user0 = await this.loadImage('assets/users/0.png');

    this.images = {
      0: tile0, 
      1: tile1,
      user0: user0
    }

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  };

  onKeyDown = event => {
    const keyCode = event.keyCode;
    console.log('key down');

    // LEFT
    if (keyCode === 37) {
      this.players[0].dirx = -1;
    }
    // RIGHT
    else if (keyCode === 39) {
      this.players[0].dirx = 1;
    }
    // UP
    if (keyCode === 38) {
      this.players[0].diry = -1;
    }
    // DOWN
    else if (keyCode === 40) {
      this.players[0].diry = 1;
    }
  }

  onKeyUp = event => {
    const keyCode = event.keyCode;

    console.log('key up');
    if (keyCode === 37 || keyCode === 39) {
      this.players[0].dirx = 0;
    }
    if (keyCode === 38 || keyCode === 40) {
      this.players[0].diry = 0;
    }
  }

  // loads an image to memory using js and returns that image.
  loadImage = (src) => {
    var img = new Image();
    var d = new Promise(function (resolve, reject) {
      img.onload = function () {
        resolve(img);
      }.bind(this);

      img.onerror = function() {
        reject('Could not load image: ' + src)
      }

    }.bind(this));

    img.src = src;
    return d;
  };
  
  update = ()   => {  
    for (var i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      player.update();
    } 

  };
  
  draw = () => {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const cols = CANVAS_WIDTH / TILE_WIDTH;
    const rows = CANVAS_HEIGHT / TILE_HEIGHT;

    for (var i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      
      for (var j = 0; j < rows; j++) {
        for (var k = 0; k < cols; k++) {
          const image = this.images[layer[(j * cols) + k]];
          this.ctx.drawImage(
            image, 0, 0, TILE_WIDTH, TILE_HEIGHT, k * TILE_WIDTH, j*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
        }
      }
    }

    for (var m = 0; m < this.players.length; m++) {
      const player = this.players[m];
      player.draw();
    }

    //this.ctx.drawImage(this.images[0], 0, 0, TILE_WIDTH, TILE_HEIGHT, 0, 0, TILE_WIDTH, TILE_HEIGHT);

     // this.ctx.fillStyle = '#ccc'
     // this.ctx.fillRect(0, 0, 100, 100);


    // TODO: draw every user to the screen


  };

};







class App extends Component {

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();

    this.state = {
      // where the users screen is
      CURRENT_STEP: '',
      isGameRunning: false,
    };
    this.lastLoop = null;
  }

  start = async () => {

    var socket = io('http://localhost:5000');
    socket.on('news', function (data) {
      console.log(data);
      socket.emit('my other event', { my: 'data' });
    });

    if(!this.state.isGameRunning) {
      this.game = new Game(this.getCtx());
      await this.game.init();
      document.onkeydown = this.game.checkKey;
      this.loop();
    }
      this.setState(state => ({isGameRunning: !state.isGameRunning}));
  }


  loop = () => {
    // requestAnimationFrame uses the GPU more???
    requestAnimationFrame(() => {
      const now = Date.now();

      if (now - this.lastLoop > (1000 / 60)) {
        this.game.update();
      }

      this.game.draw();

      this.lastLoop = Date.now();

      if (this.state.isGameRunning) {
        this.loop();
      }
    });

  }

  getCtx = () => this.canvasRef.current.getContext('2d');

  render() {
    return (
      <div style={{height: '100%', backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        
        <button onClick={this.start}> START

        </button>

        <canvas tabindex='1' ref={this.canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>

         
        </canvas>
      </div>
    );
  }
}

export default App;
