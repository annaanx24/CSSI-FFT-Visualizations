// file created by Kira Tran July 29, 2020
/* global loadSound, createCanvas, background, createButton, stroke, strokeWeight, noStroke, fill, noFill, height, width,
   rect, map, endShape, beginShape, CENTER, textAlign, textFont, millis, vertex, text, p5, soundFormats, textSize, color, 
   colorMode, HSL, userStartAudio, createFileInput, createP, ellipse, TWO_PI, push, translate, rotate, frameCount, pop, 
   input, cos, sin, CLOSE, createVector, random, windowHeight, max
*/

let name, song1, song2, song3, button1, button2, button3;
let mic, micInput;
let localInput, upload, selectedSong, uploadName;
let sound, fft, cutoff, str, avg, backgroundColor, vol, inputType;
let buttonStars, buttonParticle, buttonBars;
let visualType, visualName;
let bass, lowMid, mid, highMid, treble;
let turnOff;

//variables for particles
let particles, peakDetect, analyzer;

function preload() {
  song1 = loadSound(
    "https://cdn.glitch.com/36a23468-291a-4845-aa00-aa0e7c648ccf%2FBTS%20JIMIN%20(%EC%A7%80%EB%AF%BC)%20-%20Promise%20(%EC%95%BD%EC%86%8D)%20(Lyrics%20EngRomHan%EA%B0%80%EC%82%AC).mp3?v=1595881978169"
  );
  song2 = loadSound(
    "https://cdn.glitch.com/36a23468-291a-4845-aa00-aa0e7c648ccf%2FPodington_Bear_-_Starling.mp3?v=1595883050058"
  );
  song3 = loadSound(
    "https://cdn.glitch.com/36a23468-291a-4845-aa00-aa0e7c648ccf%2FShortened%20Audio%20Clip.mp3?v=1595886365326"
  );
}

function setup() {
  let cnv = createCanvas(700, 500);
  colorMode(HSL, 360, 100, 100);
  turnOff = false;

  buttonBars = createButton("Dancing Bars");
  buttonStars = createButton("Dancing Stars");
  buttonParticle = createButton("Particle Waterfall");

  buttonStars.show();
  buttonParticle.show();
  buttonBars.show();

  buttonStars.position(width / 4 - 68, 230);
  buttonParticle.position(width / 4 - 80, 160);
  buttonBars.position(width / 4 - 63, 90);

  buttonStars.mousePressed(function() {
    visualName = "Stars";
    visualType = 3;
  });
  buttonParticle.mousePressed(function() {
    visualName = "Particles";
    visualType = 2;
  });
  buttonBars.mousePressed(function() {
    visualName = "Bars";
    visualType = 1;
  });

  button1 = createButton("Promise - BTS");
  button2 = createButton("Starling - Podington Bear");
  button3 = createButton("Short Instrumental");

  button1.show();
  button2.show();
  button3.show();

  button1.position((3 * width) / 4 - 63, 90);
  button2.position((3 * width) / 4 - 105, 160);
  button3.position((3 * width) / 4 - 73, 230);

  button1.mousePressed(function() {
    sound = song1;
    name = "Promise";
    fft.setInput(sound);
    inputType = 1;
  });
  button2.mousePressed(function() {
    sound = song2;
    name = "Starling";
    fft.setInput(sound);
    inputType = 1;
  });
  button3.mousePressed(function() {
    sound = song3;
    name = "Instrumental";
    fft.setInput(sound);
    inputType = 1;
  });

  mic = new p5.AudioIn();
  micInput = createButton("Microphone Input");
  micInput.show();
  micInput.position((3 * width) / 4 - 73, 300);
  micInput.mousePressed(function() {
    name = "Microphone";
    fft.setInput(mic);
    inputType = 3;
  });

  localInput = createButton("Select Local File");
  localInput.show();
  localInput.position((3 * width) / 4 - 70, 370);
  localInput.mousePressed(function() {
    if (selectedSong !== undefined) {
      sound = selectedSong;
      name = uploadName;
    }
    upload.show();
    fft.setInput(sound);
    inputType = 2;
  });
  upload = createFileInput(handleFile);
  upload.attribute('accept', '.mp3, .wav');
  upload.position(width / 2 - 70, height - 60);
  upload.hide();

  cnv.mouseClicked(togglePlay);
  fft = new p5.FFT();
  str = "play";
  name = "none";
  avg = 20;
  vol = new p5.Amplitude();

  //setup variables for particle waterfall
  particles = [];

  // Patch the input to an volume analyzer
  vol.setInput(sound);
}

