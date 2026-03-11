 // Récupérer le groupe depuis l'URL, ex: emploi.html?groupe=G1
    const params = new URLSearchParams(window.location.search);
    const groupe = params.get("groupe");
    const api = API_BASE +"tableaux";
    document.getElementById("titre").innerText =
      "Emploi du temps du groupe " + groupe;

    // Récupération des données depuis le backend
    fetch(api+ groupe)
      .then(res => res.json())
      .then(data => {
        const tbody = document.querySelector("#emploi tbody");
        tbody.innerHTML = "";

        const periodes = {};

        // Organiser les séances par période et par jour
        data.forEach(seance => {
          if (!periodes[seance.periode]) {
            periodes[seance.periode] = {
              "Lundi": null,
              "Mardi": null,
              "Mercredi": null,
              "Jeudi": null,
              "Vendredi": null,
              "Samedi": null
            };
          }

          periodes[seance.periode][seance.jour] = `
            <table class="course-table">
              <tr><th>${seance.matiere}</th></tr>
              <tr><td>${seance.salle} | ${seance.type_cours}</td></tr>
              <tr><td>${seance.professeur}</td></tr>
            </table>
          `;
        });

        // Générer le tableau principal
        for (let periode in periodes) {
          const tr = document.createElement("tr");
          tr.innerHTML = `<td class="time-col">${periode}</td>`;
          ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"].forEach(jour => {
            tr.innerHTML += `<td>${periodes[periode][jour] || "#NN"}</td>`;
          });
          tbody.appendChild(tr);
        }
      })
      .catch(err => console.error(err));