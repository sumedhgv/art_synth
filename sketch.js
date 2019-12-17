/*waterdrop synth
*/

var canvasHeight;
var canvasWidth;

var metronomeSound; // sound object
var metronomeEnv; // envelope object

var bpm;
var beatDivisions; // clicks will be rounded to this number of beat divisions. (probably ~16)
var beatLength; // in milliseconds
var loopLength; // in beats
var nextLoop;  // in millis()
var loopCount;
var nextClick;

var instrument = [];
var metronomeOn;

var reverb, delay
var cVerb

function setup() {

  canvasHeight = 600;
  canvasWidth = 600;
  createCanvas(canvasWidth, canvasHeight);
  noStroke();
  textSize( 24 );
  textAlign( CENTER );

  metronomeOn = true;
  bpm = 60;
  beatDivisions = 16;
  beatLength = 60/bpm * 1000;
  nextClick = 0;
  loopLength = 4 * 60/bpm * 1000; // in milliseconds
  nextLoop = 0;
  loopCount = 0;


  metronomeEnv = new p5.Envelope();



  reverb = new p5.Reverb()
  delay = new p5.Delay();


}

function draw() {
  fill(30, 50)
  rect(0, 0, width, height)

   if( millis() > nextClick ) {
      if( metronomeOn) { playClick(); }
      nextClick = nextClick + beatLength;
   }

   if( millis() > nextLoop ) {
      nextLoop = nextLoop + loopLength;
      fill( 200, 50, 50 );
      circle( canvasWidth/2, canvasHeight/2, 90 );
      loopCount++;
   }

   var currentLoopTime = nextLoop + millis();
   instrument.forEach( function( arrayItem ) {
       if( millis() > nextLoop - arrayItem.loopOffset && arrayItem.loopIndex < loopCount ) {
       arrayItem.play();
       arrayItem.draw();
     } } );


    stroke( 100 );
    fill( 100 );
    text( " Waterdrop Echo Synth", canvasWidth/2, 20 );
    text( " By Sumedh Vedanthi", canvasWidth/2, 40 );
    text( "press any key to clear", canvasWidth/2, 60 );

    text( "click to play a note", canvasWidth/2, canvasHeight - 30 );

  text( instrument.length, canvasWidth/2, canvasHeight - 50 );
}

function mouseClicked() {
  instrument.push(new Instrument(mouseX,map(mouseY, canvasHeight,0.0, 0.5, 1.0),nextLoop - millis()));
  instrument[instrument.length-1].play();
}

function keyPressed() {
  instrument.length = 0;
  if( key === ' ' ) {
    if( metronomeOn === true ) { metronomeOn = false; } else { metronomeOn = true; }
  }
}


function playClick() {
  fill( 200, 50, 50 );
  circle( canvasWidth/2, canvasHeight/2, 50 );
  metronomeEnv.setADSR(0.01, 0.05, 0.1, 0.15);
  metronomeEnv.play();
}



/* classes */
class Instrument {

  constructor(pitch, amp, offset){
    this.pitch = pitch;
    this.env = new p5.Envelope();
    this.env.setRange(amp,0);
    this.sound = new p5.Oscillator("sine");
    this.sound.amp(this.env);
    this.sound.freq(this.pitch);
    this.sound.start();
    let beatError = offset % beatLength/beatDivisions; // timing error from "maximum error" allowed
    if( beatError > beatLength/beatDivisions/2 ) { offset += beatLength/beatDivisions - beatError; } else { offset -= beatError; } // round up or down to align note to beat division
    this.loopOffset = offset; // milliseconds *from END of loop*
    this.loopIndex = 0;
    this.x = mouseX;
    this.y = mouseY;
    print(offset);

  }

  play() {
    this.env.setADSR(0.01, 0.05, 0.1, 0.15);

    //Add effects
    reverb.process(this.sound)
    delay.process(this.sound, 0.5, 0.5, 1000);


    this.env.play();
    this.loopIndex = loopCount;
  }

  draw() {
      fill( 250 );
      circle( this.x, this.y, 30 );
  }

}
