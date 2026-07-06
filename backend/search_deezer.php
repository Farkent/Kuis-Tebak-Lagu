<?php
require "config.php";

$query = isset($_GET['q']) ? trim($_GET['q']) : '';
if (empty($query)) {
    echo json_encode(["error" => "Query tidak boleh kosong"]);
    exit;
}

$url = "https://api.deezer.com/search/track?q=" . urlencode($query) . "&limit=10";

$context = stream_context_create([
    "http" => [
        "method" => "GET",
        "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n"
    ]
]);

$response = file_get_contents($url, false, $context);
if ($response === false) {
    echo json_encode(["error" => "Gagal mengambil data dari Deezer"]);
    exit;
}

$data = json_decode($response, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["error" => "Gagal parse response Deezer"]);
    exit;
}

$results = [];
if (isset($data['data']) && is_array($data['data'])) {
    foreach ($data['data'] as $track) {
        if ($track['readable']) { // Hanya track yang bisa diakses
            $results[] = [
                'id' => $track['id'],
                'title' => $track['title'],
                'artist' => $track['artist']['name'],
                'album' => $track['album']['title'],
                'preview_url' => $track['preview'] ?? null,
                'link' => $track['link'],
                'duration' => $track['duration']
            ];
        }
    }
}

echo json_encode($results);
?>