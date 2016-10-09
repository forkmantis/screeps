var util = require('util');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('building');
	    }

	    if(creep.memory.building) {
	        var target = _.first(creep.room.find(FIND_CONSTRUCTION_SITES));
            if(target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            else {
                var flag = creep.pos.findClosestByRange(FIND_FLAGS);
                if (flag) {
                    creep.moveTo(flag);    
                }
            }
	    }
	    else {
            
            var storage = util.findNearestFullContainerOrStorage(creep);
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
	},
    spawn: function(spawn) {
        return spawn.createCreep(this.getComponents(spawn.room), undefined, {'role': 'harvester', 'assignedRoom': spawn.room.name});
    },
    getComponents: function(room) {
        if (room.energyCapacityAvailable >= 1800) {
            return [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 1300) {
            return [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,CARRY,MOVE,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 800) {
            return [WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 450) {
            return [WORK,CARRY,CARRY,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 300) {
            return [WORK,CARRY,MOVE];
        }
    }
};


module.exports = roleBuilder;
