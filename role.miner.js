var util = require('util');

var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep, room) {
        if (creep.ticksToLive == 1 && creep.room.name == room.name) {
            creep.memory.stats.name = creep.name;
            var stats = creep.room.memory.stats.miner;
            stats.push(creep.memory.stats);
            if (stats.length > 5) stats.shift();
        }

        if(creep.memory.delivering && _.sum(creep.carry) == 0) {
            creep.memory.delivering = false;
            creep.say('mining');
        }
        if(!creep.memory.delivering && _.sum(creep.carry) > 0) {
	        var flag = creep.pos.findClosestByRange(FIND_FLAGS);
	        if (flag) {
	            creep.moveTo(flag.id);    
	        }
            creep.memory.delivering = true;
            creep.say('delivering');
        }

        if(creep.memory.delivering) {
            var targetTerminal = _.first(creep.room.find(FIND_STRUCTURES, { filter: function(x) {
                return x.structureType == STRUCTURE_TERMINAL &&
                _.sum(x.store) < x.storeCapacity &&
                x.store[RESOURCE_ENERGY] < 50000;
            }}));
            var targetStorage = util.findNearestEmptyStorage(creep);
            if (targetTerminal) {
                creep.memory.target = targetTerminal.id;
            }
            else if (targetStorage) {
                creep.memory.target = targetStorage.id;
            }

            var resourceType = (Object.keys(creep.carry).length > 1) ?
                creep.memory.mineralType :
                RESOURCE_ENERGY;

            error = creep.transfer(Game.getObjectById(creep.memory.target), resourceType);
            if(error == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.target));
            }
        }
        else {
            var mineral = creep.pos.findClosestByRange(FIND_MINERALS);
            var extractor = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: function(x) {
                return x.structureType == STRUCTURE_EXTRACTOR;
            }});
            if (mineral.mineralAmount > 0 && extractor.cooldown == 0) {
                creep.memory.target = mineral.id;
                creep.memory.mineralType = Game.getObjectById(creep.memory.target).mineralType;

                if(creep.harvest(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
                else {
                    if (!creep.memory.stats) creep.memory.stats = {};
                    if (!creep.memory.stats.output) creep.memory.stats.output = 0;
                    creep.memory.stats.output += _.sum(creep.body, function(x) { return x.type == WORK; })
                }
            }
            else {
                var link = _.first(creep.pos.findInRange(FIND_STRUCTURES, 3, {
                    filter: function(x) {
                        return x.structureType == STRUCTURE_LINK;
                    }
                }));
                if (link) creep.memory.target = link.id;
                var error = creep.withdraw(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
                if(error == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
            }
        }
	},
    spawn: function(spawn) {
        var components = this.getComponents(spawn.room);
        return spawn.createCreep(components, undefined, {
            'role': 'miner'
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
        if (room.energyCapacityAvailable >= 1800) {
            return [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 1300) {
            return [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 800) {
            return [WORK,WORK,CARRY,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 450) {
            return [WORK,WORK,CARRY,MOVE];
        }
        else if (room.energyCapacityAvailable >= 300) {
            return [WORK,CARRY,MOVE];
        }
    }
};


module.exports = roleMiner;
