<?php
session_start();
$pdo = new PDO("mysql:host=localhost;dbname=school_db;charset=utf8","root","");
$pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);

// Liste des professeurs
$profs = $pdo->query("SELECT id_professeur, nom FROM professeur")->fetchAll(PDO::FETCH_ASSOC);
if(empty($profs)) die("Aucun professeur trouvé !");

// Chercher la semaine active
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

// Récupérer l'id du professeur choisi
$id_prof = isset($_GET['id_prof']) ? $_GET['id_prof'] : null;

$periodes = $pdo->query("SELECT * FROM periode ORDER BY heure_debut")->fetchAll(PDO::FETCH_ASSOC);
$jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

$emploi = [];
if($id_prof){
    $stmt = $pdo->prepare("
        SELECT e.jour, per.id_periode, per.heure_debut, per.heure_fin,
               m.nom AS matiere, g.nom AS groupe, s.nom_salle AS salle
        FROM emploi_seance e
        JOIN periode per ON e.id_periode = per.id_periode
        JOIN matiere m ON e.code_matiere = m.code
        JOIN groupe g ON e.id_groupe = g.id_groupe
        JOIN salle s ON e.id_salle = s.id_salle
        WHERE e.id_professeur = ? AND e.id_semaine = ?
    ");
    $stmt->execute([$id_prof,$id_semaine]);
    $seances = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach($seances as $s){
        $emploi[$s['jour']][$s['id_periode']] = $s;
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Emploi du temps du professeur</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
<style>
 body {  
    margin-left: 270px;
    padding-right: 10px;
    margin-top: 20px;
}
select,button{padding:10px; width:100%; margin-top:12px; font-size:14px;}
button{background:#1b5e20; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;}
button:hover{background:#2e7d32;}
table{width:100%; border-collapse:collapse; margin-top:35px; background:white; box-shadow:0 3px 12px rgba(0,0,0,0.15);}
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
<?php if(!$id_prof): ?>
<div class="main-content">
    <form method="get">
        <label for="id_prof">Choisir un professeur :</label>
        <select name="id_prof" id="id_prof">
            <?php foreach($profs as $p): ?>
                <option value="<?= $p['id_professeur'] ?>"><?= htmlspecialchars($p['nom']) ?></option>
            <?php endforeach; ?>
        </select>
        <button type="submit">Afficher l'emploi</button>
    </form>
</div>
<?php endif; ?>

<?php if($id_prof): ?>
<h2>Emploi du temps du professeur <?= htmlspecialchars($profs[array_search($id_prof,array_column($profs,'id_professeur'))]['nom']) ?></h2>
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
                    <div class="ligne"><strong>Groupe :</strong> <?= htmlspecialchars($s['groupe']) ?></div>
                    <div class="ligne"><strong>Salle :</strong> <?= htmlspecialchars($s['salle']) ?></div>
                </div>
            <?php endif; ?>
            </td>
        <?php endforeach; ?>
    </tr>
    <?php endforeach; ?>
</table>
<?php endif; ?>

</body>
</html>