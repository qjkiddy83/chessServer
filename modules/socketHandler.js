var partnerList = [];
var clientList = {

}

function getChar(id) {
    var retPartner = null;
    var filterList = partnerList.filter(partner => {
        if (!partner[0] || !partner[1] || partner[0] == id || partner[1] == id) {
            return true;
        }
    })
    if (filterList.length > 0) {
        for (var i = 0; i < filterList.length; i++) {
            var partner = filterList[i];
            if (!partner[0]&&partner[1]!=id) {
                partner[0] = id;
            } else if (!partner[1]&&partner[0]!=id) {
                partner[1] = id;
            }
            retPartner = partner;
            break;
        }
    } else {
        var partner = [id, 0];
        partnerList.push(partner);
        retPartner = partner;
    }
    return retPartner;
}

function getPartner(id) {
    var other = null;
    partnerList.forEach(partner => {
        if (partner[0] == id && partner[1]) {
            other = partner[1]
        } else if (partner[1] == id && partner[0]) {
            other = partner[0];
        }
    })
    return other;
}

function removeChar(id) {
    var filterList = partnerList.forEach(partner => {
        if (partner[0] == id) {
            partner[0] = 0;
        } else if (partner[1] == id) {
            partner[1] == id
        }
    })
    delete clientList[id];
}


module.exports = function(server) {
    var io = require('socket.io')(server);
    io.on('connect', function() {
        // console.log('connect')
    });
    io.on('connection', function(client) {
        var _userid;
        client.on('connect_user', function(userid) {
            if (!userid) {
                userid = `${client.id}`;
            }
            _userid = userid;

            clientList[userid] = client;

            var group = getChar(userid);
            if (group[0] && group[1]) {//配对成功
            	console.log('start',group)
                clientList[getPartner(group[0])].emit('start', {
                    control: true
                });
                clientList[getPartner(group[1])].emit('start', {
                    control: false
                });
            }

            console.log("partnerList", partnerList)
            console.log("clientList", Object.keys(clientList));

            client.emit('connected', {
                userid: userid
            });
        });

        client.on('chess', function(data) {
            // console.log(data.userId, getPartner(data.userId))
            clientList[getPartner(data.userId)].emit('chessed', data);
        });
        client.on('change', function(data) {
            clientList[getPartner(data)].emit('changeControl', {
                control: true
            });
            clientList[data].emit('changeControl', {
                control: false
            });
        });

        client.on('disconnect', function() {
            console.log('disconnect',_userid)
            removeChar(_userid)
        });
    });
}