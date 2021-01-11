const Discord = require('discord.js');
const client = new Discord.Client();


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content.startsWith === 'ping') {
        msg.reply('Pong!');
    }
});

client.ws.on("INTERACTION_CREATE", async interaction => {
    const data = interaction.data;
    if (data.name === 'sfilm'){
        const option = data.options;
        console.log(option)
    }
});


const login = (token) => {
    client.login(token);
};


exports.login = login;