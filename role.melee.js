var roleMelee = {

    run: function(creep, room) {
        if (creep.moveToAssignedRoom()) return; 

        var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: function(x) { return x.structureType === STRUCTURE_TOWER }
        });
        if(!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: function(x) { return x.structureType === STRUCTURE_SPAWN }
        });
        if (target) {
            creep.attack(target);
            creep.moveTo(target);
        }
        else {
            var flag = creep.pos.findClosestByRange(FIND_FLAGS);
            if (flag) {
                creep.moveTo(flag);    
            }
        }
	},
    spawn: function(spawn, energyAvailable) {
        var components = this.getComponents(energyAvailable);
        return spawn.createCreep(components, undefined, {
            'role': 'melee'
            , 'assignedRoom': spawn.room.name
        });
    },
    getComponents: function(energyAvailable) {
        if (energyAvailable >= 450) {
            return [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK];
        }
        else if (energyAvailable >= 300) {
            return [TOUGH,TOUGH,TOUGH,TOUGH,MOVE,ATTACK,MOVE,ATTACK];
        }
        else if (energyAvailable >= 150) {
            return [TOUGH,TOUGH,MOVE,ATTACK];
        }
    }
};

module.exports = roleMelee;
