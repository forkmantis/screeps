var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallBuilder = require('role.wallBuilder');
var roleTransporter = require('role.transporter');
var roleMiner = require('role.miner');
var roleScout = require('role.scout');
var roleMelee = require('role.melee');
var roleHealer = require('role.healer');
var roleAgitator = require('role.agitator');
var Room = require('room');
var _ = require('lodash');
require('extensions.creep');

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
        var spawn = room.find(FIND_MY_STRUCTURES, { filter: function(x) { return x.structureType == STRUCTURE_SPAWN; }})[0];
        if (spawn) {
            var roomController = new Room(room);
            roomController.init();
            room.memory.spawnName = spawn.name;
            var sourceCount = (room.memory.sources) ? Object.keys(room.memory.sources).length : 1;
            var desiredHarvesters = sourceCount;
            var desiredTransporters = room.find(FIND_STRUCTURES, { filter: function(x) { return x.structureType == STRUCTURE_CONTAINER; }}).length > 0 ? 1 : 0;
            var desiredBuilders = room.find(FIND_CONSTRUCTION_SITES).length > 0 ? 1 : 0;
            var desiredUpgraders = (room.memory.desiredUpgraders) ? room.memory.desiredUpgraders : 2;
            if (desiredBuilders > 0) desiredUpgraders -= 1;
            var desiredRepairers = 1;
            var desiredWallBuilders = (desiredBuilders > 0) ? 0 : 1;
            var desiredMiners = room.find(FIND_STRUCTURES, { filter: function(x) { return x.structureType == STRUCTURE_EXTRACTOR; }}).length;
         
            var harvesters = _.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester' || creep.memory.role == 'transporter') && creep.memory.assignedRoom == room.name);
            if (harvesters.length < desiredHarvesters + desiredTransporters) {
                autoSpawn('harvester', desiredHarvesters, roomController, roleHarvester);
                autoSpawn('transporter', desiredTransporters, roomController, roleTransporter);
            }
            else if (roomController.state == 'healthy') {
                autoSpawn('builder', desiredBuilders, roomController, roleBuilder);
                autoSpawn('upgrader', desiredUpgraders, roomController, roleUpgrader);
                autoSpawn('repairer', desiredRepairers, roomController, roleRepairer);
                autoSpawn('wallBuilder', desiredWallBuilders, roomController, roleWallBuilder);
                autoSpawn('miner', desiredMiners, roomController, roleMiner);
            }
            else if (roomController.state == 'under-attack') {
                autoSpawn('melee', 25, roomController, roleMelee);
            }
            if (room.memory.attackTarget) {
                //console.log('fit');
                //autoSpawn('melee', 3, roomController, roleMelee);
                //autoSpawn('healer', 3, roomController, roleHealer);
                //autoSpawn('agitator', 0, roomController, roleAgitator);
            }
        }
        
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if(creep.memory.role == 'harvester') {
                roleHarvester.run(creep, room);
            }
            if(creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep, room);
            }
            if(creep.memory.role == 'builder') {
                roleBuilder.run(creep, room);
            }
            if(creep.memory.role == 'repairer') {
                roleRepairer.run(creep, room);
            }
            if(creep.memory.role == 'wallBuilder') {
                roleWallBuilder.run(creep, room);
            }
            if(creep.memory.role == 'transporter') {
                roleTransporter.run(creep, room);
            }
            if(creep.memory.role == 'miner') {
                roleMiner.run(creep, room);
            }
            if(creep.memory.role == 'scout') {
                roleScout.run(creep, room);
            }
            if(creep.memory.role == 'melee') {
                roleMelee.run(creep, room);
            }
            if(creep.memory.role == 'healer') {
                roleHealer.run(creep, room);
            }
            if(creep.memory.role == 'agitator') {
                roleAgitator.run(creep, room);
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
        if (Game.time % 10 == 0) {
            initRoomMemory(room);
        }
        if (Game.time % 2000 == 1) {
            //if (room.terminal) sellMinerals(room);
        }
    }
}

function autoSpawn(role, quantity, roomController, creepRole) {
    var room = roomController.room;
    var spawnedCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role && (creep.memory.assignedRoom == room.name || creep.memory.homeRoom == room.name));
    var spawn = Game.spawns[room.memory.spawnName];

    var spawnEnergy = (roomController.state === 'unhealthy') ? room.energyAvailable : room.energyCapacityAvailable * .8;

    if (spawnedCreeps.length < quantity) {
        var newName = creepRole.spawn(spawn, spawnEnergy);
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
    if (!room.memory.sources) {
        room.memory.sources = {};
        var sources = room.find(FIND_SOURCES);
        for (i = 0; i < sources.length; i++) {
            var source = sources[i];
            room.memory.sources[source.id] = {};
        }
    }
    var sources = Object.keys(room.memory.sources)
    for (i = 0; i < sources.length; i++) {
        var key = sources[i];
        var source = Game.getObjectById(key);
        var spawn = source.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: function(x) { return x.structureType == STRUCTURE_SPAWN; }
        });
        if (spawn) room.memory.sources[source.id].nearestSpawn = spawn.name;
    }
    if (!room.memory.stats) {
        room.memory.stats = {};
        room.memory.stats.builder = [];
        room.memory.stats.harvester = [];
        room.memory.stats.miner = [];
        room.memory.stats.repairer = [];
        room.memory.stats.transporter = [];
        room.memory.stats.upgrader = [];
        room.memory.stats.wallBuilder = [];
    }
}
