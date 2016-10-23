var util = require('util');

var roleDefender = {

    run: function(creep, room) {
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
            creep.attack(target);
            creep.moveTo(target);
        }
	},
    spawn: function(spawn) {
        var components = this.getComponents(spawn.room);
        return spawn.createCreep(components, undefined, {
            'role': 'defender'
            , 'assignedRoom': spawn.room.name
            , 'stats': {
                'output': 0
                , 'roundTrips': 0
                , 'timeToSpawn': components.length * 3
                , 'ticksToFirstAction': undefined
            }
        });
    },
    getComponents: function(room) {
        if (room.energyCapacityAvailable >= 300) {
            return [TOUGH,TOUGH,TOUGH,TOUGH,MOVE,ATTACK,MOVE,ATTACK];
        }
        else if (room.energyCapacityAvailable >= 150) {
            return [TOUGH,TOUGH,MOVE,ATTACK];
        }
    }
};

module.exports = roleDefender;
