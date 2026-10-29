// ---------- DATOS DEL TABLERO ----------

const COLUMNAS = 24;
const FILAS = 24;
const CELDA = 24; // tamaño de cada casilla en píxeles
const VELOCIDAD = 120;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

// ---------- ELEMENTOS DE LA PÁGINA ----------

const overlay = document.getElementById("overlay");
const panelNombre = document.getElementById("panel-name");
const panelPausa = document.getElementById("panel-pause");
const panelFinal = document.getElementById("panel-over");
const campoNombre = document.getElementById("player-name");
const hudNombre = document.getElementById("hud-name");
const hudPuntos = document.getElementById("hud-eaten");
const hudTiempo = document.getElementById("hud-time");
const resPuntos = document.getElementById("res-eaten");
const resTiempo = document.getElementById("res-time");
const estadoGuardado = document.getElementById("save-status");
const btnReintentar = document.getElementById("btn-retry");

// ---------- IMÁGENES (SPRITES) DE LA SERPIENTE ----------

const imgCabeza = new Image();
imgCabeza.src = "img/cabeza.png";
const imgCuerpo = new Image();
imgCuerpo.src = "img/cuerpo.png";
const imgCola = new Image();
imgCola.src = "img/cola.png";

// ---------- VARIABLES DEL JUEGO ----------

let serpiente = [];
let serpienteAnterior = []; // cómo estaba la serpiente un paso antes (para moverla suave)
let direccion = { x: 1, y: 0 };
let colaDirecciones = [];
let comida = null;
let comidaComida = null;
let puntos = 0;
let ultimoPaso = 0;
let inicio = 0;
let tiempoFinal = 0;
let jugando = false;
let pausado = false;
let momentoPausa = 0;
let nombre = "";

// Cada comida es de un personaje y vale X puntos, a más puntos menos probable es que aparezca.
const tiposComida = [
  { tipo: "negi", puntos: 1, probabilidad: 40 },
  { tipo: "🍊", puntos: 2, probabilidad: 20 },
  { tipo: "🍌", puntos: 2, probabilidad: 20 },
  { tipo: "🍦", puntos: 3, probabilidad: 10 },
  { tipo: "🐟", puntos: 3, probabilidad: 7 },
  { tipo: "🍶", puntos: 5, probabilidad: 3 }
];

// ---------- PANELES ----------

function mostrarPanel(cual) {
  overlay.classList.remove("hidden");
  panelNombre.hidden = (cual != "nombre");
  panelPausa.hidden = (cual != "pausa");
  panelFinal.hidden = (cual != "final");
}

function ocultarPaneles() {
  overlay.classList.add("hidden");
}

// ---------- EMPEZAR PARTIDA ----------

function empezarPartida() {
  serpiente = [
    { x: 12, y: 12 },
    { x: 11, y: 12 },
    { x: 10, y: 12 }
  ];
  serpienteAnterior = copiarSerpiente();
  direccion = { x: 1, y: 0 };
  colaDirecciones = [];
  puntos = 0;
  comidaComida = null;
  pausado = false;
  jugando = true;
  inicio = Date.now();
  ultimoPaso = performance.now();

  hudNombre.textContent = nombre;
  crearComida();
  actualizarMarcador();
  ocultarPaneles();
}

function copiarSerpiente() {
  const copia = [];
  for (let i = 0; i < serpiente.length; i++) {
    copia.push({ x: serpiente[i].x, y: serpiente[i].y });
  }
  return copia;
}

// Se ejecuta en cada fotograma
function bucle(ahora) {
  if (jugando && !pausado) {
    if (ahora - ultimoPaso > VELOCIDAD * 3) {
      ultimoPaso = ahora;
    }

    while (jugando && ahora - ultimoPaso >= VELOCIDAD) {
      mover();
      ultimoPaso = ultimoPaso + VELOCIDAD;
    }

    actualizarMarcador();
  }

  // Si está en pausa, la animación se también se detiene
  let referencia = ahora;
  if (pausado) {
    referencia = momentoPausa;
  }

  // Progreso de 0 a 1, cuánto ha avanzado entre una casilla y la siguiente
  let progreso = (referencia - ultimoPaso) / VELOCIDAD;
  if (progreso > 1) {
    progreso = 1;
  }
  if (progreso < 0) {
    progreso = 0;
  }

  dibujar(progreso);
  requestAnimationFrame(bucle);
}

