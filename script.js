
const database = firebase.database();

// Define the folder path
const imageFolderPath = 'images/';

// Array of image filenames
const imageFilenames = [
    'cars.jpg',
    'dragon_trainer.jpeg',
    'era_glaciale.jpg',
    'madagascar.jpg'
];

// Generate the full image URLs
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

    function selectImage() {
        let selectedImage = getCookie('selectedImage');
        if (!selectedImage) {
            selectedImage = images[Math.floor(Math.random() * images.length)];
            setCookie('selectedImage', selectedImage, 7); // Set cookie for 7 days
        }
        imageElement.src = selectedImage;
    }

    function checkAdmin() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('admin');
    }

    function incrementRound() {
        const roundRef = database.ref('round');
        roundRef.transaction((currentRound) => {
            return (currentRound || 0) + 1;
        }).then(() => {
            alert('New round initiated by admin.');
        }).catch((error) => {
            console.error("Error incrementing round: ", error);
        });
    }

    if (checkAdmin()) {
        // Hide the image and message for admin
        imageElement.style.display = 'none';
        messageElement.style.display = 'none';
        adminResetButton.style.display = 'block';
    } else {
        selectImage();
    }

    adminResetButton.addEventListener('click', () => {
        resetCookie('selectedImage');
        alert('New round initiated by admin.');
    });
});
