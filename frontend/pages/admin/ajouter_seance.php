<?php
session_start(); // obligatoire pour stocker le message temporaire

$pdo = new PDO("mysql:host=localhost;dbname=school_db;charset=utf8","root","");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// 🔹 Trouver la semaine active OU la semaine courante
$semaine = $pdo->query("
    SELECT * FROM semaines
    WHERE is_active = 1
    LIMIT 1
")->fetch(PDO::FETCH_ASSOC);

if (!$semaine) {
    $semaine = $pdo->query("
        SELECT * FROM semaines
        WHERE CURDATE() BETWEEN date_debut AND date_fin
        LIMIT 1
    ")->fetch(PDO::FETCH_ASSOC);
}

if (!$semaine) {
    die("Aucune semaine valide trouvée !");
}

$id_semaine = $semaine['id'];

// Récupération des données pour les listes
$groupes = $pdo->query("SELECT id_groupe, nom FROM groupe")->fetchAll(PDO::FETCH_ASSOC);
$profs   = $pdo->query("SELECT id_professeur, nom FROM professeur")->fetchAll(PDO::FETCH_ASSOC);
$matieres= $pdo->query("SELECT code, nom FROM matiere")->fetchAll(PDO::FETCH_ASSOC);
$salles  = $pdo->query("SELECT id_salle, nom_salle FROM salle")->fetchAll(PDO::FETCH_ASSOC);
$periodes= $pdo->query("SELECT id_periode, heure_debut, heure_fin FROM periode")->fetchAll(PDO::FETCH_ASSOC);
$jours   = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

// Message vide au départ
$message = '';

// Gestion du formulaire
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_groupe     = $_POST['id_groupe'] ?? null;
    $id_professeur = $_POST['id_professeur'] ?? null;
    $code_matiere  = $_POST['code_matiere'] ?? null;
    $id_salle      = $_POST['id_salle'] ?? null;
    $id_periode    = $_POST['id_periode'] ?? null;
    $jour          = $_POST['jour'] ?? null;

    // Vérifier si au moins un champ est rempli
    if($id_groupe || $id_professeur || $code_matiere || $id_salle || $id_periode || $jour){

        // Vérification des conflits uniquement si tous les champs essentiels sont remplis
        if($id_groupe && $id_professeur && $code_matiere && $id_salle && $id_periode && $jour){
            $check = $pdo->prepare("
                SELECT * FROM emploi_seance
                WHERE id_semaine = ? AND id_periode = ? AND jour = ? 
                  AND (id_salle=? OR id_professeur=? OR id_groupe=?)
            ");
            $check->execute([$id_semaine, $id_periode, $jour, $id_salle, $id_professeur, $id_groupe]);

            if($check->rowCount() > 0){
                // 🔹 Message de conflit
                $_SESSION['message'] = "<span style='color:red'>Erreur : conflit détecté ! Salle, professeur ou groupe déjà occupé à cette période.</span>";
            } else {
                // 🔹 Insérer les données
                $stmt = $pdo->prepare("
                    INSERT INTO emploi_seance
                    (id_groupe,id_professeur,code_matiere,id_salle,id_periode,jour,id_semaine)
                    VALUES(?,?,?,?,?,?,?)
                ");
                $stmt->execute([$id_groupe,$id_professeur,$code_matiere,$id_salle,$id_periode,$jour,$id_semaine]);

                $_SESSION['message'] = "<span style='color:green'>Séance ajoutée avec succès !</span>";
            }
        } else {
            // 🔹 Message si un champ essentiel est manquant
            $_SESSION['message'] = "<span style='color:red'>Veuillez remplir tous les champs !</span>";
        }

    } else {
        $_SESSION['message'] = "<span style='color:red'>Veuillez remplir au moins un champ !</span>";
    }

    // 🔹 Redirection pour effacer POST et permettre de faire disparaître le message après actualisation
    header("Location: ajouter_seance.php");
    exit;
}


// Récupérer le message stocké en session
if(!empty($_SESSION['message'])){
    $message = $_SESSION['message'];
    unset($_SESSION['message']);
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Ajouter Séance</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
</head>
<body>
<div class="app-layout">
        <aside class="sidebar">
            <div class="sidebar-header">
                <img src="../../assets/images/logo.jpeg" alt="supnum" class="sidebar-logo">
                <span class="sidebar-title">supnum</span>
            </div>
            <nav class="sidebar-nav">
                <a href="admin.html" class="nav-item active">
                    <span class="icon">🏠</span>
                    Accueil
                </a>
                <a href="gestionUtilisateur.html" class="nav-item">
                    <span class="icon">👥</span>
                    Utilisateur
                </a>
                
                <a href="gestionsEtablissement.html" class="nav-item">
                    <span class="icon">🏢</span>
                    Etablissement
                </a>
                <a href="gestionEmploi.html" class="nav-item">
                    <span class="icon">📚</span>
                    Emploi du temps
                </a>
                
                <a href="../evaluation/evaluation.html" class="nav-item">
                    <span class="icon">📊</span>
                    Évaluations
                </a>
               
            </nav>
            <div style="margin-top: auto; padding-top: var(--space-xl); border-top: 1px solid var(--border-light);">
                <button onclick="logout()" class="btn btn-danger" style="width: 100%;">Déconnexion</button>
            </div>
        </aside>
        <main class="main-content">
            <h1>Ajouter une Séance</h1>
<form method="POST">
    <label>Groupe :</label>
    <select name="id_groupe">
        <option value="">-- Sélectionner --</option>
        <?php foreach($groupes as $g): ?>
            <option value="<?= $g['id_groupe'] ?>"><?= htmlspecialchars($g['nom']) ?></option>
        <?php endforeach; ?>
    </select>

    <label>Professeur :</label>
    <select name="id_professeur">
        <option value="">-- Sélectionner --</option>
        <?php foreach($profs as $p): ?>
            <option value="<?= $p['id_professeur'] ?>"><?= htmlspecialchars($p['nom']) ?></option>
        <?php endforeach; ?>
    </select>

    <label>Matière :</label>
    <select name="code_matiere">
        <option value="">-- Sélectionner --</option>
        <?php foreach($matieres as $m): ?>
            <option value="<?= $m['code'] ?>"><?= htmlspecialchars($m['nom']) ?></option>
        <?php endforeach; ?>
    </select>

    <label>Salle :</label>
    <select name="id_salle">
        <option value="">-- Sélectionner --</option>
        <?php foreach($salles as $s): ?>
            <option value="<?= $s['id_salle'] ?>"><?= htmlspecialchars($s['nom_salle']) ?></option>
        <?php endforeach; ?>
    </select>

    <label>Période :</label>
    <select name="id_periode">
        <option value="">-- Sélectionner --</option>
        <?php foreach($periodes as $p): ?>
            <option value="<?= $p['id_periode'] ?>"><?= htmlspecialchars($p['heure_debut']) ?> - <?= htmlspecialchars($p['heure_fin']) ?></option>
        <?php endforeach; ?>
    </select>

    <label>Jour :</label>
    <select name="jour">
        <option value="">-- Sélectionner --</option>
        <?php foreach($jours as $j): ?>
            <option value="<?= $j ?>"><?= $j ?></option>
        <?php endforeach; ?>
    </select>

    <div class="full center" style="margin-top: var(--space-lg); gap: var(--space-md);">
                        <button type="submit" id="submitBtn">Ajouter Séance</button>
                        <button type="button" id="cancelEdit" class="btn btn-outline" style="display: none;" onclick="cancelSeanceEdit()">Annuler</button>
                    </div>
</form>
 
       
<!-- 🔹 Message sous le formulaire -->
<?php if(!empty($message)): ?>
    <div class="message"><?= $message ?></div>
<?php endif; ?>

<div class="links">
    <a href="emploi.php">Voir l'emploi par groupe</a>
    <a href="emploi_professeur.php">Voir l'emploi par professeur</a>
</div>
 </main>
</body>
</html>
