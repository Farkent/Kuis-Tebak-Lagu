<?php
// admin_leaderboard.php
// API untuk admin melihat dan manage semua hasil leaderboard

require "config.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    requireAdmin();
}

// ═══════════════════════════════════════════════════════════════
// GET: Ambil semua hasil/leaderboard data
// ═══════════════════════════════════════════════════════════════
if ($method === 'GET') {
    $tebak_lagu_id = isset($_GET['tebak_lagu_id']) ? intval($_GET['tebak_lagu_id']) : 0;
    
    if ($tebak_lagu_id > 0) {
        $stmt = $conn->prepare("SELECT h.id, h.nama_pemain, h.skor, h.total, h.tebak_lagu_id, 
                       t.title AS tebak_lagu_title, 
                       DATE_FORMAT(h.created_at, '%d %b %Y %H:%i') AS dimainkan_pada,
                       h.created_at
                FROM hasil h
                LEFT JOIN tebak_lagu t ON t.id = h.tebak_lagu_id
                WHERE h.tebak_lagu_id = ?
                ORDER BY h.skor DESC, h.created_at ASC");
        $stmt->bind_param("i", $tebak_lagu_id);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $sql = "SELECT h.id, h.nama_pemain, h.skor, h.total, h.tebak_lagu_id, 
                       t.title AS tebak_lagu_title, 
                       DATE_FORMAT(h.created_at, '%d %b %Y %H:%i') AS dimainkan_pada,
                       h.created_at
                FROM hasil h
                LEFT JOIN tebak_lagu t ON t.id = h.tebak_lagu_id
                ORDER BY h.skor DESC, h.created_at ASC";
        $result = $conn->query($sql);
    }
    
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    
    echo json_encode($rows);
    exit;
}

// ═══════════════════════════════════════════════════════════════
// DELETE: Hapus single result
// ═══════════════════════════════════════════════════════════════
elseif ($method === 'DELETE') {
    parse_str(file_get_contents('php://input'), $_DELETE);
    $result_id = intval($_DELETE['id'] ?? 0);
    
    if ($result_id <= 0) {
        echo json_encode(["error" => "ID hasil tidak valid"]);
        exit;
    }
    
    $stmt = $conn->prepare("DELETE FROM hasil WHERE id = ?");
    $stmt->bind_param("i", $result_id);
    $success = $stmt->execute();
    
    if ($success) {
        echo json_encode(["success" => true, "message" => "Hasil dihapus"]);
    } else {
        echo json_encode(["error" => "Gagal menghapus hasil"]);
    }
    exit;
}

// ═══════════════════════════════════════════════════════════════
// POST: Reset leaderboard (dengan opsi kategori spesifik)
// ═══════════════════════════════════════════════════════════════
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    $tebak_lagu_id = intval($data['tebak_lagu_id'] ?? 0);
    
    // ─────────────────────────────────────────────────────────
    // Action: Reset ALL leaderboard
    // ─────────────────────────────────────────────────────────
    if ($action === 'reset_all') {
        $confirm = $data['confirm'] ?? false;
        
        if (!$confirm) {
            echo json_encode([
                "error" => "Confirmation required",
                "message" => "Aksi ini akan menghapus SEMUA data leaderboard. Tidak bisa di-undo!"
            ]);
            exit;
        }
        
        $conn->begin_transaction();
        try {
            $conn->query("DELETE FROM hasil");
            $conn->commit();
            
            echo json_encode([
                "success" => true,
                "message" => "SEMUA data leaderboard berhasil di-reset!"
            ]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(["error" => "Gagal reset leaderboard: " . $e->getMessage()]);
        }
        exit;
    }
    
    // ─────────────────────────────────────────────────────────
    // Action: Reset leaderboard untuk kategori tertentu
    // ─────────────────────────────────────────────────────────
    elseif ($action === 'reset_category') {
        if ($tebak_lagu_id <= 0) {
            echo json_encode(["error" => "ID kategori tidak valid"]);
            exit;
        }
        
        $confirm = $data['confirm'] ?? false;
        
        if (!$confirm) {
            echo json_encode([
                "error" => "Confirmation required",
                "message" => "Aksi ini akan menghapus SEMUA data leaderboard untuk kategori ini!"
            ]);
            exit;
        }
        
        $conn->begin_transaction();
        try {
            $stmt = $conn->prepare("DELETE FROM hasil WHERE tebak_lagu_id = ?");
            $stmt->bind_param("i", $tebak_lagu_id);
            $stmt->execute();
            $conn->commit();
            
            echo json_encode([
                "success" => true,
                "message" => "Data leaderboard untuk kategori ini berhasil di-reset!"
            ]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(["error" => "Gagal reset leaderboard: " . $e->getMessage()]);
        }
        exit;
    }
    
    // ─────────────────────────────────────────────────────────
    // Action: Delete specific user result
    // ─────────────────────────────────────────────────────────
    elseif ($action === 'delete_result') {
        $result_id = intval($data['result_id'] ?? 0);
        
        if ($result_id <= 0) {
            echo json_encode(["error" => "ID hasil tidak valid"]);
            exit;
        }
        
        $stmt = $conn->prepare("DELETE FROM hasil WHERE id = ?");
        $stmt->bind_param("i", $result_id);
        $success = $stmt->execute();
        
        if ($success) {
            echo json_encode([
                "success" => true,
                "message" => "Hasil pemain dihapus!"
            ]);
        } else {
            echo json_encode(["error" => "Gagal menghapus hasil"]);
        }
        exit;
    }
    
    // ─────────────────────────────────────────────────────────
    // Action: Delete all results by player name (across all categories)
    // ─────────────────────────────────────────────────────────
    elseif ($action === 'delete_player') {
        $nama_pemain = trim($data['nama_pemain'] ?? '');
        
        if (!$nama_pemain) {
            echo json_encode(["error" => "Nama pemain tidak valid"]);
            exit;
        }
        
        $confirm = $data['confirm'] ?? false;
        
        if (!$confirm) {
            echo json_encode([
                "error" => "Confirmation required",
                "message" => "Aksi ini akan menghapus SEMUA skor pemain ini di semua kategori!"
            ]);
            exit;
        }
        
        $stmt = $conn->prepare("DELETE FROM hasil WHERE nama_pemain = ?");
        $stmt->bind_param("s", $nama_pemain);
        $success = $stmt->execute();
        
        if ($success) {
            echo json_encode([
                "success" => true,
                "message" => "Semua skor pemain dihapus!"
            ]);
        } else {
            echo json_encode(["error" => "Gagal menghapus hasil"]);
        }
        exit;
    }
    
    echo json_encode(["error" => "Action tidak valid"]);
    exit;
}

echo json_encode(["error" => "Method tidak didukung"]);
?>