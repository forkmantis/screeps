var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    autoSpawn('harvester', [WORK,CARRY,MOVE], 2);
    autoSpawn('upgrader', [WORK,CARRY,MOVE], 2);

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
    }
}

function autoSpawn(role, attributes, quantity) {
    var spawns = _.filter(Game.creeps, (creep) => creep.memory.role == role);
    console.log(role + ' ' + spawns.length);
    
    if (spawns.length < quantity) {
        var newName = Game.spawns['SpawnMantis'].createCreep(attributes, undefined, {'role': role});
        console.log('Spawning new ' + role + ' ' + newName);
    }
}