var util = require('util');

var roleScout = {

    run: function(creep) {
        if (creep.memory.targetRoom) {
            if(creep.memory.targetRoom != creep.room.name) {
                var exitDir = Game.map.findExit(creep.room.name, creep.memory.targetRoom);
                var exit = creep.pos.findClosestByRange(exitDir);
                creep.moveTo(exit);
            }
            else {
                if (creep.room.controller) {
                    var error = creep.claimController(creep.room.controller);
                    if (error == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }
                }
                if(creep.room.controller && !creep.room.controller.my) {
                    var newError = creep.attackController(creep.room.controller);
                    if(newError == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }
                }
            }
        }
        else {
            var exits = Game.map.describeExits(creep.room.name);
            for (var exit in exits) {
                if (Game.map.isRoomAvailable(exits[exit])) {
                    creep.memory.targetRoom = exits[exit];
                }
            }
        }

	},
    spawn: function(spawn) {
        return spawn.createCreep([MOVE,MOVE,CLAIM], undefined, {'role': 'scout'});
    }
};

module.exports = roleScout;
