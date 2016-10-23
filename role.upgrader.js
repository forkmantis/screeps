var util = require('util');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep, room) {

        if (creep.ticksToLive == 1 && creep.room.name == room.name) {
            creep.memory.stats.name = creep.name;
            var stats = creep.room.memory.stats.upgrader;
            stats.push(creep.memory.stats);
            if (stats.length > 5) stats.shift();
        }

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        var flag = creep.pos.findClosestByRange(FIND_FLAGS);
	        if (flag) {
	            creep.moveTo(flag.id);    
	        }
	        creep.memory.upgrading = true;
	        creep.say('upgrading');
            if (!creep.memory.stats.ticksToFirstAction) creep.memory.stats.ticksToFirstAction = 1500 - creep.ticksToLive;
            if (!creep.memory.stats.roundTrips) creep.memory.stats.roundTrips = 0;
            creep.memory.stats.roundTrips += 1;
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
            else {
                if (!(creep.memory.stats)) {
                    creep.memory.stats = {};
                }
                if (!(creep.memory.stats.output)) {
                    creep.memory.stats.output = 0;
                }
                creep.memory.stats.output += _.sum(creep.body, function(x) { return x.type == WORK; })
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
    spawn: function(spawn, energyAvailable) {
        var components = this.getComponents(energyAvailable);
        return spawn.createCreep(
            components
            , undefined
            , {
                'role': 'upgrader'
                , 'assignedRoom': spawn.room.name 
                , 'stats': {
                    'output': 0
                    , 'roundTrips': 0
                    , 'timeToSpawn': components.length * 3
                    , 'ticksToFirstAction': undefined
                }
            }
        );
    },
    getComponents: function(energyAvailable) {
        if (energyAvailable >= 1000) {
            return [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        else if (energyAvailable >= 750) {
            return [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        else if (energyAvailable >= 500) {
            return [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
        }
        else if (energyAvailable >= 350) {
            return [WORK,WORK,CARRY,MOVE,MOVE];
        }
        else if (energyAvailable >= 200) {
            return [WORK,CARRY,MOVE];
        }
    }
};


module.exports = roleUpgrader;
