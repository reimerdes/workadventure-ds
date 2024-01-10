import { parseCronExpression } from "cron-schedule"
import { TimerBasedCronScheduler as scheduler } from "cron-schedule/schedulers/timer-based.js";

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

function startScheduler() {
    const cronStartNight = parseCronExpression('0 17 * * *');
    scheduler.setInterval(cronStartNight, () => {
        showNightLayers();
    });
    
    const cronStartDay = parseCronExpression('0 8 * * *');
    scheduler.setInterval(cronStartDay, () => {
        hideNightLayers();
    });
}

export class Night {
    static init() {
        const now = new Date();
        const startNight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0);
        const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
        if (now > startNight || now < startDay) {
            showNightLayers();
        }

        startScheduler();
    }
}