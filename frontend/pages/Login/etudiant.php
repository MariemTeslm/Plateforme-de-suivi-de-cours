<?php
session_start();
if(!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'etudiant'){
    header("Location: login.php");
    exit();
}
?>

<h1>Bienvenue <?php echo $_SESSION['user_name']; ?> !</h1>
<p>Page des étudiants.</p>
<a href="logout.php">Déconnexion</a>
