<?php
require "config.php";

if (!($_SESSION['admin_logged_in'] ?? false)) {
    echo json_encode(["authenticated" => false]);
    exit;
}

echo json_encode([
    "authenticated" => true,
    "username" => $_SESSION['admin_username'] ?? null,
]);
