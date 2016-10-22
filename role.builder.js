var util = require('util');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep, room) {
        if (creep.ticksToLive == 1 && creep.room.name == room.name) {
            creep.memory.stats.name = creep.name;
            var stats = creep.room.memory.stats.builder;
            stats.push(creep.memory.stats);
            if (stats.length > 5) stats.shift();
        }

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
                else {
                    if (!creep.memory.stats) creep.memory.stats = {};
                    var workUnits = _.sum(creep.body, function(x) { return x.type == WORK; });
                    creep.memory.stats.output = (creep.memory.stats.output) ? 
                        creep.memory.stats.output +=  workUnits :
                        workUnits;
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
                var source = creep.memory.homeSource;
                if (!source) source = creep.pos.findClosestByRange(FIND_SOURCES).id;
                if (source) {
                    creep.memory.target = source;
                }
                if(creep.harvest(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
            }
	    }
	},
    spawn: function(spawn, energyLevel) {
        var components = this.getComponents(energyLevel);
        return spawn.createCreep(components, undefined, 
        {
            'role': 'builder'
            , 'assignedRoom': spawn.room.name
            , 'stats': { 
                'output': 0
                , 'ticksToSpawn': components.length * 3
            }
        });
    },
    getComponents: function(energyAvailable) {
        if (energyAvailable >= 1200) {
            return [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOEV,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        else if (energyAvailable >= 950) {
            return [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOEV,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        else if (energyAvailable >= 700) {
            return [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        else if (energyAvailable >= 600) {
            return [WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
        }
        else if (energyAvailable >= 500) {
            return [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
        }
        else if (energyAvailable >= 400) {
            return [WORK,WORK,CARRY,MOVE,MOVE,MOVE];
        }
        else if (energyAvailable >= 300) {
            return [WORK,WORK,CARRY,MOVE];
        }
    }
};


module.exports = roleBuilder;
