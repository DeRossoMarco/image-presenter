// Importa i moduli Firebase necessari
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, runTransaction, get, set } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

// Configurazione di Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDlKYfKl6b2tCXjJYP3raQIEW0lMatcDHk",
    authDomain: "giocovacanzina.firebaseapp.com",
    databaseURL: "https://giocovacanzina-default-rtdb.firebaseio.com",
    projectId: "giocovacanzina",
    storageBucket: "giocovacanzina.appspot.com",
    messagingSenderId: "807834218186",
    appId: "1:807834218186:web:d3bc04429069cbf4a34e33",
    measurementId: "G-X9R10EH2K6"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Ottieni una referenza al servizio database
const database = getDatabase(app);

// Definisci il percorso della cartella immagini
const imageFolderPath = 'images/';

// Array di nomi di file immagine con estensioni
const imageFilenames = [
    'bugs_bunny.jpg','taddeo.jpg','taz.jpg','michael_jordan.jpg',
    'groot.jpg','thanos.jpg','star_lord.jpg','rocket.jpg',
    'melmann.jpg','gloria.jpg','marty.jpg','alex.jpg',
    'tomika.jpg','summer.jpg','freddy.jpg','school_of_rock.jpg'
];

// Rimuove l'estensione dal nome del file
function removeExtension(filename) {
    return filename.split('.').slice(0, -1).join('.');
}

// Array di nomi di file immagine senza estensioni
const imageFilenamesWithoutExt = imageFilenames.map(removeExtension);

// Genera gli URL completi delle immagini
const images = imageFilenames.map(filename => imageFolderPath + filename);

document.addEventListener('DOMContentLoaded', () => {
    const imageElement = document.getElementById('selectedImage');
    const messageElement = document.getElementById('message');
    const adminResetButton = document.getElementById('adminResetButton');

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${d.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/`;
    }

    function resetImageSelections() {
        const imageSelectionsRef = ref(database, 'imageSelections');
        set(imageSelectionsRef, imageFilenamesWithoutExt.reduce((acc, filename) => {
            acc[filename] = 0;
            return acc;
        }, {})).catch((error) => {
            console.error("Error resetting image selections: ", error);
        });
    }

    function incrementRound() {
        const roundRef = ref(database, 'round');
        runTransaction(roundRef, (currentRound) => {
            return (currentRound || 0) + 1;
        }).then(() => {
            resetImageSelections(); // Resetta i contatori dopo aver incrementato il round
            alert('New round initiated by admin.');
        }).catch((error) => {
            console.error("Error incrementing round: ", error);
        });
    }

    function selectImage() {
        const imageSelectionsRef = ref(database, 'imageSelections');
        const roundRef = ref(database, 'round');

        Promise.all([get(imageSelectionsRef), get(roundRef)])
            .then(([imageSelectionsSnapshot, roundSnapshot]) => {
                if (imageSelectionsSnapshot.exists() && roundSnapshot.exists()) {
                    const imageSelections = imageSelectionsSnapshot.val();
                    const roundFromDb = roundSnapshot.val();
                    const currentRound = getCookie('currentRound');

                    // Se il round è cambiato, seleziona una nuova immagine
                    if (currentRound != roundFromDb) {
                        console.log(currentRound, roundFromDb);
                        // Trova l'immagine con il numero di selezioni minore
                        let minSelections = Infinity;
                        let selectedImage = null;

                        for (const [filename, count] of Object.entries(imageSelections)) {
                            if (count < minSelections) {
                                minSelections = count;
                                selectedImage = filename;
                            }
                        }

                        // Se non ci sono immagini, scegli a caso
                        if (!selectedImage) {
                            selectedImage = imageFilenamesWithoutExt[Math.floor(Math.random() * imageFilenamesWithoutExt.length)];
                        }

                        // Aggiorna il conteggio delle selezioni per l'immagine selezionata
                        set(ref(database, `imageSelections/${selectedImage}`), minSelections + 1)
                            .then(() => {
                                setCookie('selectedImage', selectedImage, 7); // Imposta il cookie per 7 giorni
                                setCookie('currentRound', roundFromDb, 7); // Imposta il cookie per 7 giorni
                                imageElement.src = `${imageFolderPath}${selectedImage}.jpg`; // Ripristina l'estensione per l'URL
                            }).catch((error) => {
                                console.error("Error updating image selection count: ", error);
                            });
                    } else {
                        // Carica l'immagine esistente dal cookie se il round non è cambiato
                        const existingImage = getCookie('selectedImage');
                        if (existingImage) {
                            imageElement.src = `${imageFolderPath}${existingImage}.jpg`; // Ripristina l'estensione per l'URL
                        }
                    }
                } else {
                    console.log("No image selection data or round data available");
                }
            }).catch((error) => {
                console.error("Error getting data: ", error);
            });
    }

    function checkAdmin() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('admin');
    }

    if (checkAdmin()) {
        // Nascondi l'immagine e il messaggio per l'admin
        imageElement.style.display = 'none';
        messageElement.style.display = 'none';
        adminResetButton.style.display = 'block';
    } else {
        selectImage();
    }

    adminResetButton.addEventListener('click', () => {
        incrementRound();
    });
});
