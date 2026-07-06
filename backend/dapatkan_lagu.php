<?php
// dapatkan_lagu.php - UPDATED: Jawaban diacak sebelum dikirim ke frontend
require "config.php";

$tebak_lagu_id = isset($_GET['tebak_lagu_id']) ? intval($_GET['tebak_lagu_id']) : 0;
if ($tebak_lagu_id <= 0) {
    echo json_encode(["error" => "ID Tebak Lagu tidak valid"]);
    exit;
}

// Tambahkan l.genre_id dan JOIN ke tabel genre untuk mendapatkan nama_genre
$sql = "SELECT l.id AS lid, l.lirik, l.deezer_track_id, l.preview_url, l.genre_id, 
               g.nama_genre, j.id AS jid, j.jawaban_text, j.is_correct
        FROM lagu l
        JOIN jawaban j ON j.lagu_id = l.id
        LEFT JOIN genre g ON l.genre_id = g.id
        WHERE l.tebak_lagu_id = ?
        ORDER BY l.id, j.id";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $tebak_lagu_id);
$stmt->execute();
$result = $stmt->get_result();

$lagu = [];
$currentId = null;
while ($row = $result->fetch_assoc()) {
    if ($currentId !== $row['lid']) {
        $currentId = $row['lid'];
        $lagu[] = [
            'id' => $row['lid'],
            'lirik' => $row['lirik'],
            'deezer_track_id' => intval($row['deezer_track_id']),
            'preview_url' => $row['preview_url'],
            'genre_id' => $row['genre_id'],
            'nama_genre' => $row['nama_genre'],
            'jawaban' => [],
        ];
    }

    $lagu[count($lagu) - 1]['jawaban'][] = [
        'id' => $row['jid'],
        'jawaban_text' => $row['jawaban_text'],
        'is_correct' => intval($row['is_correct']) === 1,
    ];
}

// ═══════════════════════════════════════════════════════════════
// SHUFFLE: Acak jawaban untuk setiap soal
// ═══════════════════════════════════════════════════════════════
foreach ($lagu as &$song) {
    // Fisher-Yates shuffle algorithm
    if (count($song['jawaban']) > 1) {
        for ($i = count($song['jawaban']) - 1; $i > 0; $i--) {
            $j = rand(0, $i);
            $temp = $song['jawaban'][$i];
            $song['jawaban'][$i] = $song['jawaban'][$j];
            $song['jawaban'][$j] = $temp;
        }
    }
}

echo json_encode($lagu);
?>