// Busca una casilla libre y pone ahí una comida
function crearComida() {
  let libre = false;
  let x = 0;
  let y = 0;

  while (!libre) {
    x = Math.floor(Math.random() * COLUMNAS);
    y = Math.floor(Math.random() * FILAS);
    libre = true;
    for (let i = 0; i < serpiente.length; i++) {
      if (serpiente[i].x == x && serpiente[i].y == y) {
        libre = false;
      }
    }
  }

  const elegida = elegirTipoComida();
  comida = { x: x, y: y, tipo: elegida.tipo, puntos: elegida.puntos };
}

// Elige un tipo de comida al azar según su probabilidad
function elegirTipoComida() {
  const azar = Math.random() * 100;
  let acumulado = 0;

  for (let i = 0; i < tiposComida.length; i++) {
    acumulado = acumulado + tiposComida[i].probabilidad;
    if (azar < acumulado) {
      return tiposComida[i];
    }
  }
  return tiposComida[0];
}

// ---------- MOVIMIENTO ----------

function mover() {
  // Si hay teclas en espera, usamos la primera
  if (colaDirecciones.length > 0) {
    direccion = colaDirecciones.shift();
  }

  const cabeza = {
    x: serpiente[0].x + direccion.x,
    y: serpiente[0].y + direccion.y
  };

  // Choca con una pared
  if (cabeza.x < 0 || cabeza.x >= COLUMNAS || cabeza.y < 0 || cabeza.y >= FILAS) {
    terminarPartida();
    return;
  }

  // Choca con su propio cuerpo
  for (let i = 0; i < serpiente.length; i++) {
    if (serpiente[i].x == cabeza.x && serpiente[i].y == cabeza.y) {
      terminarPartida();
      return;
    }
  }

  serpienteAnterior = copiarSerpiente();
  comidaComida = null;

  // Añadimos la cabeza nueva delante
  serpiente.unshift(cabeza);

  if (cabeza.x == comida.x && cabeza.y == comida.y) {
    // Ha comido: no quitamos la cola, así crece
    puntos = puntos + comida.puntos;
    comidaComida = comida;
    crearComida();
  } else {
    // No ha comido: quitamos la cola
    serpiente.pop();
  }
}

function actualizarMarcador() {
  hudPuntos.textContent = puntos;
  const segundos = (Date.now() - inicio) / 1000;
  hudTiempo.textContent = formatoTiempo(segundos);
}

function formatoTiempo(segundos) {
  const total = Math.floor(segundos);
  const minutos = Math.floor(total / 60);
  let resto = total % 60;
  if (resto < 10) {
    resto = "0" + resto;
  }
  return minutos + ":" + resto;
}

// ---------- DIBUJO ----------

function dibujar(progreso) {
  ctx.fillStyle = "#0b1c24";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Casillas alternas para que parezca un tablero
  ctx.fillStyle = "#0f2530";
  for (let fila = 0; fila < FILAS; fila++) {
    for (let col = 0; col < COLUMNAS; col++) {
      if ((fila + col) % 2 == 0) {
        ctx.fillRect(col * CELDA, fila * CELDA, CELDA, CELDA);
      }
    }
  }

  dibujarComida(comida);
  if (comidaComida != null && progreso < 1) {
    dibujarComida(comidaComida);
  }
  dibujarSerpiente(progreso);
}

