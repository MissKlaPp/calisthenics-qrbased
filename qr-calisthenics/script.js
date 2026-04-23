document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. LOGICA CALCOLATORE MASSA GRASSA ---
    const sessoSelect = document.getElementById("sesso");
    const campoFianchi = document.getElementById("campo-fianchi");
    const btnCalcola = document.getElementById("btn-calcola");
    const risultatoDiv = document.getElementById("risultato");

    sessoSelect.addEventListener("change", () => {
        campoFianchi.style.display = sessoSelect.value === "donna" ? "block" : "none";
    });

    btnCalcola.addEventListener("click", () => {
        const sesso = sessoSelect.value;
        const altezza = parseFloat(document.getElementById("altezza").value);
        const collo = parseFloat(document.getElementById("collo").value);
        const vita = parseFloat(document.getElementById("vita").value);
        const fianchi = parseFloat(document.getElementById("fianchi").value);

        if (!altezza || !collo || !vita || (sesso === "donna" && !fianchi)) {
            mostraRisultato("Compila tutti i campi richiesti.", true);
            return;
        }

        let bf = 0;
        if (sesso === "uomo") {
            bf = 495 / (1.0324 - 0.19077 * Math.log10(vita - collo) + 0.15456 * Math.log10(altezza)) - 450;
        } else {
            bf = 495 / (1.29579 - 0.35004 * Math.log10(vita + fianchi - collo) + 0.22100 * Math.log10(altezza)) - 450;
        }

        bf = bf.toFixed(1);

        if (isNaN(bf) || bf < 2 || bf > 60) {
            mostraRisultato("Dati non validi. Controlla le misure.", true);
        } else {
            mostraRisultato(`Massa grassa stimata: <br><span style="font-size: 2rem; font-weight: 800; color: #18181b;">${bf}%</span>`, false);
        }
    });

    function mostraRisultato(testo, isErrore) {
        risultatoDiv.innerHTML = testo;
        risultatoDiv.style.color = isErrore ? "#dc2626" : "inherit";
        risultatoDiv.className = "risultato-visibile";
    }


// --- LOGICA REGISTRO ALLENAMENTO (Blocco Note & Screenshot) ---
const btnSalvaNota = document.getElementById("btn-salva-nota");
const listaAllenamenti = document.getElementById("lista-allenamenti");
const selectEs = document.getElementById("nota-esercizio");
const inputSerie = document.getElementById("nota-serie");
const inputReps = document.getElementById("nota-reps");
const inputDettagli = document.getElementById("nota-dettagli"); // Nuovo input note
const btnScreenshot = document.getElementById("btn-screenshot"); // Nuovo bottone
const CHIAVE_MEMORIA = "qrbased_registro_tecnico";

function caricaDiario() {
    const storico = JSON.parse(localStorage.getItem(CHIAVE_MEMORIA)) || [];
    listaAllenamenti.innerHTML = "";

    if (storico.length === 0) {
        listaAllenamenti.innerHTML = "<li style='padding:10px;'>Nessun dato registrato.</li>";
        return;
    }

    storico.slice().reverse().forEach((nota, index) => {
        const realIndex = storico.length - 1 - index;
        const li = document.createElement("li");
        li.className = "item-allenamento";
        
        // Prepariamo l'HTML per la nota extra solo se l'utente l'ha scritta
        const notaHTML = nota.dettagli ? `<span class="nota-testo">"${nota.dettagli}"</span>` : "";

        li.innerHTML = `
            <div class="nota-info">
                <strong>${nota.esercizio}: ${nota.serie} x ${nota.reps}</strong>
                ${notaHTML}
                <small>${nota.data}</small>
            </div>
            <button class="btn-elimina" onclick="rimuoviNota(${realIndex})">Elimina</button>
        `;
        listaAllenamenti.appendChild(li);
    });
}

btnSalvaNota.addEventListener("click", () => {
    const esercizio = selectEs.value;
    const serie = inputSerie.value;
    const reps = inputReps.value;
    const dettagli = inputDettagli.value.trim(); // Recuperiamo il testo della nota
    const data = new Date().toLocaleDateString('it-IT');

    if (!serie || !reps) {
        alert("Inserisci almeno serie e ripetizioni.");
        return;
    }

    // Salviamo anche i dettagli nell'oggetto
    const nuovaNota = { esercizio, serie, reps, dettagli, data };
    let storico = JSON.parse(localStorage.getItem(CHIAVE_MEMORIA)) || [];
    storico.push(nuovaNota);
    localStorage.setItem(CHIAVE_MEMORIA, JSON.stringify(storico));

    // Pulizia campi
    inputSerie.value = "";
    inputReps.value = "";
    inputDettagli.value = "";
    caricaDiario();
});

window.rimuoviNota = function(index) {
    let storico = JSON.parse(localStorage.getItem(CHIAVE_MEMORIA)) || [];
    storico.splice(index, 1);
    localStorage.setItem(CHIAVE_MEMORIA, JSON.stringify(storico));
    caricaDiario();
};

// Funzione Screenshot
btnScreenshot.addEventListener("click", () => {
    const area = document.getElementById("area-da-fotografare");
    const lista = document.getElementById("lista-allenamenti");
    
    // Controlla se ci sono allenamenti prima di fotografare
    if (lista.innerText.includes("Nessun dato registrato")) {
        alert("Aggiungi almeno un esercizio prima di salvare la scheda!");
        return;
    }

    // Nascondiamo i bottoni "Elimina" temporaneamente per una foto più pulita
    area.classList.add("hide-for-screenshot");

    // Scattiamo la foto
    html2canvas(area, {
        backgroundColor: "#f4f4f5", // Usa lo stesso grigio chiaro del tuo sfondo
        scale: 2 // Aumenta la risoluzione per renderla nitida sui social
    }).then(canvas => {
        // Creiamo l'immagine e forziamo il download
        const link = document.createElement("a");
        link.download = "Il-Mio-Allenamento-QRbased.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        // Rimettiamo a posto i bottoni "Elimina"
        area.classList.remove("hide-for-screenshot");
    });
});

caricaDiario();
});