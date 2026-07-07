<?php
require "config.php";
requireAdmin();

$data = json_decode(file_get_contents('php://input'), true);

$lagu_id = intval($data['lagu_id'] ?? 0);
$tebak_lagu_id = intval($data['tebak_lagu_id'] ?? 0);
$judul_lagu = trim($data['judul_lagu'] ?? '');
$artis = trim($data['artis'] ?? '');
$lirik = trim($data['lirik'] ?? '');
$jawaban = $data['jawaban'] ?? [];
$deezer_track_id = intval($data['deezer_track_id'] ?? 0);
$genre_id = intval($data['genre_id'] ?? 0);

// Validasi
if ($tebak_lagu_id <= 0 || empty($lirik) || $genre_id <= 0 || $deezer_track_id <= 0) {
    echo json_encode([
        "error" => "Data tidak lengkap! Pastikan kategori, genre, dan lagu Deezer sudah dipilih."
    ]);
    exit;
}

$conn->begin_transaction();

try {

    if ($lagu_id > 0) {

        // UPDATE LAGU
        $stmt = $conn->prepare("
            UPDATE lagu
            SET
                judul_lagu = ?,
                artis = ?,
                lirik = ?,
                deezer_track_id = ?,
                genre_id = ?
            WHERE id = ?
        ");

        $stmt->bind_param(
            "sssiii",
            $judul_lagu,
            $artis,
            $lirik,
            $deezer_track_id,
            $genre_id,
            $lagu_id
        );

        $stmt->execute();

    } else {

        // INSERT LAGU
        $stmt = $conn->prepare("
            INSERT INTO lagu
            (
                tebak_lagu_id,
                judul_lagu,
                artis,
                lirik,
                deezer_track_id,
                genre_id
            )
            VALUES
            (
                ?, ?, ?, ?, ?, ?
            )
        ");

        $stmt->bind_param(
            "isssii",
            $tebak_lagu_id,
            $judul_lagu,
            $artis,
            $lirik,
            $deezer_track_id,
            $genre_id
        );

        $stmt->execute();

        $lagu_id = $conn->insert_id;
    }

    // ==========================
    // SIMPAN JAWABAN
    // ==========================

    $incomingIds = [];

    foreach ($jawaban as $j) {

        $txt = trim($j['jawaban_text'] ?? '');
        $isCorr = intval($j['is_correct'] ?? 0);
        $jId = intval($j['id'] ?? 0);

        if ($txt === '') {
            continue;
        }

        if ($jId > 0) {

            $stmtJ = $conn->prepare("
                UPDATE jawaban
                SET
                    jawaban_text = ?,
                    is_correct = ?
                WHERE id = ?
                AND lagu_id = ?
            ");

            $stmtJ->bind_param(
                "siii",
                $txt,
                $isCorr,
                $jId,
                $lagu_id
            );

            $stmtJ->execute();

            $incomingIds[] = $jId;

        } else {

            $stmtJ = $conn->prepare("
                INSERT INTO jawaban
                (
                    lagu_id,
                    jawaban_text,
                    is_correct
                )
                VALUES
                (
                    ?, ?, ?
                )
            ");

            $stmtJ->bind_param(
                "isi",
                $lagu_id,
                $txt,
                $isCorr
            );

            $stmtJ->execute();

            $incomingIds[] = $conn->insert_id;
        }
    }

    // Hapus jawaban lama yang tidak dipakai lagi
    if ($lagu_id > 0 && count($incomingIds) > 0) {

        $idList = implode(',', array_map('intval', $incomingIds));

        $conn->query("
            DELETE FROM jawaban
            WHERE lagu_id = $lagu_id
            AND id NOT IN ($idList)
        ");
    }

    $conn->commit();

    echo json_encode([
        "success" => true
    ]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}