function draw() {
  let lightness = 20 + 25 * vol.getLevel();
  let hue = (millis() / 40) % 360;
  backgroundColor = color(lightness);
  background(backgroundColor);

  let spectrum = fft.analyze();
  switch (visualType) {
    case 1:
      //kira's visualization
      cutoff = spectrum.length - 400;
      strokeWeight(0.5);
      stroke(6);
      fill(hue, 78, 64);

      for (let i = 0; i < cutoff; i += avg) {
        let x = map(i, 0, cutoff, 0, width);
        let h = 0;
        for (let j = 0; j < avg; j++) {
          h += -height + map(spectrum[i + j], 0, 255, height, 0);
        }
        h /= avg;
        rect(x, height, (avg * width) / cutoff, h, 0, 0, 20, 20);
      }
      break;
    case 2:
      //Victoria's visualization code

      // Get the average (root mean square) amplitude
      if (!turnOff) {
        
        let rms = vol.getLevel();

        //fill(255, 0, 255);
        for (let i = 0; i < spectrum.length; i++) {
          //spread is how far out the particles would go, proportional to how loud the music is
          let spread = map(spectrum[i], 0, max(spectrum), 0, width);

          let particle = new Particle(spread, 200 * rms);
          particles.push(particle);
        }

        for (let i = 0; i < particles.length; i++) {
          particles[i].move();
          particles[i].oscillate();
          particles[i].draw();
          if (!particles[i].onScreen) {
            particles.splice(i, 1);
          }
        }
      }
      break;
    case 3:
      //Anna's visualization code
      noFill();
      strokeWeight(5);
      stroke(6, 82.8, 77.3);

      push();
      translate(width / 2, height / 2);
      rotate(frameCount / 80);
      bass = new Shape("bass", fft.getEnergy("bass"));
      bass.star(0, 0, 30, 70, 5);

      stroke(53, 83, 77);
      lowMid = new Shape("lowMid", fft.getEnergy("lowMid"));
      lowMid.star(0, 0, 30, 70, 5);

      stroke(140, 83, 77);
      mid = new Shape("mid", fft.getEnergy("mid"));
      mid.star(0, 0, 30, 70, 5);

      stroke(223, 83, 77);
      highMid = new Shape("highMid", fft.getEnergy("highMid"));
      highMid.star(0, 0, 30, 70, 5);

      stroke(288, 83, 77);
      treble = new Shape("treble", fft.getEnergy("treble"));
      treble.star(0, 0, 30, 70, 5);

      pop();
      break;
    default:
      visualName = "none";
  }
  fill(90);
  strokeWeight(1);
  stroke(0, 0, 0);
  textFont("Georgia");
  textSize(24);
  text(`tap to ${str}`, 5, 30);
  textSize(16);
  text(`input selected: ${name}`, width - 250, 27);
  text(`visualization selected: ${visualName}`, width - 300, 55);
}

function togglePlay() {
  if (inputType === 3) {
    if (str === "pause") {
      mic.stop();
      start();
    } else {
      mic.start();
      stop();
    }
    return;
  }
  if (sound.isPlaying()) {
    sound.pause();
    turnOff = true;
    start();
  } else {
    sound.loop();
    turnOff = false;
    stop();
  }
}

function start() {
  str = "play";
  button1.show();
  button2.show();
  button3.show();
  micInput.show();
  localInput.show();

  buttonStars.show();
  buttonParticle.show();
  buttonBars.show();
}

function stop() {
  str = "pause";
  button1.hide();
  button2.hide();
  button3.hide();
  micInput.hide();
  localInput.hide();

  buttonStars.hide();
  buttonParticle.hide();
  buttonBars.hide();

  upload.hide();
}

function handleFile(file) {
  if (file.type === "audio") {
    selectedSong = loadSound(URL.createObjectURL(file.file));
    sound = selectedSong;
    uploadName = file.subtype + " file";
    name = uploadName;
  } else {
    name = "invalid file";
  }
}

class Shape {
  constructor(name, amp) {
    this.name = name;
    this.amp = amp;
    this.x = width / 2;
    this.y = height / 2;
  }

  display() {
    ellipse(this.x, this.y, this.amp * 2);
  }

  star(x, y, radius1, radius2, npoints) {
    radius1 *= this.amp * 0.02;
    radius2 *= this.amp * 0.02;
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius2;
      let sy = y + sin(a) * radius2;
      vertex(sx, sy);
      sx = x + cos(a + halfAngle) * radius1;
      sy = y + sin(a + halfAngle) * radius1;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }
}

class Particle {
  constructor(spread, amplitude) {
    this.position = createVector(random(spread), random(height / 2));
    this.velocity = createVector(0, random(1, 50));
    this.color = [random(0, 360), random(0, 100), random(0, 100)];
    this.defaultRadius = random(0, amplitude); //value that radius will oscillate around
    this.radius = this.defaultRadius;
    this.onScreen = true; //variable to indicate whether the ball should remain on the screen
    this.amountToAdd = 0;
    this.increase = true;
  }

  //draws particle on the canvas
  draw() {
    fill(this.color);
    ellipse(this.position.x, this.position.y, this.radius);
  }

  move() {
    this.position.add(this.velocity);
    if (this.position.y > height) {
      this.velocity.y = 0;
      this.onScreen = false;
    }
  }

  // make radius of the particle oscillate
  oscillate() {
    this.radius =
      this.defaultRadius + (this.defaultRadius / 3) * this.amountToAdd;

    if (this.increase) {
      this.amountToAdd = this.amountToAdd + 0.20;
      if (this.amountToAdd >= 1) {
        this.increase = false;
      }
    } else {
      this.amountToAdd = this.amountToAdd - 0.20;

      if (this.amountToAdd <= -1) {
        this.increase = true;
      }
    }
  }
}
