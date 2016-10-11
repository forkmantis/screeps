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
            var assignedRoom = Memory.creeps[name].assignedRoom;
            console.log(Memory.creeps[name].role, name, 'has died in room ' + assignedRoom + '!');
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
            var desiredTransporters = 1;
            var desiredBuilders = room.find(FIND_CONSTRUCTION_SITES).length > 0 ? 2 : 0;
            var desiredUpgraders = (room.memory.desiredUpgraders) ? room.memory.desiredUpgraders : 2;
            if (desiredBuilders > 0) desiredUpgraders -= 1;
            var desiredRepairers = 1;
            var desiredWallBuilders = (desiredBuilders > 0) ? 0 : 1;
            var desiredMiners = room.find(FIND_STRUCTURES, { filter: function(x) { return x.structureType == STRUCTURE_EXTRACTOR; }}).length;
         
            var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.assignedRoom == room.name);
            if (harvesters.length < desiredHarvesters) {
                autoSpawn('harvester', roleHarvester.getComponents(room), desiredHarvesters, room, roleHarvester);
            }
            else {
                autoSpawn('transporter', roleTransporter.getComponents(room), desiredTransporters, room, roleTransporter);
                autoSpawn('builder', roleBuilder.getComponents(room), desiredBuilders, room, roleBuilder);
                autoSpawn('upgrader', roleUpgrader.getComponents(room), desiredUpgraders, room, roleUpgrader);
                autoSpawn('repairer', roleRepairer.getComponents(room), desiredRepairers, room, roleRepairer);
                autoSpawn('wallBuilder', roleWallBuilder.getComponents(room), desiredWallBuilders, room, roleWallBuilder);
                autoSpawn('miner', roleMiner.getComponents(room), desiredMiners, room, roleMiner);
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
        if (Game.time % 100 == 0) {
            initRoomMemory(room);
            if (room.terminal) sellMinerals(room);
        }
    }
}

function autoSpawn(role, attributes, quantity, room, creepRole) {
    var spawnedCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.memory.assignedRoom == room.name);
    var spawn = Game.spawns[room.memory.spawnName];

    if (spawnedCreeps.length < quantity) {
        var newName = creepRole.spawn(spawn);
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
            _.sortByOrder(
                room.find(FIND_STRUCTURES, { 
                    filter: function(x) { 
                        return x.structureType == STRUCTURE_LINK &&
                            x.energy < x.energyCapacity * .9; 
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

function sellMinerals(room) {
    var orders = _.sortByOrder(Game.market.getAllOrders(
        (o) => o.type == ORDER_BUY 
        && o.resourceType == room.memory.resourceType
        && o.price > 1.0
    ), ['price']);

    if (orders) {
        var o = _.last(orders);
        var costPerUnit = Game.market.calcTransactionCost(1, o.roomName, room.name);
        var unitsAvailable = room.terminal.store[room.memory.resourceType] - 10000;
        var mostUnits = _.min([unitsAvailable, o.amount]);
        var unitsToTrade = ((mostUnits * costPerUnit) <= room.terminal.store[RESOURCE_ENERGY]) ?
            mostUnits :
            room.terminal.store[RESOURCE_ENERGY] / costPerUnit;

        if (Game.market.deal(o.id, unitsToTrade, room.name) === 0) {
            console.log('SOLD['+ o.id + ']: ' + unitsToTrade + ' units of ' + room.memory.resourceType + ' for ' + o.price + ' per unit and an energy cost of ' + costPerUnit);
        }
        else {
            console.log('ERROR SELLING['+ o.id + ']: ' + unitsToTrade + ' units of ' + room.memory.resourceType + ' for ' + o.price + ' per unit and an energy cost of ' + costPerUnit);
        }
    }
}

function initRoomMemory(room) {
    if (!room.memory.resourceType) {
        var mineral = room.find(FIND_MINERALS)[0];
        room.memory.resourceType = mineral.mineralType;
    }
    if (!room.memory.hasExtractor) {
        room.memory.hasExtractor = room.find(FIND_STRUCTURES, { 
            filter: function(x) {
                return x.structureType === STRUCTURE_TERMINAL; 
            }
        }).length > 0;
    }
}
