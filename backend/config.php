<?php
// ==============================
// CORS
// ==============================

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Baca URL frontend dari Environment Variable Railway (opsional)
$frontendUrl = getenv('FRONTEND_URL') ?: '';

$allowedOrigins = array_filter([
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    // URL Frontend Vercel
    "https://kuis-tebak-lagu.vercel.app",

    // Jika nanti menggunakan custom domain atau Production Domain Vercel,
    // cukup tambahkan di Railway Environment Variable FRONTEND_URL
    $frontendUrl,
]);

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ==============================
// SESSION
// ==============================

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'None'
]);

session_start();

// ==============================
// DATABASE RAILWAY
// ==============================

$conn = new mysqli(
    "mysql.railway.internal",
    "root",
    "eJQuEHZWszepmWVmhnrdKfqQvofQHwBd",
    "railway",
    3306
);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode([
        "success" => false,
        "error" => $conn->connect_error
    ]));
}

$conn->set_charset("utf8mb4");

function requireAdmin()
{
    if (!($_SESSION['admin_logged_in'] ?? false)) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "error" => "Unauthorized"
        ]);
        exit;
    }
}
?>