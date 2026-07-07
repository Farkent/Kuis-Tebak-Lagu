<?php
// run_migration.php — Jalankan sekali untuk fix database
// HAPUS FILE INI SETELAH DIJALANKAN!
require "config.php";

// Cek password sederhana agar tidak sembarangan diakses
$secret = $_GET['secret'] ?? '';
if ($secret !== 'fix_judul_lagu_2024') {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden"]);
    exit;
}

$results = [];

// Cek apakah kolom judul_lagu sudah ada
$check = $conn->query("SHOW COLUMNS FROM lagu LIKE 'judul_lagu'");

if ($check && $check->num_rows > 0) {
    // Kolom sudah ada, pastikan ada default value
    if ($conn->query("ALTER TABLE lagu MODIFY COLUMN judul_lagu VARCHAR(255) NOT NULL DEFAULT ''")) {
        $results[] = "✅ ALTER: judul_lagu sekarang punya DEFAULT ''";
    } else {
        $results[] = "❌ ALTER gagal: " . $conn->error;
    }
} else {
    // Kolom belum ada, tambahkan
    if ($conn->query("ALTER TABLE lagu ADD COLUMN judul_lagu VARCHAR(255) NOT NULL DEFAULT '' AFTER tebak_lagu_id")) {
        $results[] = "✅ ADD COLUMN: judul_lagu berhasil ditambahkan";
    } else {
        $results[] = "❌ ADD COLUMN gagal: " . $conn->error;
    }
}

// Update baris yang NULL
$update = $conn->query("UPDATE lagu SET judul_lagu = '' WHERE judul_lagu IS NULL OR judul_lagu = ''");
$results[] = "✅ UPDATE: " . $conn->affected_rows . " baris diupdate";

// Cek struktur tabel sekarang
$showCols = $conn->query("DESCRIBE lagu");
$cols = [];
while ($row = $showCols->fetch_assoc()) {
    $cols[] = $row;
}

echo json_encode([
    "success" => true,
    "results" => $results,
    "table_structure" => $cols
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
