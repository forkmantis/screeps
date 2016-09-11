var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    autoSpawn('harvester', [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], 4);
    autoSpawn('upgrader', [WORK,WORK,WORK,CARRY,CARRY,MOVE], 5);
    if(Game.rooms['W28N27'].find(FIND_CONSTRUCTION_SITES).length > 0) {
        autoSpawn('builder', [WORK,WORK,WORK,CARRY,CARRY,MOVE], 2);
    }
    autoSpawn('repairer', [WORK,WORK,CARRY,MOVE,MOVE,MOVE], 2);
    
    towerRun();

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
    }
    
    //var construcionSites = Game.rooms[0].find(FIND_CONSTRUCTION_SITES);
}

function autoSpawn(role, attributes, quantity) {
    var spawns = _.filter(Game.creeps, (creep) => creep.memory.role == role);

    if (spawns.length < quantity) {
        var newName = Game.spawns['SpawnMantis'].createCreep(attributes, undefined, {'role': role});
        console.log('Spawning new ' + role + ' ' + newName);
    }
}

function towerRun() {
    var tower = Game.getObjectById('57d162391730b79e7c7dd2a0');
    if(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }

        if (tower.energy > (tower.energyCapacity * .5)) {
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
                && structure.hits < 20000
                && structure.structureType != STRUCTURE_ROAD
            });
            if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
        }
    }
}