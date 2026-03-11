<?php
session_start();
require 'db.php';

if (!isset($_SESSION['reset_email'], $_SESSION['reset_role'])) {
    header("Location: forgot_password.php");
    exit;
}

$email = $_SESSION['reset_email'];
$message = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['otp'])) {
    $otp = trim($_POST['otp']);
    $role = $_SESSION['reset_role'];

    $stmt = $pdo->prepare("SELECT * FROM password_resets WHERE email=? AND role=? AND otp=? AND expires_at > NOW()");
    $stmt->execute([$email, $role, $otp]);
    $reset = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($reset) {
        $_SESSION['reset_verified'] = true;
        header("Location: reset_password.php");
        exit;
    } else {
        $message = "Code incorrect ou expiré. Vérifiez votre email et réessayez.";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>SupNum – Vérification OTP</title>
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
            background: linear-gradient(135deg, #059669, #10b981);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            box-shadow: 0 8px 24px rgba(5,150,105,0.3);
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
            background: linear-gradient(135deg, #059669, #2563eb);
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

        .email-badge {
            display: inline-block;
            background: #eff6ff;
            color: #2563eb;
            font-weight: 600;
            padding: 2px 10px;
            border-radius: 6px;
            font-size: 0.85rem;
        }

        label {
            display: block;
            font-size: 0.8rem;
            font-weight: 600;
            color: #475569;
            margin-bottom: 6px;
            letter-spacing: 0.02em;
        }

        /* OTP 6-digit inputs */
        .otp-group {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 0.5rem;
        }

        .otp-group input {
            width: 52px;
            height: 60px;
            text-align: center;
            font-size: 1.6rem;
            font-weight: 700;
            color: #1e293b;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            background: #f8fafc;
            font-family: 'Outfit', sans-serif;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .otp-group input:focus {
            border-color: #059669;
            background: white;
            box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
        }

        /* Hidden real input */
        #otp { display: none; }

        .btn {
            width: 100%;
            padding: 13px;
            background: linear-gradient(135deg, #059669, #10b981);
            color: white;
            border: none;
            border-radius: 12px;
            font-family: 'Outfit', sans-serif;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1.5rem;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 16px rgba(5, 150, 105, 0.3);
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(5, 150, 105, 0.4);
        }

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

        .back-link:hover { color: #059669; }

        .timer {
            text-align: center;
            font-size: 0.8rem;
            color: #94a3b8;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-circle">
            <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.71 3.37 2 2 0 0 1 3.71 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.57a16 16 0 0 0 6 6l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>

        <h1>Vérification</h1>
        <p class="subtitle">
            Entrez le code à 6 chiffres envoyé à<br>
            <span class="email-badge"><?php echo htmlspecialchars($email); ?></span>
        </p>

        <?php if ($message): ?>
            <div class="alert alert-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>

        <form method="POST" id="otpForm">
            <div class="otp-group">
                <input type="text" maxlength="1" class="otp-digit" inputmode="numeric" pattern="[0-9]">
                <input type="text" maxlength="1" class="otp-digit" inputmode="numeric" pattern="[0-9]">
                <input type="text" maxlength="1" class="otp-digit" inputmode="numeric" pattern="[0-9]">
                <input type="text" maxlength="1" class="otp-digit" inputmode="numeric" pattern="[0-9]">
                <input type="text" maxlength="1" class="otp-digit" inputmode="numeric" pattern="[0-9]">
                <input type="text" maxlength="1" class="otp-digit" inputmode="numeric" pattern="[0-9]">
            </div>
            <input type="hidden" name="otp" id="otp">

            <div class="timer" id="timer">Le code expire dans <strong>10:00</strong></div>

            <button type="submit" class="btn">Vérifier le code →</button>
        </form>

        <a href="forgot_password.php" class="back-link">← Renvoyer un nouveau code</a>
    </div>

    <script>
        // OTP digit navigation
        const digits = document.querySelectorAll('.otp-digit');
        digits.forEach((input, idx) => {
            input.addEventListener('input', () => {
                input.value = input.value.replace(/[^0-9]/g, '');
                if (input.value && idx < digits.length - 1) digits[idx + 1].focus();
                combineOTP();
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !input.value && idx > 0) digits[idx - 1].focus();
            });
            input.addEventListener('paste', (e) => {
                const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
                digits.forEach((d, i) => { d.value = paste[i] || ''; });
                combineOTP();
                e.preventDefault();
            });
        });

        function combineOTP() {
            document.getElementById('otp').value = [...digits].map(d => d.value).join('');
        }

        // Countdown timer
        let seconds = 600;
        const timerEl = document.getElementById('timer').querySelector('strong');
        const countdown = setInterval(() => {
            seconds--;
            const m = Math.floor(seconds / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            timerEl.textContent = `${m}:${s}`;
            if (seconds <= 0) {
                clearInterval(countdown);
                timerEl.parentElement.innerHTML = '<span style="color:#dc2626;">Code expiré. <a href="forgot_password.php">Renvoyer un nouveau code</a></span>';
            }
        }, 1000);

        // Auto-submit when all digits filled
        document.getElementById('otpForm').addEventListener('submit', function(e) {
            combineOTP();
            const otp = document.getElementById('otp').value;
            if (otp.length !== 6) {
                e.preventDefault();
                alert('Veuillez entrer les 6 chiffres du code.');
            }
        });
    </script>
</body>
</html>
