<?php
// Este archivo recibe las peticiones del juego y las pasa a la API de Node.

header("Content-Type: application/json; charset=utf-8");

$urlApi = getenv("NODE_API_URL");
if (!$urlApi) {
    $urlApi = "http://127.0.0.1:3000";
}
$claveApi = getenv("API_KEY");
if (!$claveApi) {
    $claveApi = "cambia-esta-clave";
}

// Llama a Node y devuelve lo que responda (texto JSON)
function llamarNode($metodo, $ruta, $datos = null)
{
    global $urlApi, $claveApi;

    $opciones = array(
        "http" => array(
            "method" => $metodo,
            "header" => "Content-Type: application/json\r\nX-API-Key: " . $claveApi . "\r\n",
            "ignore_errors" => true
        )
    );
    if ($datos != null) {
        $opciones["http"]["content"] = json_encode($datos);
    }

    $contexto = stream_context_create($opciones);
    $respuesta = @file_get_contents($urlApi . $ruta, false, $contexto);

    if ($respuesta === false) {
        return json_encode(array("error" => "No se pudo conectar con el servidor de puntuaciones"));
    }
    return $respuesta;
}

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Solo se muestra el top 5
    echo llamarNode("GET", "/scores?limit=5");
} else if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $entrada = json_decode(file_get_contents("php://input"), true);

    if (!isset($entrada["name"]) || !isset($entrada["score"]) || !isset($entrada["time"])) {
        echo json_encode(array("error" => "Faltan datos"));
        exit;
    }

    $nombre = trim($entrada["name"]);
    if ($nombre == "" || strlen($nombre) > 16) {
        echo json_encode(array("error" => "El nombre debe tener entre 1 y 16 caracteres"));
        exit;
    }
    if (!is_numeric($entrada["score"]) || !is_numeric($entrada["time"])) {
        echo json_encode(array("error" => "La puntuación y el tiempo deben ser números"));
        exit;
    }

    $datos = array(
        "name" => $nombre,
        "score" => (int) $entrada["score"],
        "time" => (float) $entrada["time"]
    );
    echo llamarNode("POST", "/scores", $datos);
} else {
    echo json_encode(array("error" => "Método no permitido"));
}
