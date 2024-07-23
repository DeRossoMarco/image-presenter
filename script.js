// Array of image URLs
const images = [
    'images/cars.jpg',
    'images/dragon_trainer.jpg',
    'images/era_glaciale.jpg',
    'madagascar.jpg'
];

document.addEventListener('DOMContentLoaded', () => {
    const imageElement = document.getElementById('selectedImage');
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

    adminResetButton.addEventListener('click', () => {
        resetCookie('selectedImage');
        selectImage();
        alert('New round initiated by admin.');
    });

    if (checkAdmin()) {
        adminResetButton.style.display = 'block';
    }

    selectImage();
});
