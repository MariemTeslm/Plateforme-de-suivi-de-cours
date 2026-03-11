<?php
session_start();

// 🔹 Vérifier que l'étudiant est connecté
if(!isset($_SESSION['id_etudiant'])){
    die("Vous devez être connecté pour voir votre emploi du temps !");
}

// 🔹 Récupérer l'ID du groupe et de l'étudiant depuis la session
$id_etudiant = $_SESSION['id_etudiant'];
$id_groupe   = $_SESSION['id_groupe'];

// Connexion à la base
$pdo = new PDO("mysql:host=localhost;dbname=school_db;charset=utf8","root","");
$pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);

// 🔹 Récupérer les informations de l'étudiant et son groupe
$stmt = $pdo->prepare("
    SELECT e.nom AS nom_etudiant, g.nom AS nom_groupe 
    FROM etudiant e
    JOIN groupe g ON e.id_groupe = g.id_groupe
    WHERE e.id_etudiant = ?
");
$stmt->execute([$id_etudiant]);
$etudiant = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$etudiant) die("Étudiant introuvable !");

// 🔹 Chercher la semaine active ou courante
$semaine = $pdo->query("
    SELECT * FROM semaines
    WHERE is_active = 1
    LIMIT 1
")->fetch(PDO::FETCH_ASSOC);

if(!$semaine){
    $semaine = $pdo->query("
        SELECT * FROM semaines
        WHERE CURDATE() BETWEEN date_debut AND date_fin
        LIMIT 1
    ")->fetch(PDO::FETCH_ASSOC);
}

if(!$semaine) die("Aucune semaine valide trouvée !");
$id_semaine = $semaine['id'];

// 🔹 Récupérer les périodes et les jours
$periodes = $pdo->query("SELECT * FROM periode ORDER BY heure_debut")->fetchAll(PDO::FETCH_ASSOC);
$jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

// 🔹 Récupérer l'emploi du groupe de l'étudiant
$emploi = [];
$stmt = $pdo->prepare("
    SELECT e.jour, per.id_periode, per.heure_debut, per.heure_fin,
           m.nom AS matiere, p.nom AS professeur, s.nom_salle AS salle
    FROM emploi_seance e
    JOIN periode per ON e.id_periode = per.id_periode
    JOIN matiere m ON e.code_matiere = m.code
    JOIN professeur p ON e.id_professeur = p.id_professeur
    JOIN salle s ON e.id_salle = s.id_salle
    WHERE e.id_groupe = ? AND e.id_semaine = ?
");
$stmt->execute([$id_groupe, $id_semaine]);
$seances = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($seances as $s){
    $emploi[$s['jour']][$s['id_periode']] = $s;
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Emploi du temps de <?= htmlspecialchars($etudiant['nom_etudiant']) ?></title>
<style>
body { font-family: Arial,sans-serif; background:#eef2f5; padding:20px; }
h2 { text-align:center; }
table{width:100%; border-collapse:collapse; margin-top:20px; background:white; box-shadow:0 3px 12px rgba(0,0,0,0.15);}
th{background:#0d9488; color:white; padding:12px; font-size:14px;}
td{border:1px solid #cfd8dc; padding:10px; vertical-align:top; background:#f9fbfc;}
.jour{background:#0d9488; color:white; font-weight:bold; text-align:center; width:120px;}
.cell-seance{font-size:13px; line-height:1.6;}
.cell-seance .ligne{margin-bottom:3px;}
.cell-seance strong{color:#1b5e20;}
tr:hover td{background:#e8f5e9;}
</style>
</head>
<body>

<h2>Emploi du temps du groupe <?= htmlspecialchars($etudiant['nom_groupe']) ?></h2>

<table>
    <tr>
        <th>Jour</th>
        <?php foreach($periodes as $p): ?>
            <th><?= substr($p['heure_debut'],0,5) ?> - <?= substr($p['heure_fin'],0,5) ?></th>
        <?php endforeach; ?>
    </tr>

    <?php foreach($jours as $jour): ?>
    <tr>
        <td class="jour"><?= $jour ?></td>
        <?php foreach($periodes as $p): ?>
            <td>
            <?php if(isset($emploi[$jour][$p['id_periode']])): 
                $s = $emploi[$jour][$p['id_periode']];
            ?>
                <div class="cell-seance">
                    <div class="ligne"><strong>Matière :</strong> <?= htmlspecialchars($s['matiere']) ?></div>
                    <div class="ligne"><strong>Professeur :</strong> <?= htmlspecialchars($s['professeur']) ?></div>
                    <div class="ligne"><strong>Salle :</strong> <?= htmlspecialchars($s['salle']) ?></div>
                </div>
            <?php endif; ?>
            </td>
        <?php endforeach; ?>
    </tr>
    <?php endforeach; ?>
</table>

</body>
</html>