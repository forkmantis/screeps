/**
 * from https://raw.githubusercontent.com/waylon531/screeps/master/scripts/util.js
 */ 

module.exports = {
    findNearestEmptyExtension(creep) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            //Get closest container
            filter: function(object) {
                return object.structureType == STRUCTURE_EXTENSION && object.energy < object.energyCapacity;
            }
        });
    },
    findNearestRepairTarget(creep) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function(object) {
                //Filter out buildings with full health
                return object.hits < object.hitsMax && object.hits < 100000; //Don't repair over 100K
            }
        });
    }
}