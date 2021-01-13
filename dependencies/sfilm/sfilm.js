const Discord = require('discord.js');
const Film = require('./movie');
const utils = require('../utils.js');
const movieArt = require('movie-art')
const Calendar = require('node-schedule')
const client = new Discord.Client();
const channel = "798582411126112357"

var listMovie = new Array();
var listRequest = new Array();

var j = Calendar.scheduleJob({ hour: 21, minute: 0 }, function () {
    checkMovie()
});

client.on('ready', () => {
    console.log(`[SFilm] : Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === "!update") {
        checkMovie()
    }
    if (msg.channel.id === channel && !msg.author.bot) msg.delete();
})

client.ws.on("INTERACTION_CREATE", async interaction => {
    const data = interaction.data;
    if (data.name === 'sfilm') {
        const args = interaction.data.options[0].options[0].options;
        const movie = Film.createMovieInteration(args);
        if (data.options[0].name === "admin" && utils.hasRole(interaction.member, '798242972457893918')) {
            if (data.options[0].options[0].name === "add") addMovieAdmin(movie);

            else if (data.options[0].options[0].name === "remove") removeMovieAdmin(movie)

            else if (data.options[0].options[0].name === "broadcast") addBroadcastAdmin(interaction)

            else if (data.options[0].options[0].name === "edit") editAdmin(interaction)

        } else if (data.options[0].name === "movie") {
            if (data.options[0].options[0].name === "add") addRequest(interaction)

            else if (data.options[0].options[0].name === "subscribe") addSubscribe(data.options[0].options[0].options[0].value, interaction.member.user)

            else if (data.options[0].options[0].name === "broadcast") addBroadcast(data.options[0].options[0].options[0].value, interaction.member.user)

            else if (data.options[0].options[0].name === "upvote") addUpvote(data.options[0].options[0].options[0].value, interaction.member.user)

        }
    }
});

function addMovieAdmin(movie) {

    movieArt(movie.name)
        .then(response => {
            console.log(response);
            if (typeof response.message === "string") {
                client.channels.fetch(channel)
                    .then(channel => channel.send("Je ne trouve pas ce film, verifie que tu as bien écrit le nom en anglais")
                        .then(message => message.delete(30000))
                        .catch(console.error))
                    .catch(console.error);
            }
            else {
                const msg = {
                    "title": "🎬 " + movie.name + " arrive dans le calendrier 🎬",
                    "description": "La programmation est prévu le " + movie.day + "/" + movie.mounth + " vers 21h 📅\nSortez le popcorn c'est ouvert a tous 🍿",
                    "color": 3859984,
                    "image": {
                        "url": response
                    },
                    "thumbnail": {
                        "url": "https://i.imgur.com/uLHiaH6.png"
                    }
                }
                client.channels.fetch(channel)
                    .then(channel => channel.send({ embed: msg })
                        .then(message => {
                            movie.idMessage = message.id
                            listMovie.push(movie);
                            console.log("[SFilm] : Un nouveau film a été ajouté en : " + movie);
                        })
                        .catch(console.error))
                    .catch(console.error);

            }
        })
}

function addRequest(interaction) {
    const args = interaction.data.options[0].options[0].options;
    const movie = new Film.Request(args[0].value, interaction.member.user.id);
    movieArt(movie.name)
        .then(response => {
            if (typeof response.message === "string") {
                client.channels.fetch(channel)
                    .then(channel => channel.send("Je ne trouve pas ce film, verifie que tu as bien écrit le nom en anglais")) //TODO suppr
                    .catch(console.error);
            }
            else {
                client.users.fetch(interaction.member.user.id)
                    .then(user => {
                        const msg = {
                            "title": "Nouvelle proposition de film 🎬",
                            "description": interaction.member.nick + " vous propose de découvrir " + movie.name + " avec lui 👥\nRéagit avec E si tu souhaite également le déguster 🍰",
                            "color": 10619816,
                            "footer": {
                                "text": "Il faut au minimum 5 personnes"
                            },
                            "timestamp": Date.now,
                            "image": {
                                "url": response
                            },
                            "thumbnail": {
                                "url": user.avatarURL()
                            }
                        }
                        listRequest.push(movie);
                        console.log("[SFilm] : Un nouveau film a été proposé par " + user.username + " : " + movie);
                        client.channels.fetch(channel)
                            .then(channel => channel.send({ embed: msg })) //TODO emoji + enregistrer messageid
                            .catch(console.error);
                    })
            }
        })
}

function addUpvote(movieName, user) {
    var find = false;
    console.log(listRequest)
    for (i = 0; i < listRequest.length; i++) {
        if (listRequest[i].name === movieName && !utils.contains(listRequest[i].vote, user.id)) {
            listRequest[i].vote.push(user.id)
            if (listRequest[i].vote.length >= 5) {
                //TODO ajouter film
            }
            find = true
        }
    }
    if (find) {
        client.users.fetch(user.id)
            .then(user => {
                user.send("Tu as bien donnée ton upvote pour ce film")
            })
    } else {
        client.users.fetch(user.id)
            .then(user => {
                user.send("Je ne trouve pas le film en question\nVérifie qu'il est bien demandé et que tu n'es pas déja donner ton upvote au film")
            })
    }
}

function addSubscribe(movieName, user) {
    var find = false;
    for (i = 0; i < listMovie.length; i++) {
        if (listMovie[i].name === movieName && !utils.contains(listMovie[i].subscriber, user.id)) {
            listMovie[i].subscriber.push(user.id)
            find = true
        }
    }
    if (find) {
        client.users.fetch(user.id)
            .then(user => {
                user.send("Tu es bien enregistré le film voici ton ticket")
            })
    } else {
        client.users.fetch(user.id)
            .then(user => {
                user.send("Je ne trouve pas le film en question\nVérifie qu'il est bien dans le calendrier et que tu n'es pas déja abonné au film")
            })
    }
}

function addBroadcast(movieName, user) {
    var find = false;
    for (i = 0; i < listMovie.length; i++) {
        if (listMovie[i].name === movieName && listMovie[i].broadcaster === undefined) {
            listMovie[i].broadcaster = user.id
            find = true
        }
    }
    if (find) {
        client.users.fetch(user.id)
            .then(user => {
                user.send("Tu es bien désigné comme étant le projectioniste, félicitation")
            })
    } else {
        client.users.fetch(user.id)
            .then(user => {
                user.send("Il semblerait qu'une erreur ce soir produite\nVerifie que le film est bien dans le calendrier et que personne ne s'est déja proposé pour le diffuser")
            })
    }
    //TODO edit embed
}

function removeMovieAdmin(movie) {
    listMovie = utils.supprimeMovie(listMovie, movie.name); //TODO Edit embed
}

function addBroadcastAdmin(interaction) {
    const args = interaction.data.options[0].options[0].options;
    var name = undefined;
    var broadcaster = undefined;
    for (i = 0; i < args.length; i++) {
        if (args[i].name === "name") name = args[i].value
        else if (args[i].name === "broadcaster") broadcaster = args[i].value;
    }
    if (name === undefined || broadcaster === undefined) return;
    for (i = 0; i < listMovie.length; i++) {
        if (listMovie[i].name === name) {
            listMovie[i].broadcaster = broadcaster
        }
    }
    //TODO edit embed
}

function editAdmin(interaction) {
    const args = interaction.data.options[0].options[0].options;
    const movie = Film.createMovieInteration(args)
    for (i = 0; i < listMovie.length; i++) {
        if (listMovie[i].name === movie.name) {
            listMovie[i].day = movie.day
            listMovie[i].mounth = movie.mounth
        }
    }
    //TODO edit embed
}

function checkMovie() {
    const day = new Date().getDate()
    const mounth = new Date().getMonth() + 1;
    for (i = 0; i < listMovie.length; i++) {
        if (listMovie[i].day === day && listMovie[i].mounth === mounth)
            notification(movie)
    }
}

function notification(movie) {
    for (i = 0; i < movie.subscriber.length; i++) {
        client.users.fetch(movie.subscriber[i])
            .then(user => {
                user.send("Le film va commencer")
            })
    }
    client.channels.fetch(interaction.channel_id) //TODO
        .then(channel => channel.send("Le film va commencer"))
        .catch(console.error);
}


const login = (token) => {
    client.login(token);
};


exports.login = login;