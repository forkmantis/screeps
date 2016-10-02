var util = require('util');


var roleTransporter = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.transporting && creep.carry.energy == 0) {
            creep.memory.transporting = false;
            creep.say('acquiring');
        }
        if(!creep.memory.transporting  && creep.carry.energy == creep.carryCapacity) {
	        var flag = creep.pos.findClosestByRange(FIND_FLAGS);
	        if (flag) {
	            creep.moveTo(flag.id);    
	        }
            creep.memory.transporting = true;
            creep.say('transporting');
        }

        if(creep.memory.transporting) {
            var targetExtension = util.findNearestEmptyExtension(creep);
            var targetTurret = util.findNearestEmptyTower(creep);
            var targetLink = findInLink(creep);
            if (targetExtension) {
                creep.memory.target = targetExtension.id;
            }
            else if (targetTurret) {
                creep.memory.target = targetTurret.id;
            }
            else if (targetLink) {
                creep.memory.target = targetLink;
            }
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN) 
                            && structure.energy < structure.energyCapacity;
                    }
                });
                if(targets.length > 0) {
                    creep.memory.target = targets[0].id;
                }
                else {
                    creep.memory.target = undefined;
                }
            }
            error = creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
            if(error == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.target));
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
    spawn: function(spawn, targetId) {
        return spawn.createCreep([WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined
            , { 'role': 'transporter', 'homeSource': targetId });
    }
};

function findInLink(creep) {
    var link = _.first(creep.pos.findInRange(FIND_STRUCTURES, 7, {
        filter: function(x) {
            return x.structureType == STRUCTURE_LINK && x.energy < x.energyCapacity;
        }
    }));
    if (link) {
        return link.id;
    }
    return undefined;
}

module.exports = roleTransporter;
