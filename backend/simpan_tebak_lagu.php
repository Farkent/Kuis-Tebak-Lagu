<?php
require "config.php";
requireAdmin();

$data = json_decode(file_get_contents('php://input'), true);
$id = intval($data['id'] ?? 0);
$title = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');

if (!$title) {
    echo json_encode(["error" => "Judul tebak lagu wajib diisi"]);
    exit;
}

if ($id > 0) {
    $stmt = $conn->prepare("UPDATE tebak_lagu SET title = ?, description = ? WHERE id = ?");
    $stmt->bind_param("ssi", $title, $description, $id);
    $success = $stmt->execute();
    if ($success) {
        echo json_encode(["success" => true, "id" => $id]);
    } else {
        echo json_encode(["error" => "Gagal memperbarui tebak lagu"]);
    }
} else {
    $stmt = $conn->prepare("INSERT INTO tebak_lagu (title, description) VALUES (?, ?)");
    $stmt->bind_param("ss", $title, $description);
    $success = $stmt->execute();
    if ($success) {
        echo json_encode(["success" => true, "id" => $conn->insert_id]);
    } else {
        echo json_encode(["error" => "Gagal membuat tebak lagu"]);
    }
}
?>