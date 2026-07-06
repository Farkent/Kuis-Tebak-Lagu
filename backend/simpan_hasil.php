<?php
require "config.php";

$data = json_decode(file_get_contents('php://input'), true);
$nama = trim($data['nama'] ?? '');
$tebak_lagu_id = intval($data['tebak_lagu_id'] ?? 0);
$skor = intval($data['skor'] ?? 0);
$total = intval($data['total'] ?? 0);

// Validasi input
if (!$nama || $tebak_lagu_id <= 0) {
    echo json_encode(["error" => "Nama dan ID Tebak Lagu wajib diisi"]);
    exit;
}

// Validasi nama unik: setidaknya harus mengandung angka atau simbol unik
if (!preg_match('/[0-9_*]/', $nama)) {
    echo json_encode(["error" => "Masukkan nama dengan kode unik (angka atau simbol seperti _ atau *). Contoh: CHANDRA_01"]);
    exit;
}

// ============================================================================
// LOGIC: Check existing score untuk player ini di quiz ini
// ============================================================================

$selectStmt = $conn->prepare("SELECT id, skor FROM hasil WHERE tebak_lagu_id = ? AND nama_pemain = ? LIMIT 1");
$selectStmt->bind_param("is", $tebak_lagu_id, $nama);
$selectStmt->execute();
$selectResult = $selectStmt->get_result();
$existingRecord = $selectResult->fetch_assoc();

// ============================================================================
// CASE 1: Sudah ada record lama
// ============================================================================
if ($existingRecord) {
    $existingId = intval($existingRecord['id']);
    $existingSkor = intval($existingRecord['skor']);
    
    // Sub-case A: Skor baru LEBIH TINGGI → UPDATE record
    if ($skor > $existingSkor) {
        $updateStmt = $conn->prepare("UPDATE hasil SET skor = ?, total = ?, created_at = NOW() WHERE id = ?");
        $updateStmt->bind_param("iii", $skor, $total, $existingId);
        $success = $updateStmt->execute();
        
        if ($success) {
            // ✅ SUCCESS: Data di-update dengan skor lebih tinggi
            echo json_encode([
                "success" => true,
                "updated" => true,
                "message" => "Skor berhasil diperbarui ke leaderboard!"
            ]);
            exit;
        } else {
            // ❌ ERROR: Update gagal
            echo json_encode(["error" => "Gagal memperbarui skor ke database"]);
            exit;
        }
    }
    // Sub-case B: Skor lama LEBIH TINGGI atau SAMA → TIDAK DI-UPDATE
    else {
        echo json_encode([
            "success" => true,
            "updated" => false,
            "previous" => $existingSkor,
            "message" => "Skor sebelumnya lebih tinggi. Tidak diganti."
        ]);
        exit;
    }
}

// ============================================================================
// CASE 2: Tidak ada record lama → INSERT record baru
// ============================================================================
else {
    $stmt = $conn->prepare("INSERT INTO hasil (tebak_lagu_id, nama_pemain, skor, total, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->bind_param("isii", $tebak_lagu_id, $nama, $skor, $total);
    $success = $stmt->execute();
    
    if ($success) {
        // ✅ SUCCESS: Record baru berhasil dibuat
        echo json_encode([
            "success" => true,
            "updated" => true,
            "message" => "Skor berhasil disimpan ke leaderboard!"
        ]);
        exit;
    } else {
        // ❌ ERROR: Insert gagal
        echo json_encode(["error" => "Gagal menyimpan skor ke database"]);
        exit;
    }
}

// Fallback (seharusnya tidak pernah sampai sini)
echo json_encode(["error" => "Terjadi kesalahan yang tidak terduga"]);
?>