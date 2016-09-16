var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallBuilder = require('role.wallBuilder');
var _ = require('lodash');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            console.log(Memory.creeps[name].role, name, 'has died!');
            delete Memory.creeps[name];
        }
    }

    var desiredHarvesters = 6;
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    if (harvesters.length < desiredHarvesters) {
        autoSpawn('harvester', [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], desiredHarvesters);
    }
    else {
        autoSpawn('upgrader', [WORK,WORK,WORK,CARRY,CARRY,MOVE], 5);
        var constructionSiteCount = Game.rooms['W28N27'].find(FIND_CONSTRUCTION_SITES).length
        if( constructionSiteCount > 0) {
            autoSpawn('builder', [WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE], constructionSiteCount > 3 ? 3 : constructionSiteCount);
        }
        autoSpawn('repairer', [WORK,WORK,CARRY,MOVE,MOVE,MOVE], 2);
        autoSpawn('wallBuilder', [WORK,WORK,CARRY,CARRY,MOVE,MOVE], 2);
    }
    
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
        if(creep.memory.role == 'wallBuilder') {
            roleWallBuilder.run(creep);
        }
    }
    
    for (var room in Game.rooms) {
        var towers = Game.rooms[room].find(FIND_MY_STRUCTURES, { filter: (tower) => tower.structureType == STRUCTURE_TOWER});
	for(var name in towers) {
	    tower = towers[name];

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
}

function autoSpawn(role, attributes, quantity) {
    var spawns = _.filter(Game.creeps, (creep) => creep.memory.role == role);

    if (spawns.length < quantity) {
        var newName = Game.spawns['SpawnMantis'].createCreep(attributes, undefined, {'role': role});
        if (_.isString(newName)) {
            console.log('Spawning new ' + role + ' ' + newName);
        }
    }
}

