import { Area } from "@workadventure/iframe-api-typings";
import { bootstrapExtra } from "@workadventure/scripting-api-extra";

(async () => {
    await WA.onInit();
})();

let tileSize = 32;

interface Position {
    x: number | undefined;
    y: number | undefined;
}

let lastPositionBreak: Position = {x: undefined, y: undefined};
let lastPositionCall: Position = {x: undefined, y: undefined};

function getRandomInt(min: number, max: number): number {
    return Math.ceil(Math.random() * (max - min + 1)) + min;
}

function getDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// show or hide a specific layer depending on a date range without considering the year
function showOrHideLayer(layerName: string, startDate: Date, endDate: Date) {
    let today = new Date();

    if(today >= startDate && today <= endDate) {
        WA.room.showLayer(layerName);
    } else {
        WA.room.hideLayer(layerName);
    }
}

function showOrHideChristmasLayer() {
    let today = new Date();

    // December 1st (current year) to January 6th (next year)
    let startDate = new Date(today.getFullYear(), 11, 1);
    let endDate = new Date(today.getFullYear() + 1, 0, 6);

    showOrHideLayer("Christmas", startDate, endDate);
}

function clearLastPositions() {
    lastPositionBreak.x = undefined;
    lastPositionBreak.y = undefined;
    lastPositionCall.x = undefined;
    lastPositionCall.y = undefined;
}

// Waiting for the API to be ready
WA.onInit().then(() => {
    const userTag = WA.player.tags;

    // If user is admin, name it with a dark blue border
    if(userTag.includes("admin")) {
        WA.player.setOutlineColor(27, 42, 65);
    }

    WA.ui.actionBar.addButton({
        id: 'pause-btn',
        // @ts-ignore
        type: 'action',
        imageSrc: 'https://github.com/othaldo/workadventure-ds/blob/master/src/assets/ds/pause.png?raw=true',
        toolTip: 'Teleport to pause area and back again',
        callback: async () => {
            let x;
            let y;
            if (lastPositionBreak.x === undefined || lastPositionBreak.y === undefined) {
                const area = await WA.room.area.get("pauseArea");
                let xStart = area.x;
                let xEnd = area.x + area.width - (tileSize / 2);

                let yStart = area.y;
                let yEnd = area.y + area.height - (tileSize / 2);

                x = getRandomInt(xStart , xEnd);
                y = getRandomInt(yStart , yEnd);
                lastPositionBreak.x = (await WA.player.getPosition()).x;
                lastPositionBreak.y = (await WA.player.getPosition()).y;
            } else {
                x = lastPositionBreak.x;
                y = lastPositionBreak.y;
                lastPositionBreak.x = undefined;
                lastPositionBreak.y = undefined;
            }

            WA.player.teleport(x,y);
        }
    });

    WA.ui.actionBar.addButton({
        id: 'customer-call-btn',
        // @ts-ignore
        type: 'action',
        imageSrc: 'https://github.com/othaldo/workadventure-ds/blob/master/src/assets/ds/call.png?raw=true',
        toolTip: 'Teleport to call area and back again',
        callback: async () => {
            let x;
            let y;
            if (lastPositionCall.x === undefined || lastPositionCall.y === undefined) {
                const customerCallArea1 = await WA.room.area.get("ccArea1");
                const customerCallArea2 = await WA.room.area.get("ccArea2");
                const position = await WA.player.getPosition();

                // Berechne die Mittelpunkte der Areas
                const midPointArea1 = { x: customerCallArea1.x + customerCallArea1.width / 2, y: customerCallArea1.y + customerCallArea1.height / 2 };
                const midPointArea2 = { x: customerCallArea2.x + customerCallArea2.width / 2, y: customerCallArea2.y + customerCallArea2.height / 2 };

                // Berechne die Distanzen zur aktuellen Position
                const distanceToArea1 = getDistance(position.x, position.y, midPointArea1.x, midPointArea1.y);
                const distanceToArea2 = getDistance(position.x, position.y, midPointArea2.x, midPointArea2.y);

                // Bestimme die nächstgelegene Area
                const nearestArea = distanceToArea1 < distanceToArea2 ? customerCallArea1 : customerCallArea2;

                // Berechne zufällige Position innerhalb der nächstgelegenen Area
                let xStart = nearestArea.x;
                let xEnd = nearestArea.x + nearestArea.width - (tileSize / 2);
                let yStart = nearestArea.y;
                let yEnd = nearestArea.y + nearestArea.height - (tileSize / 2);

                x = getRandomInt(xStart , xEnd);
                y = getRandomInt(yStart , yEnd);
                lastPositionCall.x = (await WA.player.getPosition()).x;
                lastPositionCall.y = (await WA.player.getPosition()).y;
            } else {
                x = lastPositionCall.x;
                y = lastPositionCall.y;
                lastPositionCall.x = undefined;
                lastPositionCall.y = undefined;
            }

            WA.player.teleport(x,y);
        }
    });

    WA.room.area.onLeave("pauseArea").subscribe(() => {
        clearLastPositions()
    });

    WA.room.area.onLeave("ccArea1").subscribe(() => {
        clearLastPositions()
    });

    WA.room.area.onLeave("ccArea2").subscribe(() => {
        clearLastPositions()
    });


    showOrHideChristmasLayer();

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
    }).catch(e => console.error(e));

}).catch(e => console.error(e));

export {};
