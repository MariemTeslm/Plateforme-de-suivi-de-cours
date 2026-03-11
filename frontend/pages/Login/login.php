<?php
session_start();
require 'db.php';

$message = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $password = $_POST['mot_de_passe'];

    $roles = ['etudiant', 'professeur', 'administrateur'];
    $user_found = false;

    foreach($roles as $role){
        $stmt = $pdo->prepare("SELECT * FROM $role WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if($user){
            if(password_verify($password, $user['mot_de_passe']) || $password === $user['mot_de_passe']){
                $_SESSION['user_id'] = $user[array_key_first($user)];
                $_SESSION['user_name'] = $user['nom'];
                $_SESSION['user_role'] = $role;

                if($role == 'etudiant') {
    $_SESSION['id_etudiant'] = $user['id_etudiant']; // ajout
    $_SESSION['id_groupe'] = $user['id_groupe'];   // ajout
    $_SESSION['user_name'] = $user['nom'];
    $_SESSION['user_role'] = $role;
    header("Location: ../students/emploi.php"); // redirection vers la page emploi
    exit();
}
                if($role == 'professeur') header("Location: ../profs/prof_dashboard.html");
                if($role == 'administrateur') header("Location: ../admin/admin.html");
                exit();
            } else {
                $message = "Mot de passe incorrect.";
            }
            $user_found = true;
            break;
        }
    }

    if(!$user_found){
        $message = "Utilisateur non trouvé.";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Connexion - supnum</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
</head>
<body>
    <div class="login-wrapper">
        <div class="login-card">
            <div style="text-align: center; margin-bottom: var(--space-xl);">
                <img src="../../assets/images/logo.jpeg" alt="supnum" class="circular-logo" style="width: 88px; height: 88px; margin-bottom: var(--space-lg);">
                <h1 style="font-size: 1.5rem; margin-bottom: var(--space-xs); color: var(--text-main);">supnum</h1>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">Système de suivi des cours</p>
            </div>

            <form method="POST" style="padding: 0;">
                <legend style="text-align: center;">Connexion</legend>
                <?php if ($message): ?>
                    <p style="background: var(--danger-light); color: var(--danger); padding: var(--space-md); border-radius: var(--radius-md); margin-bottom: var(--space-md); font-size: 0.9rem;"><?php echo htmlspecialchars($message); ?></p>
                <?php endif; ?>
                <div class="form-grid" style="gap: var(--space-md);">
                    <div class="full">
                        <label>Email</label>
                        <input type="email" name="email" placeholder="nom@universite.edu" required>
                    </div>
                    <div class="full">
                        <label>Mot de passe</label>
                        <input type="password" name="mot_de_passe" placeholder="••••••••" required>
                    </div>
                    <div class="full center" style="margin-top: var(--space-md);">
                        <button type="submit" style="min-width: 160px;">Se connecter</button>
                    </div>
                </div>
                <p style="text-align: center; margin-top: var(--space-lg);">
                    <a href="forgot_password.php" style="color: var(--primary); font-size: 0.9rem; font-weight: 500;">Mot de passe oublié ?</a>
                </p>
            </form>
        </div>
    </div>
</body>
</html>
