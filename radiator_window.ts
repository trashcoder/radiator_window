namespace Fenstererkennung {
type GroupType = {
    "radiator":string;
    "contact":string;
    "name":string;
};

enum radiatorManufacturer {
    hama,
    shelly
}
enum contactManufacturer {
    sonoff
}

const HamaRadiatorMode = {
    heat: "heat",
    off: "off"
}

const livingRoom:GroupType = {
    "radiator": 'zigbee.0.2c1165fffeb3dc7b.mode', // Hama Radiator 
    "contact": 'zigbee.0.00124b002fbdc865.opened', //open or close
    "name": "Wohnzimmer",
} ;

const sleepingRoom:GroupType = {
    "radiator": "2",
    "contact": '2',
    "name":"Schlafzimmer",
};

const kitchen:GroupType = {
    "radiator": 'zigbee.0.cc86ecfffec8882f.mode',
    "contact": '3',
    "name": "Küche",
};

const childrensRoom:GroupType = {
    "radiator": 'zigbee.0.cc86ecfffec3b6cf.mode',
    "contact": 'zigbee.0.00124b002fbae5b2.opened'/*Is open*/,
    "name": "Kinderzimmer",
};

const toilet:GroupType = {
    "radiator": 'zigbee.0.cc86ecfffec3996b.mode',
    "contact": '5',
    "name": "Toilette",
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
    for (const room of rooms) {
        deactivateRadiator(room);
    }
}

const activateAllRadiators = (rooms:GroupType[]) => {
    for (const room of rooms) {
        activateRadiator(room);
    }
}

const deactivateRadiator = (room:GroupType) => {

    if (getState(room.radiator).val == HamaRadiatorMode.heat) {
        sendDiscordMessage("Thermostat in "+room.name+" abgeschaltet");
        setState(room.radiator, HamaRadiatorMode.off);
    }
}

const activateRadiator = (room:GroupType) => {
    
    if (getState(room.radiator).val == HamaRadiatorMode.off) {
        sendDiscordMessage("Thermostat in "+room.name+" eingeschaltet");
        setState(room.radiator, HamaRadiatorMode.heat);
    }
}

const checkGroup = (group:GroupType[]):boolean => {
    for (const room of group) {
        if (checkIsWindowOpen(room)) {
            return true;
        }
    }
    return false;
    
}

const sendDiscordMessage = (message:string) => {
    const discordAdapter = 'discord.0';
    const discordServerId = '';
    const discordChannelId = '';

   sendTo(discordAdapter, 'sendMessage', {serverId: discordServerId, channelId: discordChannelId, content: {content: message}});
    
}


const checkAllWindows = () => {



    const northOpen = checkGroup(northGroup);
    const southOpen = checkGroup(southGroup);
   
    if (northOpen && southOpen) {
       
        deactivateAllRadiators(house);
        return;
    }
    if (!northOpen && !southOpen) {
      
        activateAllRadiators(house);
        return;
    }
    for (const room of house) {
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
}
