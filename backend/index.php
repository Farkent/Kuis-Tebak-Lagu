<?php

header("Content-Type: application/json");

echo json_encode([
    "success" => true,
    "message" => "Backend API Tebak Lagu berjalan.",
    "php_version" => PHP_VERSION
]);