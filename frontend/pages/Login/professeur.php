<?php
session_start();

// التأكد أن المستخدم مسجل الدخول وأنه أستاذ
if(!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'professeur'){
    header("Location: login.php");
    exit();
}
?>

<h1>Bienvenue <?php echo $_SESSION['user_name']; ?> !</h1>
<p>Page des professeurs.</p>
<a href="logout.php">Déconnexion</a>
