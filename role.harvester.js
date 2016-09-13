var util = require('util');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.delivering && creep.carry.energy == 0) {
            creep.memory.delivering = false;
            creep.say('harvesting');
        }
        if(!creep.memory.delivering  && creep.carry.energy == creep.carryCapacity) {
	        var flag = creep.pos.findClosestByRange(FIND_FLAGS);
	        if (flag) {
	            creep.moveTo(flag.id);    
	        }
            creep.memory.delivering = true;
            creep.say('delivering');
        }

        if(creep.memory.delivering) {
            var targetExtension = util.findNearestEmptyExtension(creep);
            var targetTurret = util.findNearestEmptyTower(creep);
            var targetContainer = util.findNearestEmptyContainer(creep);
            var targetStorage = util.findNearestEmptyStorage(creep);
            if (targetExtension) {
                creep.memory.target = targetExtension.id;
            }
            else if (targetTurret) {
                creep.memory.target = targetTurret.id;
            }
            else if (targetContainer) {
                creep.memory.target = targetContainer.id;
            }
            else if (targetStorage) {
                creep.memory.target = targetStorage.id;
            }
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
                });
                if(targets.length > 0) {
                    creep.memory.target = targets[0].id;
                }
            }
            error = creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
            if(error == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.target));
            }
        }
        else {
            var dropped = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
            var source = creep.pos.findClosestByRange(FIND_SOURCES);
            if (dropped) {
                creep.memory.target = dropped.id;
                if(creep.pickup(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
            }
            else if (source) {
                creep.memory.target = source.id;
                if(creep.harvest(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
            }
        }
	}
};

module.exports = roleHarvester;