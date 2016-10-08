var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallBuilder = require('role.wallBuilder');
var roleTransporter = require('role.transporter');
var roleMiner = require('role.miner');
var roleScout = require('role.scout');
var _ = require('lodash');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            console.log(Memory.creeps[name].role, name, 'has died!');
            delete Memory.creeps[name];
        }
    }

    for(var roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        var spawn = room.find(FIND_STRUCTURES, { filter: function(x) { return x.structureType == STRUCTURE_SPAWN; }})[0];
        if (spawn) {
            room.memory.spawnName = spawn.name;
            if (room.memory.sourceCount == undefined) {
                room.memory.sourceCount = room.find(FIND_SOURCES).length;
            }

            var desiredHarvesters = 2 * room.memory.sourceCount;
         
            var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.assignedRoom == room.name);
            if (harvesters.length < desiredHarvesters) {
                var newName = roleHarvester.spawn(spawn, assignSourceToHarvester(room));
                if (_.isString(newName)) {
                    console.log('Spawning new harvester ' + newName);
                }
            }
            else {
                autoSpawn('upgrader', roleUpgrader.getComponents(room), 2, room);
                var constructionSiteCount = room.find(FIND_CONSTRUCTION_SITES).length
                if( constructionSiteCount > 0) {
                    autoSpawn('builder', roleBuilder.getComponents(room), constructionSiteCount > 0 ? 2 : 0, room);
                }
                autoSpawn('repairer', roleRepairer.getComponents(room), 1, room);
                autoSpawn('wallBuilder', roleWallBuilder.getComponents(room), 1, room);
                var transporters = _.filter(Game.creeps, (creep) => creep.memory.role == 'transporter' && creep.memory.assignedRoom == room.name);
                if (transporters.length < 2) {
                    var newName = roleTransporter.spawn(spawn);
                    if (_.isString(newName)) {
                        console.log('Spawning new transporter ' + newName);
                    }
                    autoSpawn('transporter', [WORK,CARRY,MOVE], 2, room);
                }
                if (_.sum(Game.creeps, (c) => c.memory.role == 'miner') < 1) {
                    var newName = roleMiner.spawn(spawn);
                    if (_.isString(newName)) {
                        console.log('Spawning new miner ' + newName);
                    }
                }
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
            if(creep.memory.role == 'miner') {
                roleMiner.run(creep);
            }
            if(creep.memory.role == 'scout') {
                roleScout.run(creep);
            }
        }

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


        distributeLinkEnergy(room);
    }
}

function autoSpawn(role, attributes, quantity, room, creepRole) {
    var spawns = _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.memory.assignedRoom == room.name);
    var spawn = Game.spawns[room.memory.spawnName];

    if (spawns.length < quantity) {
        var newName = spawn.createCreep(attributes, undefined, 
            {
                'role': role,
                'assignedRoom': room.name
            });
        if (_.isString(newName)) {
            console.log('Spawning new ' + role + ' ' + newName + ' into ' + room.name);
        }
    }
}

function distributeLinkEnergy(room) {
    var fullLink = _.first(
        room.find(FIND_STRUCTURES, { 
            filter: function(x) { 
                return x.structureType == STRUCTURE_LINK &&
                    x.energy == x.energyCapacity; 
                } 
            }
        )
    );


    if (fullLink) {
        var emptyLink = _.first(
            _.sortBy(
                room.find(FIND_MY_STRUCTURES, { 
                    filter: function(x) { 
                        return x.structureType == STRUCTURE_LINK &&
                            x.energyCapacity == 800 && // for some reason extensions are counting as STRUCTURE_LINK
                            x.energy < x.energyCapacity *.7; 
                        } 
                    }
                )
            , ['energy'])
        );

        if (emptyLink) {
            fullLink.transferEnergy(emptyLink);
        }
    }
}

function assignSourceToHarvester(room) {
    var sourceCounts = {};
    _.filter(room.find(FIND_SOURCES)).map(function(source) { sourceCounts[source.id] = 2;});

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

    return harvesterSource;
}
