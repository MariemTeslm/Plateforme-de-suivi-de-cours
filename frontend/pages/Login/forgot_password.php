<?php
session_start();
require 'db.php';

// Inclure PHPMailer
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$message = "";
$messageType = "error";

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['email'])) {
    $email = trim($_POST['email']);
    $roles = ['etudiant', 'professeur', 'admin'];
    $found = false;

    foreach ($roles as $role) {
        $table = ($role === 'admin') ? 'admin' : ($role === 'etudiant' ? 'etudiant' : 'professeur');
        $stmt = $pdo->prepare("SELECT * FROM $table WHERE email=?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $found = true;
            $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            $expires = date("Y-m-d H:i:s", strtotime("+10 minutes"));

            // Supprimer anciens OTP
            $stmt = $pdo->prepare("DELETE FROM password_resets WHERE email=?");
            $stmt->execute([$email]);

            // Stocker OTP
            $stmt = $pdo->prepare("INSERT INTO password_resets (email, role, otp, expires_at) VALUES (?, ?, ?, ?)");
            $stmt->execute([$email, $role, $otp, $expires]);

            // Envoyer OTP via Gmail
            $mail = new PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host = 'smtp.gmail.com';
                $mail->SMTPAuth = true;
                $mail->Username = 'school250009@gmail.com';
                $mail->Password = 'buqs dmiw lwli nxzv';
                $mail->SMTPSecure = 'tls';
                $mail->Port = 587;
                $mail->SMTPOptions = [
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                        'allow_self_signed' => true
                    ]
                ];

                $mail->setFrom('school250009@gmail.com', 'SupNum');
                $mail->addAddress($email);
                $mail->isHTML(true);
                $mail->Subject = 'Code de réinitialisation - SupNum';
                $mail->Body = "
                    <div style='font-family:sans-serif;max-width:500px;margin:auto;padding:30px;background:#f8fafc;border-radius:16px;'>
                        <h2 style='color:#2563eb;'>Réinitialisation du mot de passe</h2>
                        <p>Votre code de vérification est :</p>
                        <div style='font-size:36px;font-weight:bold;letter-spacing:12px;color:#1e40af;padding:20px;background:#eff6ff;border-radius:12px;text-align:center;'>$otp</div>
                        <p style='color:#64748b;font-size:0.9rem;margin-top:16px;'>Ce code expire dans <strong>10 minutes</strong>.</p>
                    </div>
                ";

                $mail->send();

                $_SESSION['reset_email'] = $email;
                $_SESSION['reset_role'] = $role;

                header("Location: verify_otp.php");
                exit;

            } catch (Exception $e) {
                $message = "Erreur d'envoi email : " . $mail->ErrorInfo;
            }
            break;
        }
    }

    if (!$found) {
        $message = "Aucun compte trouvé avec cet email.";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>SupNum – Mot de passe oublié</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Outfit', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #e8f0fe 0%, #dbeafe 40%, #ede9fe 100%);
            padding: 2rem 1rem;
        }

        .card {
            width: 100%;
            max-width: 420px;
            background: #ffffff;
            border-radius: 28px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 20px 60px rgba(37, 99, 235, 0.12), 0 8px 24px rgba(0,0,0,0.08);
            padding: 2.5rem;
            animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        .icon-circle {
            width: 72px;
            height: 72px;
            background: linear-gradient(135deg, #2563eb, #6366f1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            box-shadow: 0 8px 24px rgba(37,99,235,0.3);
        }

        .icon-circle svg {
            width: 32px;
            height: 32px;
            color: white;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
        }

        h1 {
            text-align: center;
            font-size: 1.6rem;
            font-weight: 700;
            background: linear-gradient(135deg, #2563eb, #6366f1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.4rem;
        }

        .subtitle {
            text-align: center;
            color: #64748b;
            font-size: 0.9rem;
            margin-bottom: 2rem;
            line-height: 1.5;
        }

        label {
            display: block;
            font-size: 0.8rem;
            font-weight: 600;
            color: #475569;
            margin-bottom: 6px;
            letter-spacing: 0.02em;
        }

        input[type="email"] {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-family: 'Outfit', sans-serif;
            font-size: 0.95rem;
            color: #1e293b;
            background: #f8fafc;
            transition: border-color 0.2s, box-shadow 0.2s;
            outline: none;
        }

        input[type="email"]:focus {
            border-color: #2563eb;
            background: white;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .btn {
            width: 100%;
            padding: 13px;
            background: linear-gradient(135deg, #2563eb, #6366f1);
            color: white;
            border: none;
            border-radius: 12px;
            font-family: 'Outfit', sans-serif;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1.5rem;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
        }

        .btn:active { transform: translateY(0); }

        .alert {
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 0.875rem;
            margin-bottom: 1.2rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .alert-error {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }

        .back-link {
            display: block;
            text-align: center;
            margin-top: 1.5rem;
            color: #64748b;
            font-size: 0.875rem;
            text-decoration: none;
            transition: color 0.2s;
        }

        .back-link:hover { color: #2563eb; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-circle">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>

        <h1>Mot de passe oublié</h1>
        <p class="subtitle">Entrez votre adresse email. Nous vous enverrons un code de vérification.</p>

        <?php if ($message): ?>
            <div class="alert alert-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>

        <form method="POST">
            <label for="email">Adresse email</label>
            <input type="email" id="email" name="email" placeholder="nom@exemple.com" required
                   value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>">

            <button type="submit" class="btn">Envoyer le code →</button>
        </form>

        <a href="index.html" class="back-link">← Retour à la connexion</a>
    </div>
</body>
</html>
