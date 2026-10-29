<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Miku Snake</title>
  <link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Zen+Maru+Gothic:wght@400;500;700&display=swap" rel="stylesheet">
  <!-- time() cambia el número cada vez y así el navegador no usa archivos viejos -->
  <link rel="stylesheet" href="css/style.css?v=<?php echo time(); ?>">
</head>
<body>
  <aside class="notes" aria-hidden="true">
    <span>♪</span><span>♫</span><span>♪</span><span>♬</span><span>♫</span><span>♪</span>
  </aside>

  <header class="top">
    <h1>Miku Snake</h1>
    <p class="jp" lang="ja">初音ミク</p>
  </header>

  <main class="layout">
    <section class="stage">
      <article class="hud">
        <div><span class="hud-label">Jugador</span><strong id="hud-name">-</strong></div>
        <div><span class="hud-label">Puntos</span><strong id="hud-eaten">0</strong></div>
        <div><span class="hud-label">Tiempo</span><strong id="hud-time">0:00</strong></div>
      </article>

      <article class="board-wrap">
        <canvas id="board" width="576" height="576"></canvas>

        <div class="overlay" id="overlay">
          <!-- Panel para pedir el nombre -->
          <form class="panel" id="panel-name" autocomplete="off">
            <h2>¿Quién sube al escenario?</h2>
            <label for="player-name">Tu nombre</label>
            <input id="player-name" maxlength="16" required placeholder="Ej. Pedro">
            <button class="btn" type="submit">Empezar</button>
            <p class="hint">Flechas o WASD para moverte · Espacio para pausar</p>
          </form>

          <!-- Panel de pausa -->
          <div class="panel" id="panel-pause" hidden>
            <p class="pausa-icono">⏸</p>
            <h2>Juego en pausa</h2>
            <p class="hint">Pulsa Espacio para continuar</p>
            <button class="btn" id="btn-resume" type="button">Continuar</button>
          </div>

          <!-- Panel de fin de partida -->
          <div class="panel" id="panel-over" hidden>
            <h2>Fin del concierto</h2>
            <dl class="result">
              <div><dt>Puntos</dt><dd id="res-eaten">0</dd></div>
              <div><dt>Tiempo</dt><dd id="res-time">0:00</dd></div>
            </dl>
            <p class="save-status" id="save-status"></p>
            <div class="actions">
              <button class="btn" id="btn-again" type="button">Jugar otra vez</button>
              <button class="btn ghost" id="btn-retry" type="button" hidden>Reintentar guardado</button>
              <button class="btn ghost" id="btn-change" type="button">Cambiar jugador</button>
            </div>
          </div>
        </div>
      </article>
    </section>

    <aside class="side">
      <h2>Top 5</h2>
      <ol class="ranking" id="ranking">
        <li class="empty">Cargando...</li>
      </ol>

      <h2>Menú del día</h2>
      <ul class="menu-list">
        <li><i class="dot negi"></i> Puerro de Miku <span class="valor">+1</span></li>
        <li><span class="emo">🍊</span> Naranja de Rin <span class="valor">+2</span></li>
        <li><span class="emo">🍌</span> Plátano de Len <span class="valor">+2</span></li>
        <li><span class="emo">🍦</span> Helado de Kaito <span class="valor">+3</span></li>
        <li><span class="emo">🐟</span> Atún de Luka <span class="valor">+3</span></li>
        <li><span class="emo">🍶</span> Sake de Meiko <span class="valor">+5</span></li>
      </ul>
      <p class="hint">Cuanto más puntos vale una comida, menos veces aparece.</p>
    </aside>
  </main>

  <script src="js/game.js?v=<?php echo time(); ?>"></script>
</body>
</html>
