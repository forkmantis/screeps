var util = require('util');


var roleTransporter = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.transporting && creep.carry.energy == 0) {
            creep.memory.transporting = false;
            creep.say('acquiring');
        }
        if(!creep.memory.transporting  && creep.carry.energy == creep.carryCapacity) {
            creep.memory.transporting = true;
            creep.say('transporting');
        }

        if(creep.memory.transporting) {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN
                        || structure.structureType == STRUCTURE_EXTENSION) 
                        && structure.energy < structure.energyCapacity;
                }
            });
            if (!target) target = util.findNearestEmptyTower(creep);
            if (!target) target = findInLink(creep);
            creep.memory.target = (target) ? target.id : undefined;
            if (creep.memory.target) {
                error = creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
                if(error == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
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
            var storage = util.findNearestFullContainer(creep);
            if (storage) {
                creep.memory.target = storage.id;
                if(creep.withdraw(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
            }
        }
	},
    spawn: function(spawn) {
        return spawn.createCreep(this.getComponents(spawn.room), undefined
            , { 'role': 'transporter', 'assignedRoom': spawn.room.name });
    },
    getComponents: function(room) {
        if (room.energyCapacityAvailable >= 1300) {
            return [CARRY,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 800) {
            return [CARRY,MOVE,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 450) {
            return [CARRY,MOVE,CARRY,CARRY,MOVE];
        }
        else if (room.energyCapacityAvailable >= 300) {
            return [CARRY,MOVE,CARRY,MOVE];
        }
    }
};

function findInLink(creep) {
    var link = _.first(creep.pos.findInRange(FIND_STRUCTURES, 10, {
        filter: function(x) {
            return x.structureType == STRUCTURE_LINK && x.energy < x.energyCapacity;
        }
    }));
    if (link) {
        return link;
    }
    return undefined;
}

module.exports = roleTransporter;
