<?php
require "config.php";

$tebak_lagu_id = isset($_GET['tebak_lagu_id']) ? intval($_GET['tebak_lagu_id']) : 0;

if ($tebak_lagu_id <= 0) {
    echo json_encode([
        "error" => "ID Tebak Lagu tidak valid"
    ]);
    exit;
}

$sql = "SELECT
            l.id AS lid,
            l.lirik,
            l.deezer_track_id,
            l.genre_id,
            g.nama_genre,
            j.id AS jid,
            j.jawaban_text,
            j.is_correct
        FROM lagu l
        JOIN jawaban j
            ON j.lagu_id = l.id
        LEFT JOIN genre g
            ON g.id = l.genre_id
        WHERE l.tebak_lagu_id = ?
        ORDER BY l.id, j.id";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $tebak_lagu_id);
$stmt->execute();

$result = $stmt->get_result();

$lagu = [];
$currentId = null;

// cache supaya kalau ada track id yang sama tidak request berkali-kali
$previewCache = [];

while ($row = $result->fetch_assoc()) {

    if ($currentId !== $row['lid']) {

        $currentId = $row['lid'];

        $trackId = intval($row['deezer_track_id']);
        $preview = "";

        // Ambil preview terbaru dari Deezer
        if ($trackId > 0) {

            if (isset($previewCache[$trackId])) {

                $preview = $previewCache[$trackId];

            } else {

                $context = stream_context_create([
                    "http" => [
                        "method" => "GET",
                        "header" => "User-Agent: Mozilla/5.0\r\n",
                        "timeout" => 8
                    ]
                ]);

                $response = @file_get_contents(
                    "https://api.deezer.com/track/" . $trackId,
                    false,
                    $context
                );

                if ($response !== false) {

                    $track = json_decode($response, true);

                    if (
                        isset($track["preview"]) &&
                        !empty($track["preview"])
                    ) {
                        $preview = $track["preview"];
                    }
                }

                $previewCache[$trackId] = $preview;
            }
        }

        $lagu[] = [
            "id" => intval($row["lid"]),
            "lirik" => $row["lirik"],
            "deezer_track_id" => $trackId,
            "preview_url" => $preview,
            "genre_id" => intval($row["genre_id"]),
            "nama_genre" => $row["nama_genre"],
            "jawaban" => []
        ];
    }

    $lagu[count($lagu)-1]["jawaban"][] = [
        "id" => intval($row["jid"]),
        "jawaban_text" => $row["jawaban_text"],
        "is_correct" => intval($row["is_correct"]) === 1
    ];
}

// Acak jawaban
foreach ($lagu as &$song) {

    shuffle($song["jawaban"]);

}

echo json_encode(
    $lagu,
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);