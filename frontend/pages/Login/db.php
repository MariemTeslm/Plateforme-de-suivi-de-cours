<?php
$host = "localhost";
$dbname = "school_db";
$user = "root"; // change selon ton MySQL
$pass = "";     // change selon ton MySQL

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e){
    die("Erreur de connexion: " . $e->getMessage());
}
?>
