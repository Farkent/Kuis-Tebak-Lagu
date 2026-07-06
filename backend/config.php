<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

session_start();

$conn = new mysqli("localhost", "root", "", "tebak_lagu");

if ($conn->connect_error) {
    echo json_encode(["error" => "Database gagal"]);
    exit;
}

$conn->set_charset("utf8mb4");

function requireAdmin() {
    if (!($_SESSION['admin_logged_in'] ?? false)) {
        echo json_encode(["error" => "Unauthorized"]);
        exit;
    }
}
?>
