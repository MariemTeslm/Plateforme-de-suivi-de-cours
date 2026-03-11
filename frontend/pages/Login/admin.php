<?php
session_start();

// التأكد أن المستخدم مسجل الدخول وأنه مدير / إدارة
if(!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin'){
    header("Location: login.php");
    exit();
}
?>

<h1>Bienvenue <?php echo $_SESSION['user_name']; ?> !</h1>
<p>Page de l'administration.</p>
<a href="logout.php">Déconnexion</a>
