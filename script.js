const imageFolderPath = 'images/';
const imageFilenames = [
    'cars.jpg',
    'dragon_trainer.jpeg',
    'era_glaciale.jpg',
    'madagascar.jpg'
];
const images = imageFilenames.map(filename => imageFolderPath + filename);

document.addEventListener('DOMContentLoaded', async () => {
    const imageElement = document.getElementById('selectedImage');
    const messageElement = document.getElementById('message');
    const adminResetButton = document.getElementById('adminResetButton');

    async function fetchConfig() {
        try {
            const response = await fetch('config.json');
            return await response.json();
        } catch (error) {
            console.error('Error fetching config:', error);
        }
    }

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

    async function selectImage() {
        try {
            const config = await fetchConfig();
            const round = config.round;
            let cookieRound = getCookie('round');
            let selectedImage = getCookie('selectedImage');

            if (!cookieRound || cookieRound != round) {
                // Set round cookie and select a new random image
                setCookie('round', round, 7);
                if (!selectedImage) {
                    selectedImage = images[Math.floor(Math.random() * images.length)];
                    setCookie('selectedImage', selectedImage, 7); // Set cookie for 7 days
                }
                imageElement.src = selectedImage;
            } else {
                // Display the image based on the round
                imageElement.src = selectedImage;
            }
        } catch (error) {
            console.error('Error selecting image:', error);
        }
    }

    function checkAdmin() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('admin');
    }

    if (checkAdmin()) {
        imageElement.style.display = 'none';
        messageElement.style.display = 'none';
        adminResetButton.style.display = 'block';
        adminResetButton.addEventListener('click', async () => {
            try {
                // Trigger the GitHub Action to update config.json
                const response = await fetch('/.netlify/functions/update-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'incrementRound' })
                });

                if (response.ok) {
                    alert('New round initiated by admin.');
                    location.reload(); // Reload the page to apply changes
                } else {
                    console.error('Error updating round:', await response.text());
                }
            } catch (error) {
                console.error('Error initiating new round:', error);
            }
        });
    } else {
        selectImage();
    }
});
