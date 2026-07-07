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

// ============================================================
// FIX 1: judul_lagu column
// ============================================================
$check = $conn->query("SHOW COLUMNS FROM lagu LIKE 'judul_lagu'");
if ($check && $check->num_rows > 0) {
    if ($conn->query("ALTER TABLE lagu MODIFY COLUMN judul_lagu VARCHAR(255) NOT NULL DEFAULT ''")) {
        $results[] = "✅ ALTER: judul_lagu sekarang punya DEFAULT ''";
    } else {
        $results[] = "❌ ALTER judul_lagu gagal: " . $conn->error;
    }
} else {
    if ($conn->query("ALTER TABLE lagu ADD COLUMN judul_lagu VARCHAR(255) NOT NULL DEFAULT '' AFTER tebak_lagu_id")) {
        $results[] = "✅ ADD COLUMN: judul_lagu berhasil ditambahkan";
    } else {
        $results[] = "❌ ADD COLUMN judul_lagu gagal: " . $conn->error;
    }
}
$conn->query("UPDATE lagu SET judul_lagu = '' WHERE judul_lagu IS NULL");

// ============================================================
// FIX 2: artis column
// ============================================================
$checkArtis = $conn->query("SHOW COLUMNS FROM lagu LIKE 'artis'");
if ($checkArtis && $checkArtis->num_rows > 0) {
    if ($conn->query("ALTER TABLE lagu MODIFY COLUMN artis VARCHAR(255) NOT NULL DEFAULT ''")) {
        $results[] = "✅ ALTER: artis sekarang punya DEFAULT ''";
    } else {
        $results[] = "❌ ALTER artis gagal: " . $conn->error;
    }
    $conn->query("UPDATE lagu SET artis = '' WHERE artis IS NULL");
    $results[] = "✅ UPDATE artis NULL rows done";
} else {
    if ($conn->query("ALTER TABLE lagu ADD COLUMN artis VARCHAR(255) NOT NULL DEFAULT '' AFTER judul_lagu")) {
        $results[] = "✅ ADD COLUMN: artis berhasil ditambahkan";
    } else {
        $results[] = "❌ ADD COLUMN artis gagal: " . $conn->error;
    }
}

// ============================================================
// FIX 3: lirik column (text NOT NULL no default - can cause issues)
// ============================================================
$checkLirik = $conn->query("SHOW COLUMNS FROM lagu LIKE 'lirik'");
if ($checkLirik && $row = $checkLirik->fetch_assoc()) {
    if ($row['Null'] === 'NO') {
        // Make it nullable or give default - text type can't have default in older MySQL
        // Instead just ensure all rows have a value
        $conn->query("UPDATE lagu SET lirik = '' WHERE lirik IS NULL");
        $results[] = "✅ UPDATE lirik NULL rows done";
    }
}

// ============================================================
// Show final table structure
// ============================================================
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
