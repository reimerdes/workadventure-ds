import { parseCronExpression } from "cron-schedule"
import { TimerBasedCronScheduler as timerScheduler } from 'cron-schedule/schedulers/timer-based.js'

var nightLayers = ["night", "nightAboveFurniture", "nightBelowFurniture"]

function showNightLayers() {
    nightLayers.forEach(element => {
        WA.room.showLayer(element);
    });
}

function hideNightLayers() {
    nightLayers.forEach(element => {
        WA.room.hideLayer(element);
    });
}

function showLayer(){
    const now = new Date();
    const startNight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0);
    const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    if (now > startDay && now < startNight) {
        console.log("start day");
        hideNightLayers();
    } else {
        console.log("start night");
        showNightLayers();
    }
}

function startScheduler() {
    const cronStartNight = parseCronExpression('* 1 * * * *');
    timerScheduler.setInterval(cronStartNight, () => {
        showLayer();
    }, { errorHandler: (err) => console.log(err) });

}

export class Night {
    static init() {
        showLayer();
        startScheduler();
    }
}