var util = require('util');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep, room) {

        if (creep.ticksToLive == 1499) {
            console.log('harvester ' + creep.name + ' was born on ' + creep.memory.stats.spawnedOn +
                ' and spawn finished at ' + Game.time + ' for a spawn time of ' + Game.time - creep.memory.stats.spawnedOn);
            creep.memory.stats.ticksToSpawn = Game.time - creep.memory.stats.spawnedOn;
            delete creep.memory.stats.spawnedOn;
        }
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
    spawn: function(spawn) {
        var source = this.assignSourceToHarvester(spawn.room);
        return spawn.createCreep(this.getComponents(spawn.room), undefined, 
            {
                'role': 'harvester'
                , 'homeSource': source
                , 'assignedRoom': spawn.room.name 
                , 'stats': { output: 0, 'source': source }
                , 'spawnedOn': Game.time
                , 'ticksToSpawnFromSpawn': spawn.spawning.needTime
            }
        );
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
    },
	assignSourceToHarvester: function(room) {
		var sourceCounts = {};
		_.filter(room.find(FIND_SOURCES)).map(function(source) { sourceCounts[source.id] = 2;});

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
