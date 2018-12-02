// store our current color values
let r = 0;
let g = 0;
let b = 255;

let drawing = false;
let drawCircle = true;

function setup() {
  // setup canvas and place it in the DOM container
  const theCanvas = createCanvas(800, 600);
  theCanvas.parent('#canvas-container');

  // make background black and remove shape strokes
  background(0);
  noStroke();

  // rectangles will draw from the center
  rectMode(CENTER);
}

function draw() {
  // only draw an ellipse after user clicks
  if (drawing) {
    // set fill color
    fill(r,g,b);

    // draw the ellipse or square
    if (drawCircle) {
      ellipse(mouseX, mouseY, 20, 20);
    }
    else {
      rect(mouseX, mouseY, 20, 20);
    }
  }
}

function mousePressed() {
  // change boolean
  drawing = !drawing;
}

function keyPressed() {
  // make background black
  if (key == 'B') {
    background(0);
  }
  // draw circles
  else if (key == 'C') {
    drawCircle = true;
  }
  // draw squares
  else if (key == 'Q') {
    drawCircle = false;
  }
  // change to random rgb values
  else if (key == 'R') {
    r = random(255);
    g = random(255);
    b = random(255);
  }
  // download image if user presses S
  else if (key == 'S') {
    save('sketch.png');
  }
  // clear canvas and make background white
  else if (key == 'W') {
    background(255);
  }
}
