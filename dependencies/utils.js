const hasRole = (role, roleId) => {
    for (i = 0; i < role.length; i++) {
        if (role[i] == roleId) return true;
    }
    return false
};

const contains = (tab, value) => {
    for (i = 0; i < tab.length; i++) {
        if (tab[i] == value) return true;
    }
    return false
}

const supprimeMovie = (tab, value) => {
    for (i = 0; i < tab.length; i++) {
        if (tab[i].name == value) tab.splice(i, 1);
    }
    return tab
}

const trouverDate = (tab) => {
    var find = false
    var date = new Date;
    while (!find) {
        do date.setDate(date.getDate() + 1)
        while (date.getDay() != 2)
        find = true
        for (i = 0; i < tab.length; i++)
            if (tab[i].day == date.getDate() && tab[i].mounth == date.getMonth() + 1) find = false;

    }
    return date;
}

const trouverNextMovie = (tab) => {
    var number = 0
    var checkMovie = new Array()
    var find = true
    while (number < 5 && find) {
        find = false
        var minDay = 13*60;
        for (i = 0; i < tab.length; i++)
            var day = tab[i].day + tab[i].mounth*60
            if (day < minDay && contains(checkMovie, tab[i])) {
                minDay = day
                checkMovie.push(tab[i])
                find = false
            }
    }
    console.log(checkMovie)
    return checkMovie;
}



exports.hasRole = hasRole;
exports.contains = contains;
exports.supprimeMovie = supprimeMovie;
exports.trouverDate = trouverDate;
exports.trouverNextMovie = trouverNextMovie;