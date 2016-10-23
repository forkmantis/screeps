Creep.prototype.moveToAssignedRoom = function() {
    if(this.memory.assignedRoom != this.room.name) {
        var exitDir = Game.map.findExit(this.room.name, this.memory.assignedRoom);
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
