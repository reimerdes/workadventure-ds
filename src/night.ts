import {parseCronExpression} from 'cron-schedule'
import {TimerBasedCronScheduler as timerScheduler} from 'cron-schedule/schedulers/timer-based.js'
import {getTimes, GetTimesResult} from 'suncalc'

var nightLayers = [
  'night100', 'night66', 'night33', 'nightAboveFurniture', 'nightBelowFurniture'
]

interface LayerStates {
  [key: string]: boolean;
}

var currentLayerStates: LayerStates = {
  night100: false,
  night66: false,
  night33: false,
  nightAboveFurniture: true,
  nightBelowFurniture: true
};

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
  return this >= min && this < max;
};

// Globale Variablen für Startzeiten von Tag und Nacht
var sunTimes: GetTimesResult;
var startDay: Date;
var startNight: Date;

function setLayerVisibility(layerName: string, isVisible: boolean) {
  // Überprüfen, ob der Zustand geändert werden muss
  if (currentLayerStates[layerName] !== isVisible) {
    if (isVisible) {
      WA.room.showLayer(layerName);
    } else {
      WA.room.hideLayer(layerName);
    }
    // Aktualisieren des Zustands
    currentLayerStates[layerName] = isVisible;
  }
}

async function showNightLayers() {
  const opacity = calculateOpacityBasedOnSunPhase();

  if (opacity < 0.01) {
    nightLayers.forEach(element => {
      setLayerVisibility(element, false);
    });
    return;
  }
  
  setLayerVisibility('nightAboveFurniture', true);
  setLayerVisibility('nightBelowFurniture', true);
  setLayerVisibility('night100', opacity > 0.66);
  setLayerVisibility('night66', opacity.isBetween(0.33, 0.66));
  setLayerVisibility('night33', opacity.isBetween(0.01, 0.33));
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