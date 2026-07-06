<?php

header("Content-Type: application/json");

echo json_encode([
    "status" => "OK",
    "php" => PHP_VERSION,
    "server" => "Railway"
]);