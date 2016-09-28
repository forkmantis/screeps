var util = require('util');

var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
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
            var targetStorage = util.findNearestEmptyStorage(creep);
            if (targetStorage) {
                creep.memory.target = targetStorage.id;
            }

            error = creep.transfer(Game.getObjectById(creep.memory.target), creep.memory.mineralType);
            if(error == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.target));
            }
        }
        else {
            creep.memory.target = creep.pos.findClosestByRange(FIND_MINERALS).id;
            creep.memory.mineralType = Game.getObjectById(creep.memory.target).mineralType;

            if(creep.harvest(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.target));
            }
        }
	},
    spawn: function(spawn) {
        return spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {'role': 'miner'});
    }
};

module.exports = roleMiner;
