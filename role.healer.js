var roleHealer = {

    run: function(creep, room) {
        if (creep.moveToAssignedRoom()) return; 

        var healTarget = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: function(x) {
                return x.memory.role == 'healer' && x.hits < x.hitsMax;
            }
        });
        if (!healTarget) healTarget = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: function(x) {
                return x.hits < x.hitsMax;
            }
        });
        if (!healTarget) healTarget = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: function(x) {
                return x.memory.role == 'melee';
            }
        });
        if (healTarget) {
            //console.log('Healer headed to heal ' + healTarget.name);
            if (creep.heal(healTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(healTarget);
            }
        }
        else {
            creep.moveTo(25,25);
        }
	},
    spawn: function(spawn, energyAvailable) {
        var components = this.getComponents(energyAvailable);
        return spawn.createCreep(components, undefined, {
            'role': 'healer'
            , 'assignedRoom': spawn.room.memory.attackTarget
            , 'homeRoom' : spawn.room.name
        });
    },
    getComponents: function(energyAvailable) {
        return [HEAL,HEAL,MOVE];
    }
};

module.exports = roleHealer;