function dibujarComida(c) {
  if (c == null) {
    return;
  }
  const centroX = c.x * CELDA + CELDA / 2;
  const centroY = c.y * CELDA + CELDA / 2;

  if (c.tipo == "negi") {
    // Como no hay emoji de puerro/negi dibujamos un rectángulo verde con la parte blanca
    ctx.fillStyle = "#f3f9ee";
    ctx.fillRect(centroX - 3, centroY - 2, 6, 11);
    ctx.fillStyle = "#7bd66b";
    ctx.fillRect(centroX - 4, centroY - 10, 8, 9);
  } else {
    // El resto son emojis
    ctx.fillStyle = "#ffffff";
    ctx.font = "19px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(c.tipo, centroX, centroY);
  }
}

function dibujarSerpiente(progreso) {
  const ultimo = serpiente.length - 1;

  for (let i = 0; i < serpiente.length; i++) {
    const actual = serpiente[i];

    let antes = serpienteAnterior[i];
    if (antes == undefined) {
      antes = actual;
    }

    // Posición entre la casilla anterior y la actual, según el progreso (0 a 1)
    const x = (antes.x + (actual.x - antes.x) * progreso) * CELDA;
    const y = (antes.y + (actual.y - antes.y) * progreso) * CELDA;

    if (i == 0) {
      // La cabeza mira hacia donde va la serpiente
      dibujarSprite(imgCabeza, x, y, direccion.x, direccion.y, "#39c5bb");
    } else {
      // Para cuerpo y cola miramos la casilla de delante
      const delante = serpiente[i - 1];
      const dx = delante.x - actual.x;
      const dy = delante.y - actual.y;

      if (i == ultimo) {
        dibujarSprite(imgCola, x, y, dx, dy, "#ff5fa2");
      } else {
        dibujarSprite(imgCuerpo, x, y, dx, dy, "#5fd6cc");
      }
    }
  }
}

// Dibuja una imagen en la posición (x, y) en píxeles, girada según la dirección (dx, dy)
// Si la imagen no ha cargado, dibuja un cuadrado de color
function dibujarSprite(img, x, y, dx, dy, colorRespaldo) {

  if (!img.complete || img.naturalWidth == 0) {
    ctx.fillStyle = colorRespaldo;
    ctx.fillRect(x + 1, y + 1, CELDA - 2, CELDA - 2);
    return;
  }

  ctx.save();
  ctx.translate(x + CELDA / 2, y + CELDA / 2);

  if (dx == 1) {
    // derecha: tal como está la imagen
  } else if (dx == -1) {
    ctx.scale(-1, 1); // izquierda: espejo (así no queda boca abajo)
  } else if (dy == 1) {
    ctx.rotate(Math.PI / 2); // abajo
  } else if (dy == -1) {
    ctx.rotate(-Math.PI / 2); // arriba
  }

  ctx.drawImage(img, -CELDA / 2, -CELDA / 2, CELDA, CELDA);
  ctx.restore();
}

// ---------- PAUSA ----------

function pausar() {
  pausado = true;
  momentoPausa = performance.now();
  mostrarPanel("pausa");
}

function reanudar() {
  // El rato que ha estado en pausa no cuenta ni para el movimiento ni para el tiempo
  const duracion = performance.now() - momentoPausa;
  ultimoPaso = ultimoPaso + duracion;
  inicio = inicio + duracion;
  pausado = false;
  ocultarPaneles();
}

// ---------- FIN DE LA PARTIDA ----------

function terminarPartida() {
  jugando = false;

  tiempoFinal = (Date.now() - inicio) / 1000;
  tiempoFinal = Math.round(tiempoFinal * 100) / 100;

  resPuntos.textContent = puntos;
  resTiempo.textContent = formatoTiempo(tiempoFinal);
  mostrarPanel("final");

  guardarPuntuacion();
}

// Manda la puntuación a PHP, que la pasa a Node y este a MongoDB
async function guardarPuntuacion() {
  estadoGuardado.className = "save-status";
  estadoGuardado.textContent = "Guardando...";
  btnReintentar.hidden = true;

  try {
    const respuesta = await fetch("api/scores.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nombre, score: puntos, time: tiempoFinal })
    });
    const datos = await respuesta.json();

    if (datos.error) {
      estadoGuardado.className = "save-status error";
      estadoGuardado.textContent = "No se pudo guardar: " + datos.error;
      btnReintentar.hidden = false;
    } else {
      estadoGuardado.textContent = "Puntuación guardada";
      cargarRanking();
    }
  } catch (error) {
    estadoGuardado.className = "save-status error";
    estadoGuardado.textContent = "No se pudo guardar (error de conexión)";
    btnReintentar.hidden = false;
  }
}

