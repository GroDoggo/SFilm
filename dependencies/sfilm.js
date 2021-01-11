const Discord = require('discord.js');
const client = new Discord.Client();


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    addingCommand();
});

client.on('message', msg => {
    if (msg.content.startsWith === 'ping') {
        msg.reply('Pong!');
    }
});

const login = (token) => {
    client.login(token);
};

async function addingCommand() {
    const apiEndpoint = 'https://discord.com/api/v8/applications/' + client.user.id + '/commands'
    const fetch = require('node-fetch')
    const commandData = {
        "name": "sfilm",
        "description": "Commande principale de sfilm",
        "options": [
            {
                "name": "add",
                "description": "Faire une proposition de film",
                "type": 1,
                "options": [
                    {
                        "name": "name",
                        "description": "Nom du film",
                        "type": 3,
                        "required": true
                    }
                ]
            }
        ]
    }

    const response = await fetch(apiEndpoint, {
        method: 'post',
        body: JSON.stringify(commandData),
        headers: {
            'Authorization': 'Bot ' + client.token,
            'Content-Type': 'application/json'
        }
    })
}


exports.login = login;