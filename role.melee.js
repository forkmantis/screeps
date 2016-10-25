var roleMelee = {

    run: function(creep, room) {
        if (creep.moveToAssignedRoom()) return; 

        var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: function(x) { return x.structureType === STRUCTURE_TOWER }
        });
        if(!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: function(x) { return x.structureType === STRUCTURE_SPAWN }
        });
        if(!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
            creep.attack(target);
            creep.moveTo(target);
        }
        else {
            var flag = creep.pos.findClosestByRange(FIND_FLAGS, { filter: function(x) { return x.name === 'Attack'; }});
            if (flag) {
                creep.moveTo(flag);    
            }
        }
	},
    spawn: function(spawn, energyAvailable) {
        var components = this.getComponents(energyAvailable);
        var attackTarget = (spawn.room.memory.attackTarget) ? spawn.room.memory.attackTarget : spawn.room.name;
        return spawn.createCreep(components, undefined, {
            'role': 'melee'
            , 'assignedRoom': attackTarget
            , 'homeRoom': spawn.room.name
        });
    },
    getComponents: function(energyAvailable) {
        if (energyAvailable >= 690) {
            return [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,MOVE];
        }
        if (energyAvailable >= 630) {
            return [TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,MOVE];
        }
        if (energyAvailable >= 570) {
            return [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,MOVE];
        }
        else if (energyAvailable >= 410) {
            return [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,ATTACK,ATTACK,MOVE];
        }
        else if (energyAvailable >= 150) {
            return [TOUGH,TOUGH,MOVE,ATTACK,MOVE,MOVE];
        }
        else if (energyAvailable >= 50) {
            return [MOVE];
        }
    }
};

module.exports = roleMelee;
