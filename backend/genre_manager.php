<?php
require "config.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $conn->query("SELECT * FROM genre ORDER BY nama_genre ASC");
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
} 

elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $nama = trim($data['nama_genre'] ?? '');
    $id = intval($data['id'] ?? 0);

    if ($id > 0) {
        $stmt = $conn->prepare("UPDATE genre SET nama_genre = ? WHERE id = ?");
        $stmt->bind_param("si", $nama, $id);
    } else {
        $stmt = $conn->prepare("INSERT INTO genre (nama_genre) VALUES (?)");
        $stmt->bind_param("s", $nama);
    }
    $stmt->execute();
    echo json_encode(["success" => true]);
} 

elseif ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    $conn->query("DELETE FROM genre WHERE id = $id");
    echo json_encode(["success" => true]);
}
?>