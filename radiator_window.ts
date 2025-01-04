type GroupType = {
    "radiator":string;
    "contact":string;
};

const HamaRadiatorMode = {
    heat: "heat",
    off: "off"
}

const livingRoom:GroupType = {
    "radiator": 'zigbee.0.2c1165fffeb3dc7b.mode', // Hama Radiator 
    "contact": 'zigbee.0.00124b002fbdc865.opened', //open or close
} ;

const sleepingRoom:GroupType = {
    "radiator": "2",
    "contact": '2',
};

const kitchen:GroupType = {
    "radiator": "3",
    "contact": '3',
};

const childrensRoom:GroupType = {
    "radiator": "4",
    "contact": '4',
} ;

const toilet:GroupType = {
    "radiator": "5",
    "contact": '5',
} ;

const house:GroupType[] = [childrensRoom, kitchen, livingRoom, sleepingRoom, toilet];

const northGroup:GroupType[] = [
    childrensRoom,
    sleepingRoom,
    toilet
];
const southGroup:GroupType[] = [
    livingRoom,
    kitchen
];

const checkIsWindowOpen = (room : GroupType):boolean => {
    if (getState(room.contact).val) {
        return true;
    } else {
        return false;
    }
}

const deactivateAllRadiators = (rooms:GroupType[]) => {
    for (let room of rooms) {
        deactivateRadiator(room);
    }
}

const activateAllRadiators = (rooms:GroupType[]) => {
    for (let room of rooms) {
        activateRadiator(room);
    }
}

const deactivateRadiator = (room:GroupType) => {
    setState(room.radiator, HamaRadiatorMode.off);
}

const activateRadiator = (room:GroupType) => {
    setState(room.radiator, HamaRadiatorMode.heat);
}

const checkGroup = (group:GroupType[]):boolean => {
    let returnValue:boolean = false;

    for (let room of group) {
        if (checkIsWindowOpen(room)) {
            returnValue = true;
        }
    }
    return returnValue;
}


const checkAllWindows = () => {

    let northOpen = checkGroup(northGroup);
    let southOpen = checkGroup(southGroup);
    if (northOpen && southOpen) {
        deactivateAllRadiators(house);
        return;
    }
    if (!northOpen && !southOpen) {
        activateAllRadiators(house);
        return;
    }
    for (let room of house) {
        if (checkIsWindowOpen(room)) {
            deactivateRadiator(room);
        } else {
            activateRadiator(room);
        }
    }
    
}


on ({id: livingRoom.contact}, (obj) =>{
    checkAllWindows();
});

on ({id: childrensRoom.contact}, (obj) =>{
    checkAllWindows();
});
on ({id: kitchen.contact}, (obj) =>{
    checkAllWindows();
});

on ({id: sleepingRoom.contact}, (obj) =>{
    checkAllWindows();
});
