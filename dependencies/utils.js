const hasRole = (user, roleId) => {
    for(i=0; i<user.roles.length; i++){
        if (user.roles[i] == roleId) return true;
    }
    return false
};

const contains = (tab, value) => {
    for(i=0; i<tab.length; i++){
        if (tab[i] == value) return true;
    }
    return false
}

const supprimeMovie = (tab, value) => {
    for(i=0; i<tab.length; i++){
        if (tab[i].name == value) tab.splice(i, 1);
    }
    return tab
}



exports.hasRole = hasRole;
exports.contains = contains;
exports.supprimeMovie = supprimeMovie;