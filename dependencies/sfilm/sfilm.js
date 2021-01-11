const Discord = require('discord.js');
const Film = require('./movie');
const client = new Discord.Client();


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === 'ping') {
        console.log(new Film.Movie("jaime", 3 ,11));
    }
});

client.ws.on("INTERACTION_CREATE", async interaction => {
    const data = interaction.data;
    console.log(data);
    if (data.name === 'sfilm'){
    }
});


const login = (token) => {
    client.login(token);
};


exports.login = login;