const Discord = require('discord.js');
const fs = require("fs");
const Film = require('./movie');
const utils = require('../utils.js');
const movieArt = require('movie-art')
const Calendar = require('node-schedule')
const client = new Discord.Client();
const channel = "798582411126112357"
const timeout = { timeout: 30000 };

var listMovie = new Array();
var listRequest = new Array();

var j = Calendar.scheduleJob({ hour: 21, minute: 0 }, function () {
    checkMovie()
});

client.on('ready', () => {
    console.log(`[SFilm] : Logged in as ${client.user.tag}!`);
    var data = JSON.parse(fs.readFileSync("./dependencies/sfilm/movieData.json"));
    for (movie in data["Movie"]) {
        var movieData = new Film.Movie(data["Movie"][movie]["name"], data["Movie"][movie]["day"], data["Movie"][movie]['mounth'])
        movieData.subscriber = data["Movie"][movie]["subscriber"]
        movieData.idMessage = movie
        listMovie.push(movieData)
    }
});

client.on('message', msg => {
    if (msg.content === "!update") {
        checkMovie()
    }

    if (msg.content === "!help") {
        const message = {
            "title": "Aide SFilm",
            "description": "Comment utiliser le bot?",
            "color": null,
            "fields": [
                {
                    "name": "Comment proposer un film?",
                    "value": "Dans le chat de n'importe quel channel, ecrit simplement la commande /sfilm\nSelectionne ensuite parmis les propositions de Discord /sfilm movie add\nEcrit pour finir le nom de ton film (en anglais) pour créer ta proposition"
                },
                {
                    "name": "Comment upvote une proposition de film?",
                    "value": "Quand une proposition est crée, un message apparait dans le salon #sfilm-calendrier\nSi tu souhaite toi aussi voir ce film tu peux cliquer sur le petit emoji 👍\nAu bout de 5 upvote le film arrive en salle"
                },
                {
                    "name": "Comment supprimer une proposition de film?",
                    "value": "Tu t'es trompé de film? Clique simplement sur l'emoji 🚫\nCette action est accessible uniquement si tu es l'auteur de la proposition"
                },
                {
                    "name": "Comment être notifie de la diffusion du film?",
                    "value": "Lorsqu'un film arrive en salle, un nouveau post est crée dans le channel #sfilm-calendrier\nIl est alors possible d’être notifie le soir de la diffusion en cliquant sur l'emoji 🔔"
                },
                {
                    "name": "Comment changer la date d'un film?",
                    "value": "La seule solution (pour le moment) est de contacter un modérateur"
                }
            ]
        }
        client.users.fetch(msg.author)
            .then(user => {
                user.send({ embed: message })
            })
    }
    if (msg.channel.id === channel && !msg.author.bot) msg.delete();
})

client.ws.on("INTERACTION_CREATE", async command => {
    const interaction = new Film.Interaction(command)
    if (interaction.data === 'sfilm') {
        const movie = Film.createMovieInteration(interaction.args);
        if (interaction.rights === "admin" && utils.hasRole(interaction.roles, '798242972457893918')) {
            if (interaction.command === "add") addMovieAdmin(movie);

            else if (interaction.command === "remove") removeMovieAdmin(movie)

            else if (interaction.command === "broadcast") addBroadcastAdmin(interaction)

            else if (interaction.command === "edit") editAdmin(interaction)

        } else if (interaction.rights === "movie") {
            if (interaction.command === "add") addRequest(interaction)

            else if (interaction.command === "subscribe") addSubscribe(command.data.options[0].options[0].options[0].value, interaction.user)

            else if (interaction.command === "broadcast") addBroadcast(command.data.options[0].options[0].options[0].value, interaction.user)

            else if (interaction.command === "upvote") addUpvote(command.data.options[0].options[0].options[0].value, interaction.user)

        }
    }
});