// ---------- RANKING ----------

function crearSpan(clase, texto) {
  const span = document.createElement("span");
  span.className = clase;
  span.textContent = texto; // textContent para que no se pueda meter HTML en el nombre
  return span;
}

async function cargarRanking() {
  const lista = document.getElementById("ranking");

  try {
    const respuesta = await fetch("api/scores.php");
    const datos = await respuesta.json();

    lista.innerHTML = "";

    if (!datos.scores || datos.scores.length == 0) {
      lista.innerHTML = '<li class="empty">Aún no hay puntuaciones</li>';
      return;
    }

    for (let i = 0; i < datos.scores.length; i++) {
      const p = datos.scores[i];
      const li = document.createElement("li");
      li.appendChild(crearSpan("pos", i + 1));
      li.appendChild(crearSpan("who", p.name));
      li.appendChild(crearSpan("pts", p.score));
      li.appendChild(crearSpan("tm", formatoTiempo(p.time)));
      lista.appendChild(li);
    }
  } catch (error) {
    lista.innerHTML = '<li class="empty">No se pudo cargar el ranking</li>';
  }
}

// ---------- TECLADO ----------

document.addEventListener("keydown", function (e) {
  if (!jugando) {
    return;
  }
  const tecla = e.key;

  // Espacio: pausar y reanudar
  if (tecla == " ") {
    e.preventDefault();
    if (e.repeat) {
      return;
    }
    if (pausado) {
      reanudar();
    } else {
      pausar();
    }
    return;
  }

  // Con el juego en pausa no se aceptan giros
  if (pausado) {
    return;
  }

  // Qué dirección ha pedido el jugador
  let nueva = null;
  if (tecla == "ArrowUp" || tecla == "w" || tecla == "W") {
    nueva = { x: 0, y: -1 };
  } else if (tecla == "ArrowDown" || tecla == "s" || tecla == "S") {
    nueva = { x: 0, y: 1 };
  } else if (tecla == "ArrowLeft" || tecla == "a" || tecla == "A") {
    nueva = { x: -1, y: 0 };
  } else if (tecla == "ArrowRight" || tecla == "d" || tecla == "D") {
    nueva = { x: 1, y: 0 };
  }

  if (nueva == null) {
    return;
  }
  e.preventDefault();

  // La comparamos con la última tecla en espera (o con la dirección actual si no hay ninguna)
  let ultima = direccion;
  if (colaDirecciones.length > 0) {
    ultima = colaDirecciones[colaDirecciones.length - 1];
  }

  const contraria = (nueva.x == -ultima.x && nueva.y == -ultima.y); // no se puede dar la vuelta
  const igual = (nueva.x == ultima.x && nueva.y == ultima.y);

  // Guardamos la tecla en colaDirecciones si no es contraria ni igual, y si no hay más de 2 teclas en espera
  if (!contraria && !igual && colaDirecciones.length < 3) {
    colaDirecciones.push(nueva);
  }
});

// ---------- BOTONES ----------

panelNombre.addEventListener("submit", function (e) {
  e.preventDefault();
  const texto = campoNombre.value.trim();
  if (texto == "") {
    return;
  }
  nombre = texto;
  empezarPartida();
});

document.getElementById("btn-again").addEventListener("click", empezarPartida);
btnReintentar.addEventListener("click", guardarPuntuacion);
document.getElementById("btn-resume").addEventListener("click", reanudar);
document.getElementById("btn-change").addEventListener("click", function () {
  mostrarPanel("nombre");
  campoNombre.focus();
});

// ---------- AL CARGAR LA PÁGINA ----------

mostrarPanel("nombre");
campoNombre.focus();
cargarRanking();
requestAnimationFrame(bucle);
