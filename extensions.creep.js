Creep.prototype.pickupDroppedEnergy = function(range) {
    range = (range) ? range : 5;

    var drop = _.first(this.pos.findInRange(FIND_DROPPED_ENERGY, range, {
        filter: function(x) { return x.amount > 25; }
    }));
    if (drop) {
        if (this.pickup(drop) == ERR_NOT_IN_RANGE) {
            this.moveTo(drop);
        }
        return true;
    }

    return false;
}

Creep.prototype.moveToAssignedRoom = function() {
    if (!this.memory.assignedRoom) this.memory.assignedRoom = this.room.name;
    return this.moveToRoom(this.memory.assignedRoom);
}

Creep.prototype.moveToRoom = function(roomName) {
    if (!roomName) roomName = this.room.name;
    if (!this.memory.stats) this.memory.stats = {};
    if(roomName != this.room.name) {
        var exitDir = Game.map.findExit(this.room.name, roomName);
        var exit = this.pos.findClosestByRange(exitDir);
        this.moveTo(exit);
        return true;
    }
    else {
        if (this.pos.x === 0 
            || this.pos.x === 49
            || this.pos.y === 0
            || this.pos.y === 49) {
            this.moveTo(25,25);
            return true;
        }
    }

    return false;
}
