import { bootstrapExtra } from "@workadventure/scripting-api-extra";

(async () => {
    await WA.onInit();
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
    
    WA.ui.actionBar.addButton({
        id: 'pause-btn',
        // @ts-ignore
        type: 'action',
        imageSrc: 'https://github.com/othaldo/workadventure-ds/blob/master/src/assets/ds/pause.png?raw=true',
        toolTip: 'Move to Pause Area',
        callback: () => {
            let xStart = 37;
            let xEnd = 45;

            let yStart = 22;
            let yEnd = 27;

            let cellSize = 32;

            WA.player.moveTo(getRandomInt(xStart * cellSize, xEnd * cellSize), getRandomInt(yStart * cellSize, yEnd * cellSize), 16);
        }
    });


    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
    }).catch(e => console.error(e));

}).catch(e => console.error(e));

export {};
