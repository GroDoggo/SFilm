class Movie {
    constructor(name, day, mounth, broadcaster) {
        this.name = name;
        this.day = day;
        this.mounth = mounth;
        this.broadcaster = broadcaster;
        this.subscriber = new Array();
        this.idMessage = undefined
    } 
}

Movie.prototype.toString = function dogToString() {
    return `\nName : ${this.name}\nDay : ${this.day}\nMounth : ${this.mounth}\nBroadcaster : ${this.broadcaster}\nSubscriber : ${this.subscriber}\nidMessage : ${this.idMessage}\n`;
};

class Request {
    constructor(name, user){
        this.name = name;
        this.user = user;
        this.vote = new Array();
        this.vote.push(user)
        this.idMessage = undefined;
    }

    add(user){
        this.vote.push(user)
    }
}

Request.prototype.toString = function dogToString() {
    return `\nName : ${this.name}\nuser : ${this.user}\nvote : ${this.vote}\nidMessage : ${this.idMessage}\n`;
};

class Interaction {

    data = "";
    user = undefined;
    args = undefined;
    roles = new Array(String)
    rights = ""; 
    command = "";
    nick = "";

    constructor(interaction){
        try {
            this.data = interaction.data.name;
            this.user = interaction.member.user;
            this.roles = interaction.member.roles;
            this.args = interaction.data.options[0].options[0].options;
            this.rights = interaction.data.options[0].name;
            this.command = interaction.data.options[0].options[0].name;
            this.nick = interaction.member.nick;
        } catch (error) {
            console.error(error);
            this.data = undefined;
            this.user = undefined;
            this.args = undefined;
            this.rights = undefined;
            this.command = undefined;
            this.roles = undefined;
            this.nick = undefined;
        }
    }
}

const createMovieInteration = (options) => {
    var name = undefined;
    var day = undefined;
    var mounth = undefined;
    var broadcast = undefined;
    for (i = 0; i < options.length; i++){
        if (options[i].name === "name") name = options[i].value;
        else if (options[i].name === "day") day = options[i].value;
        else if (options[i].name === "mounth") mounth = options[i].value;
        else if (options[i].name === "broascast") broadcast = options[i].value;
    }
    return new Movie(name, day, mounth, broadcast);
};

exports.Request = Request;
exports.Movie = Movie;
exports.Interaction = Interaction
exports.createMovieInteration = createMovieInteration;