client.on('messageReactionAdd', (messageReaction, user) => {

    var message = messageReaction.message;
    var reaction = messageReaction.emoji;

    if (reaction.name === '👍' && !user.bot) {
        var find = undefined;
        for (i = 0; i < listRequest.length; i++) {
            if (listRequest[i].idMessage === message.id) find = i;
        }
        if (find != undefined) {
            if (!addUpvote(listRequest[find].name, user)) messageReaction.users.remove(user)
        }
    }

    if (reaction.name === '🚫' && !user.bot) {
        var find = undefined;
        for (i = 0; i < listRequest.length; i++) {
            if (listRequest[i].idMessage === message.id && user.id === listRequest[i].user) find = i;
        }
        if (find != undefined) {
            client.channels.fetch(channel)
                .then(channel => channel.messages.fetch(message.id)
                    .then(msg => msg.delete())
                )
        }
    }

    if (reaction.name === '🔔' && !user.bot) {
        var find = undefined;
        for (i = 0; i < listMovie.length; i++) {
            if (listMovie[i].idMessage === message.id) find = i;
        }
        if (find != undefined) {
            addSubscribe(listMovie[find].name, user)
        }
    }

})

function addMovieAdmin(movie) {

    movieArt(movie.name)
        .then(response => {
            if (typeof response.message === "string") {
                client.channels.fetch(channel)
                    .then(channel => channel.send("Je ne trouve pas ce film, verifie que tu as bien écrit le nom en anglais")
                        .then(message => message.delete(timeout))
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
                            message.react('🔔')
                            listMovie.push(movie);
                            console.log("[SFilm] : Un nouveau film a été ajouté : " + movie);
                            reloadData()
                        })
                        .catch(console.error))
                    .catch(console.error);

            }
        })

}

function addRequest(interaction) {
    const movie = new Film.Request(interaction.args[0].value, interaction.user.id);
    movieArt(movie.name)
        .then(response => {
            if (typeof response.message === "string") {
                client.channels.fetch(channel)
                    .then(channel => channel.send("Je ne trouve pas ce film, verifie que tu as bien écrit le nom en anglais")
                        .then(message => message.delete(timeout))
                        .catch(console.error))
                    .catch(console.error);
            }
            else {
                client.users.fetch(interaction.user.id)
                    .then(user => {
                        var name = interaction.nick != null ? interaction.nick : user.username
                        const msg = {
                            "title": "Nouvelle proposition de film 🎬",
                            "description": name + " vous propose de découvrir " + movie.name + " avec lui 👥\nRéagit avec E si tu souhaite également le déguster 🍰",
                            "color": 10619816,
                            "footer": {
                                "text": "Il faut au minimum 5 personnes"
                            },
                            "image": {
                                "url": response
                            },
                            "thumbnail": {
                                "url": user.avatarURL()
                            }
                        }
                        client.channels.fetch(channel)
                            .then(channel => channel.send({ embed: msg })
                                .then(message => {
                                    movie.idMessage = message.id
                                    message.react('👍')
                                    message.react('🚫')
                                    listRequest.push(movie);
                                    console.log("[SFilm] : Un nouveau film a été proposé par " + interaction.user.username + " : " + movie);
                                })
                                .catch(console.error))
                            .catch(console.error)
                    })
            }
        })
}

function addUpvote(movieName, user) {
    var find = false;
    for (i = 0; i < listRequest.length; i++) {
        var movie = listRequest[i]
        if (listRequest[i].name === movieName && !utils.contains(listRequest[i].vote, user.id)) {
            movie.add(user.id)
            if (movie.vote.length >= 5) {
                const date = utils.trouverDate(listMovie);
                const newMovie = new Film.Movie(movie.name, date.getDate(), date.getMonth() + 1, undefined)
                addMovieAdmin(newMovie)
                for (j = 0; j < listRequest.length; j++) {
                    if (listRequest[j].name === movieName) listRequest.splice(j ,1)
                }
            }
            find = true
        }
    }
    if (find) {
        client.users.fetch(user.id)
            .then(user => {
                const msg = {
                    "title": "Merci pour ton upvote",
                    "description": "Tu as bien partagé ton avis sur ce film. Avec d'autre personne il pourrait bientôt se retrouver en salle",
                    "color": 388101
                }
                user.send({ embed: msg })
                console.log("[SFilm] : " + user.username + " a upvote " + movieName)
            })
    } else {
        client.users.fetch(user.id)
            .then(user => {
                const msg = {
                    "title": "Une erreur est survenue",
                    "description": "Ton upvote n'est pas passé. Vérifie que tu n'a pas déja upvote ce Film\nSi tu es passé par une commande et non par les émojis vérifie que le film existe bien",
                    "color": 13959168
                }
                user.send({ embed: msg })
            })
    }
    return find
}

