import { bootstrapExtra } from "@workadventure/scripting-api-extra";

(async () => {
    await WA.onInit();
})();

function getRandomInt(min: number, max: number): number {
    return Math.ceil(Math.random() * (max - min + 1)) + min;
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
        toolTip: 'Move to Pause Area',
        callback: async () => {
            const area = await WA.room.area.get("pauseArea");
            let xStart = area.x;
            let xEnd = area.x + area.width;

            let yStart = area.y;
            let yEnd = area.y + area.height;

            WA.player.moveTo(getRandomInt(xStart , xEnd), getRandomInt(yStart , yEnd), 16);
        }
    });

    showOrHideChristmasLayer();

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
    }).catch(e => console.error(e));

}).catch(e => console.error(e));

export {};
