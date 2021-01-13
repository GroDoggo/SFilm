class Movie {
    constructor(name, day, mounth, broadcaster) {
        this.name = name;
        this.day = day;
        this.mounth = mounth;
        this.broadcaster = broadcaster;
        this.subscriber = new Array();
        this.idMessage = undefined
    }

    set area(message) {
        this.idMessage = message;
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
exports.createMovieInteration = createMovieInteration;