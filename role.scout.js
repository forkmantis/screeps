var util = require('util');

var roleScout = {

    run: function(creep) {
        if (creep.moveToAssignedRoom()) return; 

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

	},
    spawn: function(spawn) {
        return spawn.createCreep([MOVE,MOVE,CLAIM], undefined, {'role': 'scout'});
    }
};

module.exports = roleScout;
