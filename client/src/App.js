import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 512;
const TILE_WIDTH = 64;
const TILE_HEIGHT = 64;



const Player = {
  x: 0,
  y: 0,
  dirx: 0,
  diry: 0,
  health: 100,
  coins: 0,
  bullets: 0,
  medkits:0,

};

class Game {

  images = {};

  layers = [
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

  constructor(ctx) {
    this.ctx = ctx;
    this.init();
  };

  // güncelleme ve ekrana yazdırma
  init = async () => {

    const tile0 = await this.loadImage('assets/tiles/0.png');
    const tile1 = await this.loadImage('assets/tiles/1.png');

    this.images = {
      0: tile0, 
      1: tile1
    }
  };

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
  
  update = () => {
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
    if(!this.state.isGameRunning) {
      this.game = new Game(this.getCtx());
      await this.game.init();
      this.loop();
    }
      this.setState(state => ({isGameRunning: !state.isGameRunning}));
  }

  loop = () => {
    // requestAnimationFrame uses the GPU more???
    requestAnimationFrame(() => {
      const now = Date.now();

      if (now - this.lastLoop > (1000 / 30)) {
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

        <canvas ref={this.canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>

         
        </canvas>
      </div>
    );
  }
}

export default App;
