var util = require('util');

var roleRepairer = {

    run: function(creep) {

        var error = 0;

	    if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
	        var flag = creep.pos.findClosestByRange(FIND_FLAGS);
	        if (flag) {
	            creep.moveTo(flag.id);    
	        }
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
            var storage = util.findNearestFullStorage(creep);
            if (storage) {
                creep.memory.target = storage.id;
                if(creep.withdraw(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
            }
            else {
                var source = creep.pos.findClosestByRange(FIND_SOURCES);
                if (source) {
                    creep.memory.target = source.id;
                }
                if(creep.harvest(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
            }
	    }
	}
};

module.exports = roleRepairer;