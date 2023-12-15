/// <reference types="@workadventure/iframe-api-typings" />

import { Popup } from "@workadventure/iframe-api-typings";

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

let popupPrivateOffice: Popup|null;
let mapOverviewAction: any;
let isDoorOpen = false;

(async () => {
    await WA.onInit();
    await WA.players.configureTracking({
      players: true,
      movement: false,
    });
    await WA.player.getPosition();
})();

function getRandomInt(min: number, max: number): number {
    return Math.ceil(Math.random() * (max - min + 1)) + min;
}

// Waiting for the API to be ready
WA.onInit().then(() => {
    const userTag = WA.player.tags;

    // If user is admin, name it with a dark blue border
    if(userTag.includes("admin")) {
        WA.player.setOutlineColor(27, 42, 65);
    }
    
    WA.room.onLeaveLayer("start").subscribe(() => {
        WA.ui.modal.closeModal();
    });


    WA.ui.actionBar.addButton({
        id: 'pause-btn',
        // @ts-ignore
        type: 'action',
        imageSrc: 'https://github.com/othaldo/workadventure-ds/blob/master/src/assets/ds/pause.png?raw=true',
        toolTip: 'Move to Pause Area',
        callback: () => {
            let xStart = 55;
            let xEnd = 63;

            let yStart = 23;
            let yEnd = 28;

            let cellSize = 32;

            WA.player.moveTo(getRandomInt(xStart * cellSize, xEnd * cellSize), getRandomInt(yStart * cellSize, yEnd * cellSize), 8);
        }
    });

    WA.ui.actionBar.addButton({
        id: 'map-btn',
        // @ts-ignore
        type: 'action',
        imageSrc: 'https://hugoaverty.github.io/map-overview/img/map.svg',
        toolTip: 'Map overview',
        callback: () => {
            if(isDoorOpen){
                WA.ui.modal.closeModal();
                isDoorOpen = false;
                return;
            }
            openMapOverview();
            isDoorOpen = true;
        }
    });

    // Open & Close popupPrivateOffice
    WA.room.area.onEnter("popupPrivateOffice_area").subscribe(() => {
        if(popupPrivateOffice) return;
        popupPrivateOffice = WA.ui.openPopup("popupPrivateOffice", "Our private office serves as a restricted zone, exclusively accessible to our team members.", [{
            label: "Close",
            className: "primary",
            callback: () => {
                popupPrivateOffice?.close();
                popupPrivateOffice = null;
            }
        }]);
    });
    WA.room.area.onLeave("popupPrivateOffice_area").subscribe(() => {
        popupPrivateOffice?.close();
        popupPrivateOffice = null;
    })


    WA.room.area.onEnter("zone_map_overview").subscribe(() => {
        mapOverviewAction = WA.ui.displayActionMessage({
            message: "Press 'SPACE' to display map overview and move to a specific zone. \n \n You can acces to map overview directly on the bottom nav !",
            callback: () => {
                openMapOverview();
            }
        });
    });
    WA.room.area.onLeave("zone_map_overview").subscribe(() => {
        mapOverviewAction.remove();
        WA.ui.modal.closeModal();
    })

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
    }).catch(e => console.error(e));

}).catch(e => console.error(e));

const openMapOverview = async() => {
    WA.ui.modal.closeModal();
    const pos = await WA.player.getPosition();
    WA.ui.modal.openModal({
        // TODO fix map overview projet
        //src: "https://hugoaverty.github.io/map-overview/index.html?x="+pos.x+"&y="+pos.y+"",
        src: "https://othaldo.github.io/workadventure-ds/map.png?x="+pos.x+"&y="+pos.y,
        allow: "fullscreen",
        title: "Map Overview",
        allowApi: true,
        position: "center",
    });
}


export {};
