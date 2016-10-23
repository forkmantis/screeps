var util = require('util');

var roleWallBuilder = {

    run: function(creep, room) {
        if (creep.moveToAssignedRoom()) return;
        if (!creep.memory.repairing && _.sum(creep.carry) < creep.carryCapacity && creep.pickupDroppedEnergy()) return;

        if (creep.ticksToLive == 1 && creep.room.name == room.name) {
            creep.memory.stats.name = creep.name;
            var stats = creep.room.memory.stats.wallBuilder;
            stats.push(creep.memory.stats);
            if (stats.length > 5) stats.shift();
        }

	    if(creep.memory.repairing && creep.carry.energy == 0) {
            delete creep.memory.target;
            creep.memory.repairing = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
            delete creep.memory.target;
	        creep.memory.repairing = true;
	        creep.say('barriers!');
	    }

	    if(creep.memory.repairing) {
            if (!creep.memory.target) {
                var target = util.findNearestRepairBarrier(creep);
                creep.memory.target = target.id;
            }
            if(creep.memory.target) {
                error = creep.repair(Game.getObjectById(creep.memory.target));
                if(error == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
                else {
                    if (!creep.memory.stats) creep.memory.stats = {};
                    if (!creep.memory.stats.output) creep.memory.stats.output = 0;
                    creep.memory.stats.output += _.sum(creep.body, function(x) { return x.type == WORK; })
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
        var components = this.getComponents(spawn.room);
        return spawn.createCreep(components, undefined, {
            'role': 'wallBuilder'
            , 'assignedRoom': spawn.room.name
            , 'stats': {
                'output': 0
                , 'roundTrips': 0
                , 'timeToSpawn': components.length * 3
                , 'ticksToFirstAction': undefined
            }
        });
    },
    getComponents: function(room) {
        if (room.energyCapacityAvailable >= 700) {
            return [WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 550) {
            return [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 400) {
            return [WORK,WORK,CARRY,MOVE,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 300) {
            return [WORK,CARRY,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 200) {
            return [WORK,CARRY,MOVE];
        }
    }
};

module.exports = roleWallBuilder;
