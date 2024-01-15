import {parseCronExpression} from 'cron-schedule'
import {TimerBasedCronScheduler as timerScheduler} from 'cron-schedule/schedulers/timer-based.js'
import {getTimes, GetTimesResult} from 'suncalc'

var nightLayers = [
  'night100', 'night66', 'night33', 'nightAboveFurniture', 'nightBelowFurniture'
]

declare global {
  interface Date {
    isBetween(start: Date, end: Date): boolean;
  }
}
Date.prototype.isBetween = function(start: Date, end: Date): boolean {
  return this >= start && this < end;
};

declare global {
  interface Number {
    isBetween(min: number, max: number): boolean;
  }
}
Number.prototype.isBetween = function(
    this: number, min: number, max: number): boolean {
  return this >= min && this <= max;
};

// Globale Variablen für Startzeiten von Tag und Nacht
var sunTimes: GetTimesResult;
var startDay: Date;
var startNight: Date;

async function showNightLayers() {
  const opacity = calculateOpacityBasedOnSunPhase();
  if (opacity === 0) {
    nightLayers.forEach(element => {
      WA.room.hideLayer(element);
    });
    return;
  }

  // Alle Layer anzeigen
  nightLayers.forEach(element => {
    WA.room.showLayer(element);
  });

  if (opacity > 0.66) { // 100% Nacht
    WA.room.hideLayer('night66');
    WA.room.hideLayer('night33');
  } else if (opacity.isBetween(0.33, 0.66)) { // 66% Nacht
    WA.room.hideLayer('night100');
    WA.room.hideLayer('night33');
  } else if (opacity.isBetween(0.01, 0.33)) { // 33% Nacht
    WA.room.hideLayer('night100');
    WA.room.hideLayer('night66');
  } else if (opacity < 0.01) { // 0% Nacht
    WA.room.hideLayer('night100');
    WA.room.hideLayer('night66');
    WA.room.hideLayer('night33');
    WA.room.hideLayer('nightAboveFurniture');
  }
}

function calculateOpacityBasedOnSunPhase(): number {
  const now = new Date();
  let opacity = 1;

  // Überprüfen, ob die aktuelle Zeit zwischen dawn und sunriseEnd liegt
  if (now.isBetween(sunTimes.dawn, sunTimes.sunriseEnd)) {
    // Deckkraft von 1 auf 0 reduzieren
    opacity = 1 -
        (now.getTime() - sunTimes.dawn.getTime()) /
            (sunTimes.sunriseEnd.getTime() - sunTimes.dawn.getTime());
  }
  // Überprüfen, ob die aktuelle Zeit zwischen sunsetStart und dusk liegt
  else if (now.isBetween(sunTimes.sunsetStart, sunTimes.dusk)) {
    // Deckkraft von 0 auf 1 erhöhen
    opacity = (now.getTime() - sunTimes.sunsetStart.getTime()) /
        (sunTimes.dusk.getTime() - sunTimes.sunsetStart.getTime());
  } else if (now.isBetween(startDay, startNight)) {
    opacity = 0;
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

function startScheduler() {
  const cronNight = parseCronExpression('0 * * * * *');
  timerScheduler.setInterval(cronNight, () => {
    showNightLayers();
  }, {errorHandler: (err) => console.log(err)});
}

export class Night {
  static init() {
    calculateDayAndNight();
    showNightLayers();
    startScheduler();
  }
}