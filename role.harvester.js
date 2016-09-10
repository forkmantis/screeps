var util = require('util');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.delivering && creep.carry.energy == 0) {
            creep.memory.delivering = false;
            creep.say('harvesting');
        }
        if(!creep.memory.delivering  && creep.carry.energy == creep.carryCapacity) {
            creep.moveTo(Game.flags.build1flag);
            creep.memory.delivering = true;
            creep.say('delivering');
        }

        if(creep.memory.delivering) {
            var target = util.findNearestEmptyExtension(creep);
            if (target) {
                creep.memory.target = target.id;
                error = creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
                if(error == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
            }
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER ||
                                structure.structureType == STRUCTURE_STORAGE) && structure.energy < structure.energyCapacity;
                    }
                });
                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
            }
        }
        else {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
	}
};

module.exports = roleHarvester;