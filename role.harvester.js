var util = require('util');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep, room) {
        if (creep.moveToAssignedRoom()) return; 
        if (_.sum(creep.carry) > creep.carryCapacity && creep.pickupDroppedEnergy()) return;

        if(creep.ticksToLive == 1 && creep.room.name === room.name) {
            creep.memory.stats.name = creep.name;
            var stats = creep.room.memory.stats.harvester;
            stats.push(creep.memory.stats);
            if (stats.length > 5 * Object.keys(creep.room.memory.sources).length) stats.shift();
        }
        
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
            var target = util.findNearestEmptyContainer(creep);
            if (!target) target = util.findNearestEmptyStorage(creep);
            if (!target) target = util.findNearestEmptyExtension(creep);
            if (!target) target = _.first(creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                    }
                }));
            creep.memory.target = (target) ? target.id : undefined;
            if (creep.memory.target) {
                var error = creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
                if(error == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
                else {
                    if (!creep.memory.stats) creep.memory.stats = {};
                    creep.memory.stats.output = (creep.memory.stats.output) ? 
                        creep.memory.stats.output += creep.carryCapacity :
                        creep.carryCapacity;
                    creep.memory.stats.roundTrips = (creep.memory.stats.roundTrips) ?
                        creep.memory.stats.roundTrips += 1 : 1;
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
            var pos = (creep.memory.homeSource) ? 
                Game.getObjectById(creep.memory.homeSource).pos :
                creep.pos;

            var source = pos.findClosestByRange(FIND_SOURCES);
            if (source) {
                creep.memory.target = source.id;
                if(creep.harvest(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
                else {
                    if (!creep.memory.stats) creep.memory.stats = {};
                    if (!creep.memory.stats.ticksToFirstAction) {
                        creep.memory.stats.ticksToFirstAction = 1500 - creep.ticksToLive;
                    }
                }
            }
        }
	},
    spawn: function(spawn, energyAvailable) {
        var source = this.assignSourceToHarvester(spawn.room);
        if (!energyAvailable) energyAvailable = spawn.room.energyCapacityAvailable;
        var components = this.getComponents(energyAvailable);
        if (!components) return;
        return spawn.createCreep(components, undefined, 
            {
                'role': 'harvester'
                , 'homeSource': source
                , 'assignedRoom': spawn.room.name 
                , 'stats': { 
                    'output': 0
                    , 'source': source
                    , 'ticksToSpawn': components.length * 3
                }
            }
        );
    },
    getComponents: function(energyAvailable) {
        if (energyAvailable >= 950) {
            return [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        else if (energyAvailable >= 850) {
            return [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE];
        }
        else if (energyAvailable >= 750) {
            return [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE];
        }
        else if (energyAvailable >= 650) {
            return [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE];
        }
        else if (energyAvailable >= 550) {
            return [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE];
        }
        else if (energyAvailable >= 450) {
            return [WORK,WORK,WORK,CARRY,MOVE,MOVE];
        }
        else if (energyAvailable >= 400) {
            return [WORK,WORK,WORK,CARRY,MOVE];
        }
        else if (energyAvailable >= 300) {
            return [WORK,WORK,CARRY,MOVE];
        }
        else if (energyAvailable >= 200) {
            return [WORK,CARRY,MOVE];
        }
    },
	assignSourceToHarvester: function(room) {
		var sourceCounts = {};
		_.filter(room.find(FIND_SOURCES)).map(function(source) { sourceCounts[source.id] = 1;});

		var harvesterCounts = {};

		_.filter(Game.creeps, (c) => c.memory.role === 'harvester' && c.room.name == room.name).map(function(c) {var a = c.memory.homeSource; 
			if (a in harvesterCounts) {
				harvesterCounts[a]++;
			}
			else {
				harvesterCounts[a] = 1;
			}
		});
		for (var c in sourceCounts) {
			if (c in harvesterCounts) {
				sourceCounts[c] = sourceCounts[c] - harvesterCounts[c];
			}
		}
		var harvesterSource;
		for (var src in sourceCounts) {
			if (sourceCounts[src] > 0) {
				 harvesterSource = src;
			}
		}

		return harvesterSource;
	}
};

module.exports = roleHarvester;