function addSubscribe(movieName, user) {
    var find = false;
    for (i = 0; i < listMovie.length && !find; i++) {
        if (listMovie[i].name === movieName && !utils.contains(listMovie[i].subscriber, user.id)) {
            listMovie[i].subscriber.push(user.id)
            find = true
        }
    }
    if (find) {
        client.users.fetch(user.id)
            .then(user => {
                const msg = {
                    "title": "Voici ton ticket pour " + movieName,
                    "description": "Tu recevra une notification le soir de la diffusion",
                    "color": 14092265
                }
                user.send({ embed: msg })
                console.log("[SFilm] : " + user.username + " est abonné a " + movieName)
            })
    } else {
        client.users.fetch(user.id)
            .then(user => {
                const msg = {
                    "title": "Une erreur est survenue",
                    "description": "Je n'arrive pas a te t'envoyer de ticket. Verifie que tu n'en possède pas déja un\nSi tu es passé par une commande et non par les émojis vérifie que le film existe bien",
                    "color": 13959168
                }
                user.send({ embed: msg })
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
                user.send("Cette commande ne fait rien pour le moment")
            })
    } else {
        client.users.fetch(user.id)
            .then(user => {
                user.send("Cette commande ne fait rien pour le moment")
            })
    }
}

function removeMovieAdmin(movie) {
    listMovie = utils.supprimeMovie(listMovie, movie.name);
    console.log("[SFilm] : " + movie.name + " a été supprimé") 
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
}

function editAdmin(interaction) {
    const args = interaction.data.options[0].options[0].options;
    const movie = Film.createMovieInteration(args)
    removeMovieAdmin(movie.name)
    addMovieAdmin(movie)
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

    movieArt(movie.name)
        .then(response => {
            const msg = {
                "title": "La diffusion de " + movie.name + " va bientot commencer",
                "description": "Vous pouvez rejoindre le salon vocal Soirée Film\nBon film 🤗",
                "color": 15801097,
                "thumbnail": {
                    "url": reponse
                }
            }
            client.channels.fetch(channel)
                .then(channel => channel.send({ embed: msg }))
                .catch(console.error);
            for (i = 0; i < movie.subscriber.length; i++) {
                client.users.fetch(movie.subscriber[i])
                    .then(user => {
                        user.send({ embed: msg })
                    })
            }
        })
}


const login = (token) => {
    client.login(token);
};

function reloadData() {

    console.log("[SFilm] : Reloding the Data...")

    var movieData = {
        "Movie": {}
    }

    for (i = 0; i < listMovie.length; i++) {
        if (listMovie[i].idMessage != undefined)
            movieData["Movie"][listMovie[i].idMessage] = {
                "name": listMovie[i].name,
                "day": listMovie[i].day,
                "mounth": listMovie[i].mounth,
                "broadcaster": listMovie[i].broadcaster,
                "subscriber": listMovie[i].subscriber,
            }
        else console.log("[SFilm] Ce film contient une erreur, il ne sera pas sauvegardé" + listMovie[i])
    }

    var json = JSON.stringify(movieData); //Prepare the DATA for saving

    fs.writeFile("./dependencies/sfilm/movieData.json", json, 'utf8', function callback(err) {
        if (err) {
            console.log("[SFilm] : Erreur lors de la sauvegarde\n" + err);
        } else {
            console.log("[Sfilm] : Data written successfuly");
        }
    });
}


exports.login = login;