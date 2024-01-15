import { parseCronExpression } from "cron-schedule"
import { TimerBasedCronScheduler as timerScheduler } from 'cron-schedule/schedulers/timer-based.js'
import { getTimes, GetTimesResult } from 'suncalc'

var nightLayers = ["night1", "night2", "night3", "nightAboveFurniture", "nightBelowFurniture"]

// Globale Variablen für Startzeiten von Tag und Nacht
var sunTimes: GetTimesResult;
var startDay: Date;
var startNight: Date;

async function showNightLayers() {
    nightLayers.forEach(element => {
        WA.room.showLayer(element);
    });
    const opacity = calculateOpacityBasedOnSunPhase();
    if(opacity < 0.66 && opacity >= 0.33) {
        WA.room.hideLayer("night1");
    } else if(opacity < 0.33 && opacity >= 0.05) {
        WA.room.hideLayer("night1");
        WA.room.hideLayer("night2");
    } else if(opacity < 0.05){
        WA.room.hideLayer("night1");
        WA.room.hideLayer("night2");
        WA.room.hideLayer("night3");
        WA.room.hideLayer("nightAboveFurniture");
    }
}

function hideNightLayers() {
    nightLayers.forEach(element => {
        WA.room.hideLayer(element);
    });
}

function calculateOpacityBasedOnSunPhase(): number {
    const now = new Date();
    let isTwilight = false;
    let opacity = 1;

    // Überprüfen, ob die aktuelle Zeit zwischen dawn und sunriseEnd liegt
    if (now >= sunTimes.dawn && now < sunTimes.sunriseEnd) {
        // Deckkraft von 1 auf 0 reduzieren
        opacity = 1 - (now.getTime() - sunTimes.dawn.getTime()) / (sunTimes.sunriseEnd.getTime() - sunTimes.dawn.getTime());
        console.log("Morgendämmerung: ", opacity);
        isTwilight = true;
    } 
    // Überprüfen, ob die aktuelle Zeit zwischen sunsetStart und dusk liegt
    else if (now >= sunTimes.sunsetStart && now < sunTimes.dusk) {
        // Deckkraft von 0 auf 1 erhöhen
        opacity = (now.getTime() - sunTimes.sunsetStart.getTime()) / (sunTimes.dusk.getTime() - sunTimes.sunsetStart.getTime());
        console.log("Abenddämmerung: ", opacity);
        isTwilight = true;
    }

    if (!isTwilight) {
        console.log("Nacht");
    }

    return opacity;
}


function calculateDayAndNight() {
    const now = new Date();
    sunTimes = getTimes(now, 54.58469000, 10.01785000);

    startDay = sunTimes.sunriseEnd;
    startNight = sunTimes.sunsetStart;

    console.log('Sonnenaufgang:', startDay);
    console.log('Sonnenuntergang:', startNight);
}

function showLayer(){
    const now = new Date();
    if (now > startDay && now < startNight) {
        hideNightLayers();
    } else {
        showNightLayers();
    }
}

function startScheduler() {
    const cronNight = parseCronExpression('0 * * * * *');
    timerScheduler.setInterval(cronNight, () => {
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