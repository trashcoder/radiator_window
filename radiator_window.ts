namespace Fenstererkennung {
type Room = {
    "radiator":string|null;
    "contact":string|null;
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

const ShellyRadiatorMode = {
    
}

const livingRoom:Room = {
    "radiator": 'zigbee.0.2c1165fffeb3dc7b.mode', // Hama Radiator 
    "contact": 'zigbee.0.00124b002fbdc865.opened', //open or close
    "name": "Wohnzimmer",
} ;

const sleepingRoom:Room = {
    "radiator": null,
    "contact": null,
    "name":"Schlafzimmer",
};

const kitchen:Room = {
    "radiator": 'zigbee.0.cc86ecfffec8882f.mode',
    "contact":  'zigbee.0.00124b002fbdabcb.opened',/*Is open*/
    "name": "Küche",
};

const childrensRoom:Room = {
    "radiator": 'zigbee.0.cc86ecfffec3b6cf.mode',
    "contact": 'zigbee.0.00124b002fbae5b2.opened'/*Is open*/,
    "name": "Kinderzimmer",
};

const bath:Room = {
    "radiator": 'zigbee.0.cc86ecfffec3996b.mode',
    "contact": null,
    "name": "Bdezimmer",
} ;

const house:Room[] = [childrensRoom, kitchen, livingRoom, sleepingRoom, bath];

const northGroup:Room[] = [
    childrensRoom,
    sleepingRoom,
    bath
];
const southGroup:Room[] = [
    livingRoom,
    kitchen
];

const checkIsWindowOpen = (room : Room):boolean => {
    if (room.contact == null) return false;
    if (getState(room.contact).val) {
        return true;
    } else {
        return false;
    }
}

const deactivateAllRadiators = (rooms:Room[]) => {
    for (const room of rooms) {
        if (room.radiator == null) continue;
        deactivateRadiator(room);
    }
}

const activateAllRadiators = (rooms:Room[]) => {
    for (const room of rooms) {
        if (room.radiator == null) continue;
        activateRadiator(room);
    }
}

const deactivateRadiator = (room:Room) => {

    if (getState(room.radiator).val == HamaRadiatorMode.heat) {
        sendDiscordMessage("Thermostat in "+room.name+" abgeschaltet");
        sendNtfyMessage("Thermostat in "+room.name+" abgeschaltet");
        setState(room.radiator, HamaRadiatorMode.off);
    }
}

const activateRadiator = (room:Room) => {
    
    if (getState(room.radiator).val == HamaRadiatorMode.off) {
        sendDiscordMessage("Thermostat in "+room.name+" eingeschaltet");
        sendNtfyMessage("Thermostat in "+room.name+" eingeschaltet");
        setState(room.radiator, HamaRadiatorMode.heat);
    }
}

const checkGroup = (group:Room[]):boolean => {
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
const sendNtfyMessage = (message:string) => {
    const ntfyAdapter = 'ntfy.0';
    const ntfySubscription = 'iobroker';
    const ntfyTitle = 'Heizung';

    const data = {
    "instance": ntfyAdapter,
    "topic": ntfySubscription,
    "title": ntfyTitle,
    "message": message,
    "priority": 5,
    "tags": null,
    "attachment": null,
    "clickURL": null,
    "actionButton": null,
    "delay": null
    }
    try {
        sendTo(ntfyAdapter, "send", data, (value) => {
            console.log(value);
        });
    } catch (error) {
        console.error("Error: "+error);
    }
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
/*
on ({id: sleepingRoom.contact}, (obj) =>{
    checkAllWindows();
});*/
}
