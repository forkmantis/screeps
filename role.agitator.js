var roleAgitator = {

    run: function(creep, room) {
        if (creep.hits < creep.hitsMax) {
            //console.log('Agitator coming home for healing');
            if (creep.moveToAssignedRoom()) return;
            var flag = creep.pos.findClosestByRange(FIND_FLAGS);
            if (flag) {
                creep.moveTo(flag);    
            }
        }
        else if (creep.hits == creep.hitsMax) {
            //console.log('Agitator moved towards ' + creep.memory.targetRoom);
            if(creep.memory.targetRoom != creep.room.name) {
                var exitDir = Game.map.findExit(creep.room.name, creep.memory.targetRoom);
                var exit = creep.pos.findClosestByRange(exitDir);
                creep.moveTo(exit);
            }
        }
	},
    spawn: function(spawn, energyAvailable) {
        var components = this.getComponents(energyAvailable);
        return spawn.createCreep(components, undefined, {
            'role': 'agitator'
            , 'assignedRoom': 'E63S68'
            , 'targetRoom': 'E63S69'
            , 'homeRoom': spawn.room.name
        });
    },
    getComponents: function(energyAvailable) {
        return [TOUGH,TOUGH,MOVE,MOVE];
    }
};

module.exports = roleAgitator;
