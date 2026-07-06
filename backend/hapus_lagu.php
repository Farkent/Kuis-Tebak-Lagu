<?php
require "config.php";
requireAdmin();

$data = json_decode(file_get_contents('php://input'), true);
$lagu_id = intval($data['lagu_id'] ?? 0);

if ($lagu_id <= 0) {
    echo json_encode(["error" => "ID lagu tidak valid"]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM lagu WHERE id = ?");
$stmt->bind_param("i", $lagu_id);
$success = $stmt->execute();

if ($success) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["error" => "Gagal menghapus lagu"]);
}
?>