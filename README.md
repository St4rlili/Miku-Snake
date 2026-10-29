# Miku Snake 初音ミク

## Qué es

Un juego de la serpiente (Snake) con tema de Hatsune Miku y los Vocaloid. Antes de empezar
se pide el nombre del jugador y, al terminar la partida, se guardan su **nombre**, sus
**puntos** y el **tiempo** que ha durado. En la página se muestra el top 5 de mejores
partidas, aunque en la base de datos se guardan todas.

## Cómo se juega

- **Moverse:** flechas del teclado o WASD.
- **Pausa:** Espacio. Vuelve a pulsarlo (o pulsa "Continuar") para reanudar. El tiempo en pausa no cuenta.
- **Objetivo:** comer sin chocar con las paredes ni con tu propio cuerpo.
- **Puntos:** cada comida es de un personaje y vale distinto. Cuanto más vale, menos aparece.

| Comida | Personaje | Puntos |
|---|---|---|
| Puerro | Miku | 1 |
| Naranja | Rin | 2 |
| Plátano | Len | 2 |
| Helado | Kaito | 3 |
| Atún | Luka | 3 |
| Sake | Meiko | 5 |

El ranking ordena por más puntos y, si hay empate, gana quien haya tardado menos.

## Cómo funciona

```
Navegador -> PHP (web/api/scores.php) -> Node + Express (server.js) -> MongoDB Atlas
```

- **HTML, CSS y JavaScript** (`web/`): la página y el juego, que se dibuja en un `canvas`.
- **PHP** (`web/api/scores.php`): recibe las peticiones del juego, comprueba los datos y las reenvía a Node.
- **Node.js** (`server.js`): valida los datos otra vez y los guarda o lee en MongoDB. Solo acepta peticiones de PHP, que le manda una clave (`API_KEY`).
- **MongoDB Atlas**: guarda cada partida en la colección `scores` con `name`, `score` (puntos), `time` (segundos) y `createdAt`.

Los sprites de la serpiente están en `web/img/` (`cabeza.png`, `cuerpo.png`, `cola.png`).
Se pueden cambiar por otros con el mismo nombre: cuadrados, con fondo transparente y dibujados
como si la serpiente fuera hacia la derecha. Si falta alguno, se dibuja un cuadrado de color.

## Cómo iniciarla

Necesitas [Docker](https://www.docker.com/) y una base de datos en MongoDB Atlas.

### 1. Crear la base de datos en MongoDB Atlas

1. Crea un cluster gratuito (M0) en https://cloud.mongodb.com.
2. En *Database Access* crea un usuario con contraseña.
3. En *Network Access* añade tu IP (o `0.0.0.0/0` solo para pruebas).
4. En *Connect > Drivers* copia la cadena `mongodb+srv://...`. Si la contraseña tiene símbolos como `@`, `/` o `:`, hay que codificarlos en formato URL.

No hace falta crear la base de datos ni la colección: MongoDB las crea al guardar la primera partida.

### 2. Configurar el archivo `.env`

```bash
cp .env.example .env
```

Abre `.env` y rellena:

| Variable | Qué poner |
|---|---|
| `API_KEY` | Una clave inventada (sin espacios, comillas ni `#`). Sirve para que solo PHP pueda hablar con Node. |
| `MONGODB_URI` | La cadena de conexión de Atlas. |
| `MONGODB_DB` | Nombre de la base de datos (por defecto `miku_snake`). |
| `MONGODB_COLLECTION` | Nombre de la colección (por defecto `scores`). |

### 3. Arrancar

```bash
docker compose up
```

Abre http://localhost:8000. En la consola de `api` debe aparecer `Conectado a MongoDB Atlas`.

Si cambias el `.env` o `server.js`, para y vuelve a arrancar:

```bash
docker compose down
docker compose up
```

### Si algo falla

- `docker compose logs api`: muestra si Node ha conectado con MongoDB y, si no, el motivo.
- `curl -s localhost:8000/api/scores.php`: debe devolver `{"scores":[...]}`. Si dice que no puede conectar con el servidor de puntuaciones, PHP no alcanza a Node.

## Archivos

- `server.js`: API de Node.
- `docker-compose.yml`: arranca Node (`api`) y PHP (`web`).
- `web/index.php`: la página.
- `web/api/scores.php`: pasarela entre el juego y Node.
- `web/js/game.js`: el juego.
- `web/css/style.css`: los estilos.
- `web/img/`: sprites de la serpiente.
