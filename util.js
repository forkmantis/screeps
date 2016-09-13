/**
 * from https://raw.githubusercontent.com/waylon531/screeps/master/scripts/util.js
 */ 

module.exports = {
    findNearestContainer(creep) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            //Get closest container
            filter: function(object) {
                return object.structureType == STRUCTURE_CONTAINER;
            }
        });
    },
    findNearestFullContainer(creep) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            //Get closest container
            filter: function(object) {
                return object.structureType == STRUCTURE_CONTAINER && object.store[RESOURCE_ENERGY] > 0;
            }
        });
    },
    findNearestEmptyContainer(creep) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            //Get closest container
            filter: function(object) {
                return object.structureType == STRUCTURE_CONTAINER && _.sum(object.store) < object.storeCapacity;
            }
        });
    },
    findNearestEmptyStorage(creep) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function(object) {
                return object.structureType == STRUCTURE_STORAGE && _.sum(object.store) < object.storeCapacity;
            }
        })
    },
    findNearestFullStorage(creep) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function(object) {
                return object.structureType == STRUCTURE_STORAGE && object.store[RESOURCE_ENERGY] > 0;
            }
        })  
    },
    findNearestFullContainerOrStorage(creep) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function(object) {
                return (object.structureType == STRUCTURE_STORAGE || object.structureType == STRUCTURE_CONTAINER) &&
                    object.store[RESOURCE_ENERGY] >= creep.carryCapacity;
            }
        });
    },
    findNearestEmptyTower(creep) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function(object) {
                return object.structureType == STRUCTURE_TOWER && object.energy < object.energyCapacity;
            }
        })
    },
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
                return  object.hits < object.hitsMax && object.hits <= 100000;
            }
        })
    },
    findNearestRepairBarrier(creep) {
        var target = null;
        for (var i = 500; i <= 3000000; i += 20000) {
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function(object) {
                    return (object.structureType == STRUCTURE_WALL || object.structureType == STRUCTURE_RAMPART) &&
                        object.hits < object.hitsMax && object.hits < i;
                }
            });
            if (target) return target;
        }
    }
}