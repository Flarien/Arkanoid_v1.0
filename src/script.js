const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d"); //contexto del dibujo

const $sprite = document.querySelector("#sprite");
const $bricks = document.querySelector("#bricks");

canvas.width = 448;
canvas.height = 400;

/***********************************************/
//------------VARIABLES DE LA PELOTA
//tamaño de la bola
const ballRadius = 3;

let x = canvas.width / 2; //posición horizontal
let y = canvas.height - 30; //posición vertical

//velocidad de la pelota (ayudará a modificar el ángulo en el que saldrá la pelota al golpear la pala)
let dx = -3;
let dy = -3;

//------------ VARIABLES DE LA PALETA(navecita?)
//Tamaño de la paleta
const paddleHeight = 10;
const paddleWidth = 50;

let paddleX = (canvas.width - paddleWidth) / 2; //posición horizontal, en el centro
let paddleY = canvas.height - paddleHeight - 10; //posición vertical

//indicarán si la tecla está pulsada o no
let rightPressed = false;
let leftPressed = false;

//sensibilidad del movimiento de la paleta
const PADDLE_SENSITBITY = 10;

//------------VARIABLES DE LOS LADRILLOS
const bricksRowCount = 6;
const brickColumnCount = 13;
const brickWidth = 31;
const brickHeight = 16;
const brickPadding = 1;
const brickOffSetTop = 80;
const brickOffSetLeft = 16;
const bricks = [];

const BRICK_STATUS = {
  ACTIVE: 1,
  DESTROYED: 0,
};

for (let c = 0; c < brickColumnCount; c++) {
  //c hace referencia a columna
  bricks[c] = []; // El array vacío van a ser los ladrillos.  Tendrá filas y columnas (matriz) En la primer iteración se repiten el n° de columnas totales y luego el n° de filas dentro de c/u

  for (let r = 0; r < bricksRowCount; r++) {
    //r hace referencia a row/fila
    const brickX = c * (brickWidth + brickPadding) + brickOffSetLeft; // para calcular la posición del ladrillo en la pantalla, multiplicará en cada columna  el ancho del ladrillo + el espacio entre ellos + el margen inicial. Lo mismo debajo para el alto:
    const brickY = r * (brickHeight + brickPadding) + brickOffSetTop;

    //asigna color aleatorio para cada ladrillo
    const random = Math.floor(Math.random() * 8); //floor inicia en 0

    //Guarda la info de cada ladrillo
    bricks[c][r] = {
      x: brickX,
      y: brickY,
      status: BRICK_STATUS.ACTIVE,
      color: random,

      ///////////---> En vez de que sea random, se debería crear patrices para cada nivel
    };
  }
}

/***********************************************/

//funciones de dibujo de la pelota y paleta
function drawBall() {
  ctx.beginPath(); //---> Inicia el trazado
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2); //le paso las props de posición, radio, ángulo (0) y uso el método Math para darle la forma circular
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath(); //---> Termina el trazado
}

function drawPaddle() {
  //crea la paleta. el fillRect suplanta el beginPath/closePath
  // ctx.fillRect(
  //   paddleX, // coordenada X
  //   paddleY, //coordenada Y
  //   paddleWidth, //ancho del dibujo
  //   paddleHeight //alto del dibujo
  // );

  //dibuja con una imagen
  ctx.drawImage(
    //saca la immagen del "sprite", siguiendo las coordenadas para cargar
    $sprite, //imagen
    29, //coordenada de recorte en X
    174, //coordenada de recorte en Y
    paddleWidth, //tanaño del recorte
    paddleHeight, //tanaño del recorte
    paddleX, //posición X del dibujo
    paddleY, //posición Y del dibujo
    paddleWidth, //ancho del dibujo
    paddleHeight //alto del dibujo
  );
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < bricksRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;

      const clipX = currentBrick.color * 32;

      ctx.drawImage(
        $bricks, //imagen
        clipX, //recorta
        0, //coordenada de recorte en X
        brickWidth, //tanaño del recorte
        brickHeight, //tanaño del recorte
        currentBrick.x, //posición X del dibujo
        currentBrick.y, //posición Y del dibujo
        brickWidth, //ancho del dibujo
        brickHeight //alto del dibujo
      );
    }
  }
}

/***********************************************/

//funciones del movimiento de la pelota
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < bricksRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;
      const isBallSameXAsBrick =
        x > currentBrick.x && x < currentBrick.x + brickWidth;

      const isBallSameYAsBrick =
        y > currentBrick.y && y < currentBrick.y + brickHeight;

        if (isBallSameXAsBrick && isBallSameYAsBrick) {
          dy = -dy
          currentBrick.status = BRICK_STATUS.DESTROYED
        }
    }
  }
}

function ballMovement() {
  //Rebotar la pelota en las "paredes"
  if (
    x + dx > canvas.width - ballRadius || //pared derecha
    x + dx < ballRadius //pared izquierda
  ) {
    dx = -dx; //cambia la orientación
  }

  //Rebotar la pelota en el "techo"
  if (y + dy < ballRadius) {
    dy = -dy; //cambia la orientación
  }

  //define si la pelota esta en la misma altura que la paleta
  const isBallSameXAsPaddle = x > paddleX && x < paddleX + paddleWidth;
  //define si la pelota esta tocando la paleta
  const isBallTouchingPaddle = y + dy > paddleY;

  //si la pelota toca la paleta
  if (isBallSameXAsPaddle && isBallTouchingPaddle) {
    dy = -dy;
  }
  //si se sale de la pantalla por debajo: Game Over
  else if (y + dy > canvas.height - ballRadius) {
    //console.log("Game Over");
    document.location.reload();
  } //////////////////////////¿Se podría agregar un tiempo entre el GO y que se reinicie?

  //mueve la pelota
  x += dx;
  y += dy;
}

//lógica para mover la paleta
function paddleMovement() {
  //indica hasta donde puede llegar: si la derecha esta presionada y la paleta pasa el ancho de la pantalla menos el ancho de la paleta: hasta ahí llega
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += PADDLE_SENSITBITY;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= PADDLE_SENSITBITY;
  }
}

//limpia la pantalla para actualizar el dibujo/recorrido de la bola, para evitar que se vea una línea o un trazo
function cleanCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//inicializa eventos
function initEvents() {
  //cuando el usuario toque la tecla y cuando la suelta
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  /////////////////////////////////////////////////////¿Cómo mejorarlo?
  function keyDownHandler(event) {
    const { key } = event;

    if (key === "Right" || key === "ArrowRight") {
      rightPressed = true;
    }

    if (key === "Left" || key === "ArrowLeft") {
      leftPressed = true;
    }
  }

  function keyUpHandler(event) {
    const { key } = event;

    if (key === "Right" || key === "ArrowRight") {
      rightPressed = false;
    }

    if (key === "Left" || key === "ArrowLeft") {
      leftPressed = false;
    }
  }
}

/**********************************************************************/

function draw() {
  cleanCanvas();
  //Primero hay que dibujar los elementos
  drawBall();
  drawPaddle();
  drawBricks();
  //drawScore() //--> No lo llega a mostrar en el tuto

  //coliciones y movimientos
  collisionDetection();
  ballMovement();
  paddleMovement();

  window.requestAnimationFrame(draw); //metodo. se llama a sí misma, constantemente, para actualizarse (una vez por segundo)--> genera un loop infinito <-- Por lo que será usado para "dibujar" y actualizar las animaciones
}

draw();
initEvents();
