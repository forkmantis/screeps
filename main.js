var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallBuilder = require('role.wallBuilder');
var roleTransporter = require('role.transporter');
var _ = require('lodash');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            console.log(Memory.creeps[name].role, name, 'has died!');
            delete Memory.creeps[name];
        }
    }

    var sourceCounts = {};
    _.filter(Game.rooms['W28N27'].find(FIND_SOURCES)).map(function(source) { sourceCounts[source.id] = 2;});
    
    var harvesterCounts = {};

    _.filter(Game.creeps, (c) => c.memory.role === 'harvester').map(function(c) {var a = c.memory.homeSource; 
        if (a in harvesterCounts) {
            harvesterCounts[a]++;
        }
        else {
            harvesterCounts[a] = 1;
        }
    });
    for (var c in sourceCounts) {
        if (c in harvesterCounts) {
            sourceCounts[c] = sourceCounts[c] - harvesterCounts[c];
        }
    }
    var harvesterSource;
    for (var src in sourceCounts) {
        if (sourceCounts[src] > 0) {
             harvesterSource = src;
        }
    }
 
    var desiredHarvesters = 4;
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    if (harvesters.length < desiredHarvesters) {
        var newName = roleHarvester.spawn(Game.spawns['SpawnMantis'], harvesterSource);
        if (_.isString(newName)) {
            console.log('Spawning new harvester ' + newName);
        }
        autoSpawn('harvester', [WORK,CARRY,MOVE], 2);
    }
    else {
        autoSpawn('upgrader', [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], 2);
        var constructionSiteCount = Game.rooms['W28N27'].find(FIND_CONSTRUCTION_SITES).length
        if( constructionSiteCount > 0) {
            autoSpawn('builder', [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], constructionSiteCount > 0 ? 1 : 0);
        }
        autoSpawn('repairer', [WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], 1);
        autoSpawn('wallBuilder', [WORK,WORK,CARRY,CARRY,MOVE,MOVE], 2);
        var transporters = _.filter(Game.creeps, (creep) => creep.memory.role == 'transporter');
        if (transporters.length < 2) {
            var newName = roleTransporter.spawn(Game.spawns['SpawnMantis']);
            if (_.isString(newName)) {
                console.log('Spawning new transporter ' + newName);
            }
            autoSpawn('transporter', [WORK,CARRY,MOVE], 2);
        }
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
        if(creep.memory.role == 'transporter') {
            roleTransporter.run(creep);
        }
    }
    
    for (var name in Game.rooms) {
        var room = Game.rooms[name];

        var towers = room.find(FIND_MY_STRUCTURES, { filter: (tower) => tower.structureType == STRUCTURE_TOWER});
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

