// Importa i moduli Firebase necessari
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, runTransaction } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

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

// Array di nomi di file immagine
const imageFilenames = [
    'cars.jpg',
    'dragon_trainer.jpeg',
    'era_glaciale.jpg',
    'madagascar.jpg'
];

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

    function resetCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        incrementRound();
    }

    function incrementRound() {
        const roundRef = ref(database, 'round');
        runTransaction(roundRef, (currentRound) => {
            return (currentRound || 0) + 1;
        }).then(() => {
            alert('New round initiated by admin.');
        }).catch((error) => {
            console.error("Error incrementing round: ", error);
        });
    }

    function selectImage() {
        let selectedImage = getCookie('selectedImage');
        if (!selectedImage) {
            selectedImage = images[Math.floor(Math.random() * images.length)];
            setCookie('selectedImage', selectedImage, 7); // Imposta il cookie per 7 giorni
        }
        imageElement.src = selectedImage;
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
        resetCookie('selectedImage');
    });
});
