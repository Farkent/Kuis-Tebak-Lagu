<?php
require "config.php";

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if (!$username || !$password) {
    echo json_encode(["error" => "Username dan password wajib diisi"]);
    exit;
}

$stmt = $conn->prepare("SELECT id, username, password FROM admins WHERE username = ? LIMIT 1");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || $user['password'] !== $password) {
    echo json_encode(["error" => "Username atau password salah"]);
    exit;
}

$_SESSION['admin_logged_in'] = true;
$_SESSION['admin_username'] = $user['username'];

echo json_encode(["success" => true, "username" => $user['username']]);
