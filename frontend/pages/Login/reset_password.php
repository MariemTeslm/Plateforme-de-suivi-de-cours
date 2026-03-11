<?php
session_start();
require 'db.php';

if (!isset($_SESSION['reset_email'], $_SESSION['reset_role'], $_SESSION['reset_verified']) || $_SESSION['reset_verified'] !== true) {
    header("Location: forgot_password.php");
    exit;
}

$email = $_SESSION['reset_email'];
$role = $_SESSION['reset_role'];
$message = "";
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['new_password'], $_POST['confirm_password'])) {
    $new = $_POST['new_password'];
    $confirm = $_POST['confirm_password'];

    if (strlen($new) < 6) {
        $message = "Le mot de passe doit contenir au moins 6 caractères.";
    } elseif ($new !== $confirm) {
        $message = "Les mots de passe ne correspondent pas.";
    } else {
        $hashed = password_hash($new, PASSWORD_BCRYPT);
        $table = ($role === 'admin') ? 'admin' : ($role === 'etudiant' ? 'etudiant' : 'professeur');

        $stmt = $pdo->prepare("UPDATE $table SET mot_de_passe=? WHERE email=?");
        $stmt->execute([$hashed, $email]);

        $stmt = $pdo->prepare("DELETE FROM password_resets WHERE email=? AND role=?");
        $stmt->execute([$email, $role]);

        session_unset();
        session_destroy();

        $success = true;
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>SupNum – Nouveau mot de passe</title>
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
            background: linear-gradient(135deg, #7c3aed, #6366f1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            box-shadow: 0 8px 24px rgba(124,58,237,0.3);
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
            background: linear-gradient(135deg, #7c3aed, #2563eb);
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

        .form-group { margin-bottom: 1.2rem; }

        label {
            display: block;
            font-size: 0.8rem;
            font-weight: 600;
            color: #475569;
            margin-bottom: 6px;
            letter-spacing: 0.02em;
        }

        .input-wrap { position: relative; }

        input[type="password"], input[type="text"] {
            width: 100%;
            padding: 12px 44px 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-family: 'Outfit', sans-serif;
            font-size: 0.95rem;
            color: #1e293b;
            background: #f8fafc;
            transition: border-color 0.2s, box-shadow 0.2s;
            outline: none;
        }

        input:focus {
            border-color: #7c3aed;
            background: white;
            box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        }

        .toggle-pwd {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #94a3b8;
            background: none;
            border: none;
            padding: 0;
        }

        .strength-bar {
            height: 4px;
            border-radius: 4px;
            background: #e2e8f0;
            margin-top: 8px;
            overflow: hidden;
        }

        .strength-fill {
            height: 100%;
            width: 0%;
            border-radius: 4px;
            transition: width 0.4s, background 0.4s;
        }

        .strength-label {
            font-size: 0.75rem;
            color: #94a3b8;
            margin-top: 4px;
        }

        .btn {
            width: 100%;
            padding: 13px;
            background: linear-gradient(135deg, #7c3aed, #6366f1);
            color: white;
            border: none;
            border-radius: 12px;
            font-family: 'Outfit', sans-serif;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 0.5rem;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
        }

        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4); }

        .alert { padding: 12px 16px; border-radius: 10px; font-size: 0.875rem; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 8px; }
        .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; flex-direction: column; align-items: flex-start; gap: 12px; }
        .alert-success a { color: #2563eb; font-weight: 600; text-decoration: none; }

        /* Success state */
        .success-icon {
            width: 72px; height: 72px;
            background: linear-gradient(135deg, #059669, #10b981);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 1.5rem;
            box-shadow: 0 8px 24px rgba(5,150,105,0.3);
        }
    </style>
</head>
<body>
    <div class="card">
        <?php if ($success): ?>
            <div class="success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style="background: linear-gradient(135deg, #059669, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Succès !</h1>
            <p class="subtitle">Votre mot de passe a été mis à jour avec succès.</p>
            <a href="index.html" class="btn" style="display:block; text-align:center; text-decoration:none; margin-top: 1rem;">
                Se connecter maintenant →
            </a>
        <?php else: ?>
            <div class="icon-circle">
                <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>

            <h1>Nouveau mot de passe</h1>
            <p class="subtitle">Choisissez un mot de passe fort pour sécuriser votre compte.</p>

            <?php if ($message): ?>
                <div class="alert alert-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <?php echo htmlspecialchars($message); ?>
                </div>
            <?php endif; ?>

            <form method="POST">
                <div class="form-group">
                    <label>Nouveau mot de passe</label>
                    <div class="input-wrap">
                        <input type="password" name="new_password" id="new_pwd" minlength="6" required placeholder="Minimum 6 caractères">
                        <button type="button" class="toggle-pwd" onclick="togglePwd('new_pwd', this)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>
                    <div class="strength-bar"><div class="strength-fill" id="strengthFill"></div></div>
                    <div class="strength-label" id="strengthLabel">Saisissez un mot de passe</div>
                </div>

                <div class="form-group">
                    <label>Confirmer le mot de passe</label>
                    <div class="input-wrap">
                        <input type="password" name="confirm_password" id="confirm_pwd" minlength="6" required placeholder="Répétez le mot de passe">
                        <button type="button" class="toggle-pwd" onclick="togglePwd('confirm_pwd', this)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn">Changer le mot de passe →</button>
            </form>
        <?php endif; ?>
    </div>

    <script>
        function togglePwd(id, btn) {
            const input = document.getElementById(id);
            input.type = input.type === 'password' ? 'text' : 'password';
        }

        const pwdInput = document.getElementById('new_pwd');
        const fill = document.getElementById('strengthFill');
        const label = document.getElementById('strengthLabel');

        if (pwdInput) {
            pwdInput.addEventListener('input', () => {
                const val = pwdInput.value;
                let score = 0;
                if (val.length >= 6) score++;
                if (val.length >= 10) score++;
                if (/[A-Z]/.test(val)) score++;
                if (/[0-9]/.test(val)) score++;
                if (/[^A-Za-z0-9]/.test(val)) score++;

                const levels = [
                    { pct: '0%', color: '#e2e8f0', text: 'Saisissez un mot de passe' },
                    { pct: '25%', color: '#ef4444', text: 'Très faible' },
                    { pct: '45%', color: '#f97316', text: 'Faible' },
                    { pct: '65%', color: '#eab308', text: 'Moyen' },
                    { pct: '85%', color: '#22c55e', text: 'Fort' },
                    { pct: '100%', color: '#059669', text: 'Très fort ✓' }
                ];

                const lvl = levels[val.length === 0 ? 0 : Math.min(score, 5)];
                fill.style.width = lvl.pct;
                fill.style.background = lvl.color;
                label.textContent = lvl.text;
                label.style.color = lvl.color;
            });
        }
    </script>
</body>
</html>
