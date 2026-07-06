<?php
require "config.php";
requireAdmin();

$data = json_decode(file_get_contents('php://input'), true);
$lagu_id = intval($data['lagu_id'] ?? 0);
$tebak_lagu_id = intval($data['tebak_lagu_id'] ?? 0);
$lirik = trim($data['lirik'] ?? '');
$jawaban = $data['jawaban'] ?? [];
$deezer_track_id = intval($data['deezer_track_id'] ?? 0);
$preview_url = trim($data['preview_url'] ?? '');
$genre_id = intval($data['genre_id'] ?? 0);

// Validasi: Pastikan semua data wajib ada
if ($tebak_lagu_id <= 0 || empty($lirik) || $genre_id <= 0) {
    echo json_encode(["error" => "Data tidak lengkap! Pastikan Kategori dan Genre sudah dipilih."]);
    exit;
}

$conn->begin_transaction();

try {
    if ($lagu_id > 0) {
        $stmt = $conn->prepare("UPDATE lagu SET lirik = ?, deezer_track_id = ?, preview_url = ?, genre_id = ? WHERE id = ?");
        $stmt->bind_param("sisii", $lirik, $deezer_track_id, $preview_url, $genre_id, $lagu_id);
        $stmt->execute();
    } else {
        // Query INSERT yang lebih sederhana (hanya kolom yang kita miliki datanya)
        $stmt = $conn->prepare("INSERT INTO lagu (tebak_lagu_id, lirik, deezer_track_id, preview_url, genre_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("isisi", $tebak_lagu_id, $lirik, $deezer_track_id, $preview_url, $genre_id);
        $stmt->execute();
        $lagu_id = $conn->insert_id;
    }

    // Bagian simpan jawaban
    $incomingIds = [];
    foreach ($jawaban as $j) {
        $txt = trim($j['jawaban_text'] ?? '');
        $isCorr = intval($j['is_correct'] ?? 0);
        $jId = intval($j['id'] ?? 0);
        
        if ($txt === '') continue;

        if ($jId > 0) {
            $stmtJ = $conn->prepare("UPDATE jawaban SET jawaban_text = ?, is_correct = ? WHERE id = ? AND lagu_id = ?");
            $stmtJ->bind_param("siii", $txt, $isCorr, $jId, $lagu_id);
            $stmtJ->execute();
            $incomingIds[] = $jId;
        } else {
            $stmtJ = $conn->prepare("INSERT INTO jawaban (lagu_id, jawaban_text, is_correct) VALUES (?, ?, ?)");
            $stmtJ->bind_param("isi", $lagu_id, $txt, $isCorr);
            $stmtJ->execute();
            $incomingIds[] = $conn->insert_id;
        }
    }

    if ($lagu_id > 0 && count($incomingIds) > 0) {
        $idList = implode(',', array_map('intval', $incomingIds));
        $conn->query("DELETE FROM jawaban WHERE lagu_id = $lagu_id AND id NOT IN ($idList)");
    }

    $conn->commit();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
}