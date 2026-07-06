<?php
require "config.php";
requireAdmin();

$data = json_decode(file_get_contents('php://input'), true);
// Gunakan key 'id' sesuai kiriman dari Admin.jsx
$id = intval($data['id'] ?? 0);

if ($id <= 0) {
    echo json_encode(["error" => "ID tidak valid"]);
    exit;
}

$conn->begin_transaction();

try {
    // 1. Hapus jawaban yang terhubung dengan lagu di kategori ini
    $conn->query("DELETE FROM jawaban WHERE lagu_id IN (SELECT id FROM lagu WHERE tebak_lagu_id = $id)");

    // 2. Hapus lagu yang terhubung dengan kategori ini
    $conn->query("DELETE FROM lagu WHERE tebak_lagu_id = $id");

    // 3. Hapus data leaderboard/hasil kuis kategori ini
    $conn->query("DELETE FROM hasil WHERE tebak_lagu_id = $id");

    // 4. Hapus kategori utamanya
    $stmt = $conn->prepare("DELETE FROM tebak_lagu WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    $conn->commit();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["error" => "Gagal menghapus: " . $conn->error]);
}
?>