import { parseCronExpression } from "cron-schedule"
import { TimerBasedCronScheduler as timerScheduler } from 'cron-schedule/schedulers/timer-based.js'
import { getTimes } from 'suncalc'

var nightLayers = ["night", "nightAboveFurniture", "nightBelowFurniture"]

// Globale Variablen für Startzeiten von Tag und Nacht
var startDay: Date;
var startNight: Date;

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

function calculateDayAndNight() {
    const now = new Date();
    const sunTimes = getTimes(now, 54.58469000, 10.01785000);

    startDay = sunTimes.sunrise;
    startNight = sunTimes.sunset;

    console.log('Sonnenaufgang:', startDay);
    console.log('Sonnenuntergang:', startNight);
}

function showLayer(){
    const now = new Date();
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
        calculateDayAndNight();
        showLayer();
        startScheduler();
    }
}