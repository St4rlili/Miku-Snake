// Recibe las peticiones de PHP y guarda/lee las puntuaciones.

require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");

const PUERTO = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const API_KEY = process.env.API_KEY || "cambia-esta-clave";
const MONGODB_URI = process.env.MONGODB_URI;
const NOMBRE_BD = process.env.MONGODB_DB || "miku_snake";
const NOMBRE_COLECCION = process.env.MONGODB_COLLECTION || "scores";
const LIMITE_TOP = 5;

const app = express();
app.use(express.json());

let coleccion = null;

// Solo dejamos pasar a PHP
app.use(function (req, res, next) {
  if (req.get("x-api-key") != API_KEY) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
});

// Devuelve las mejores puntuaciones
app.get("/scores", async function (req, res) {
  try {
    let limite = parseInt(req.query.limit) || 5;
    if (limite > 50) {
      limite = 50;
    }

    const resultado = await coleccion
      .find({}, { projection: { _id: 0 } })
      .sort({ score: -1, time: 1 })
      .limit(limite)
      .toArray();

    res.json({ scores: resultado });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "No se pudieron leer las puntuaciones" });
  }
});

app.post("/scores", async function (req, res) {
  const name = req.body.name;
  const score = req.body.score;
  const time = req.body.time;

  if (typeof name != "string" || name.trim() == "" || name.trim().length > 16) {
    return res.status(400).json({ error: "El nombre debe tener entre 1 y 16 caracteres" });
  }
  if (!Number.isInteger(score) || score < 0) {
    return res.status(400).json({ error: "La puntuación no es válida" });
  }
  if (typeof time != "number" || time < 0) {
    return res.status(400).json({ error: "El tiempo no es válido" });
  }

  const nueva = {
    name: name.trim(),
    score: score,
    time: Math.round(time * 100) / 100,
    createdAt: new Date(),
  };

  try {
    const guardada = await guardarSiEntraEnTop(nueva);
    res.json({ ok: true, guardada: guardada});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "No se pudo guardar la puntuación" });
  }
});

async function guardarSiEntraEnTop(nueva) {
  const mejores = await coleccion
    .find({})
    .sort({ score: -1, time: 1})
    .limit(LIMITE_TOP)
    .toArray();

    if (mejores.length >= LIMITE_TOP) {
      const peor = mejores[mejores.length -1];
      const esMejor = nueva.score > peor.score || (nueva.score == peor.score && nueva.time < peor.time);
      if (!esMejor) {
        return false;
      }
    }
  await coleccion.insertOne(nueva);
  await borrarSobrantes();
  return true;
}

async function borrarSobrantes() {
  const sobrantes = await coleccion
    .find({}, { projection: { _id: 1 }})
    .sort({ score: -1, time: 1 })
    .skip(LIMITE_TOP)
    .toArray();
  
  if (sobrantes.length > 0) {
    const ids = sobrantes.map(function(doc) {
      return doc._id;
    });
    await coleccion.deleteMany({ _id: { $in: ids }});
  }
}

async function arrancar() {
  if (!MONGODB_URI) {
    console.error("Error crítico: MONGODB_URI no está definida en las variables de entorno.");
    process.exit(1);
  }

  try {
    const cliente = new MongoClient(MONGODB_URI);
    await cliente.connect();
    coleccion = cliente.db(NOMBRE_BD).collection(NOMBRE_COLECCION);
    await coleccion.createIndex({ score: -1, time: 1});
    await borrarSobrantes();
    console.log("Conectado a MongoDB Atlas (bd: " + NOMBRE_BD + ", colección: " + NOMBRE_COLECCION + ")");
  } catch (error) {
    console.log("No se pudo conectar a MongoDB Atlas: " + error.message);
    process.exit(1);
  }

  app.listen(PUERTO, HOST, function () {
    console.log("API escuchando en " + HOST + ":" + PUERTO);
  });
}

arrancar();
