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

    autoSpawn('harvester', [WORK,WORK,CARRY,CARRY,MOVE,MOVE], 3);
    autoSpawn('upgrader', [WORK,WORK,CARRY,CARRY,MOVE,MOVE], 4);
    autoSpawn('builder', [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE], 3);
    autoSpawn('repairer', [WORK,WORK,CARRY,CARRY,MOVE,MOVE], 3);
    

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
}

function autoSpawn(role, attributes, quantity) {
    var spawns = _.filter(Game.creeps, (creep) => creep.memory.role == role);

    if (spawns.length < quantity) {
        var newName = Game.spawns['SpawnMantis'].createCreep(attributes, undefined, {'role': role});
        if (newName > 0) {
            console.log('Spawning new ' + role + ' ' + newName);
        }
    }
}