
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

export class Holydays {
    static init() {
        showOrHideChristmasLayer();
    }
}
