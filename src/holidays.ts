
// show or hide a specific layer depending on a date range without considering
// the year
function showOrHideLayer(layerName: string, startDate: Date, endDate: Date) {
  const today = new Date();

  if (today >= startDate && today <= endDate) {
    WA.room.showLayer(layerName);
  } else {
    WA.room.hideLayer(layerName);
  }
}

function showOrHideChristmasLayer() {
  const today = new Date();

  // Bestimmt, ob das heutige Datum im frühen Januar (bis einschließlich 6. Januar) liegt
  const isEarlyJanuary = today.getMonth() === 0 && today.getDate() <= 6;

  // Wenn wir uns im frühen Januar befinden, verwenden wir den 1. Dezember des Vorjahres,
  // da der Weihnachtszeitraum im Vorjahr begann.
  const startDate = new Date(today.getFullYear() - (isEarlyJanuary ? 1 : 0), 11, 1);

  // Das Enddatum ist der 6. Januar: des aktuellen Jahres, wenn wir im frühen Januar sind,
  // sonst des nächsten Jahres, da der Weihnachtszeitraum bis Anfang Januar reicht.
  const endDate = new Date(today.getFullYear() + (isEarlyJanuary ? 0 : 1), 0, 6);

  showOrHideLayer('Christmas', startDate, endDate);
}

function showOrHideEasterLayer() {
  const today = new Date();

  // Berechnen des Osterdatums für das aktuelle Jahr
  const easterDate = calculateEasterDate(today.getFullYear());

  // Das Startdatum ist Karfreitag, eine Woche vor dem Osterdatum
  let startDate = new Date(easterDate);
  startDate.setDate(easterDate.getDate() - 7);

  // Das Enddatum ist Ostermontag, eine Woche nach dem Osterdatum
  let endDate = new Date(easterDate);
  endDate.setDate(easterDate.getDate() + 7);

  showOrHideLayer('Easter', startDate, endDate);
}

function showOrHideHalloweenLayer() {
  const today = new Date();

  const halloweenDate = new Date(today.getFullYear(), 9, 31);

  let halloweenStart = new Date(halloweenDate);
  halloweenStart.setDate(halloweenDate.getDate() - 10);

  let halloweenEnd = new Date(halloweenDate);
  halloweenEnd.setDate(halloweenDate.getDate() + 3);

  console.log("Halloween start: " + halloweenStart);
  console.log("Halloween end: " + halloweenEnd);

  showOrHideLayer('Halloween', halloweenStart, halloweenEnd);
}

function calculateEasterDate(year: number): Date {
  // Goldene Zahl - Zyklus des Mondes
  const goldenNumber = year % 19;

  // Berechnung bezogen auf das Jahrhundert
  const century = Math.floor(year / 100);
  const yearsInCentury = year % 100;

  // Schaltjahr-Korrektur
  const leapYearCorrection = Math.floor(century / 4);
  const centuryRemainder = century % 4;

  // Mondphasen-Korrektur
  const moonCorrection = Math.floor((century + 8) / 25);
  const moonCorrection2 = Math.floor((century - moonCorrection + 1) / 3);

  // Bestimmung des Vollmonds
  const fullMoon = (19 * goldenNumber + century - leapYearCorrection - moonCorrection2 + 15) % 30;

  // Bestimmung des Sonntags
  const tempResult = Math.floor(yearsInCentury / 4);
  const tempResultRemainder = yearsInCentury % 4;
  const sunday = (32 + 2 * centuryRemainder + 2 * tempResult - fullMoon - tempResultRemainder) % 7;

  // Korrektur für das Ende des Monats
  const endOfMonthCorrection = Math.floor((goldenNumber + 11 * fullMoon + 22 * sunday) / 451);

  // Bestimmung des Monats und Tages für Ostern
  const month = Math.floor((fullMoon + sunday - 7 * endOfMonthCorrection + 114) / 31);
  const day = ((fullMoon + sunday - 7 * endOfMonthCorrection + 114) % 31) + 1;

  // Erstellung des Datums für Ostern
  return new Date(year, month - 1, day); // Monate in JavaScript beginnen bei 0
}

export class Holidays {
  static init() {
    showOrHideChristmasLayer();
    showOrHideEasterLayer();
    showOrHideHalloweenLayer();
  }
}
