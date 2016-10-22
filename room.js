var ROOM_STATE_HEALTHY = 'healthy';
var ROOM_STATE_UNHEALTHY = 'unhealthy';
var ROOM_STATE_UNDER_ATTACK = 'under-attack';

function Room(room) {
    this.room = room;
    this.creeps = [];
    this.state = ROOM_STATE_HEALTHY;

    this.determineRoomState = function() {
        this.state = ROOM_STATE_HEALTHY;
        if (_.filter(this.creeps, function(x) { return x.memory.role === 'transporter' || x.memory.role === 'harvester'; }).length < 2){
            this.state = ROOM_STATE_UNHEALTHY;
        }
        
        if (this.room.find(FIND_HOSTILE_CREEPS).length > 0) this.state = ROOM_STATE_UNDER_ATTACK;
    }
}

Room.prototype.init = function() {
    this.loadCreeps();
    this.determineRoomState();
    if (this.state != ROOM_STATE_HEALTHY) console.log(this.room.name + '\'s state is ' + this.state);
}

Room.prototype.loadCreeps = function() {
    var creeps = this.room.find(FIND_MY_CREEPS);
    for (var n in creeps) {
        this.creeps.push(creeps[n]);
    }
}


module.exports = Room;
