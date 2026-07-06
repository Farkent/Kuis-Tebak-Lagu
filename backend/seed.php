<?php
require "config.php";

try {
    $sql = file_get_contents("setup.sql");
    $conn->multi_query($sql);

    do {
        if ($result = $conn->store_result()) {
            $result->free();
        }
    } while ($conn->more_results() && $conn->next_result());

    echo "Database setup completed successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}