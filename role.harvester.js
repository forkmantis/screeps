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
            var targetContainer = util.findNearestEmptyContainer(creep);
            var targetStorage = util.findNearestEmptyStorage(creep);
            if (targetContainer) {
                creep.memory.target = targetContainer.id;
            }
            else if (targetStorage) {
                creep.memory.target = targetStorage.id;
            }
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
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
            var pos = (creep.memory.homeSource) ? 
                Game.getObjectById(creep.memory.homeSource).pos :
                creep.pos;

            var source = pos.findClosestByRange(FIND_SOURCES);
            if (source) {
                creep.memory.target = source.id;
                if(creep.harvest(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
            }
        }
	},
    spawn: function(spawn, targetId) {
        return spawn.createCreep(this.getComponents(spawn.room), undefined, {'role': 'harvester'
            , 'homeSource': targetId, 'assignedRoom': spawn.room.name });
    },
    getComponents: function(room) {
        if (room.energyCapacityAvailable >= 1300) {
            return [WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 800) {
            return [WORK,WORK,CARRY,CARRY,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 450) {
            return [WORK,WORK,CARRY,MOVE];
        }
        else if (room.energyCapacityAvailable >= 300) {
            return [WORK,CARRY,MOVE];
        }
    }
};

module.exports = roleHarvester;
