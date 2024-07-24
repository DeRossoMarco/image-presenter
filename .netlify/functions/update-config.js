const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 410,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }

    try {
        const body = JSON.parse(event.body);
        if (body.action !== 'incrementRound') {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid Action' }),
            };
        }

        // Path to the config.json file
        const configPath = path.join(__dirname, '../../config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        // Increment the round number
        config.round = (config.round || 0) + 1;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Round incremented successfully' }),
        };
    } catch (error) {
        console.error('Error updating config:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};
