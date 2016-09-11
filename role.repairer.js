var util = require('util');

var roleRepairer = {

    run: function(creep) {

        var error = 0;

	    if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
	        creep.moveTo(Game.flags.build1flag);
	        creep.memory.repairing = true;
	        creep.say('repairing');
	    }

	    if(creep.memory.repairing) {
	        var target = util.findNearestRepairTarget(creep);
            if(target) {
                creep.memory.target = target.id;
                error = creep.repair(Game.getObjectById(creep.memory.target));
                if(error == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
            }
	    }
	    else {
	        var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1]);
            }
	    }
	}
};

module.exports = roleRepairer;