<?php
require "config.php";

$sql = "SELECT id, title, description FROM tebak_lagu ORDER BY id";
$result = $conn->query($sql);

$tebak_lagu = [];
while ($row = $result->fetch_assoc()) {
    $tebak_lagu[] = $row;
}

echo json_encode($tebak_lagu);
?>