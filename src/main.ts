import { Area } from '@workadventure/iframe-api-typings/front/Api/Iframe/Area/Area';
import { bootstrapExtra } from '@workadventure/scripting-api-extra';

(async () => {
  await WA.onInit();
})();

const tileSize = 32;

enum PositionType {
  LastPositionBreak,
  LastPositionCall,
}

interface Position {
  x: number | undefined;
  y: number | undefined;
}

const positions: Record<PositionType, Position> = {
  [PositionType.LastPositionBreak]: { x: undefined, y: undefined },
  [PositionType.LastPositionCall]: { x: undefined, y: undefined },
};

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// show or hide a specific layer depending on a date range without considering
// the year
function showOrHideLayer(layerName: string, startDate: Date, endDate: Date) {
  let today = new Date();

  if (today >= startDate && today <= endDate) {
    WA.room.showLayer(layerName);
  } else {
    WA.room.hideLayer(layerName);
  }
}

function clearLastPositions() {
  for (let position of Object.values(positions)) {
    position.x = undefined;
    position.y = undefined;
  }
}

function showOrHideChristmasLayer() {
  const today = new Date();

  // December 1st (current year) to January 6th (next year)
  const startDate = new Date(today.getFullYear(), 11, 1);
  const endDate = new Date(today.getFullYear() + 1, 0, 6);

  showOrHideLayer('Christmas', startDate, endDate);
}

async function teleportPlayerToArea(area: Area | undefined, positionType: PositionType) {
  let x = positions[positionType].x;
  let y = positions[positionType].y;

  if (area !== undefined) {
    const xStart = area.x;
    const xEnd = area.x + area.width - (tileSize / 2);

    const yStart = area.y;
    const yEnd = area.y + area.height - (tileSize / 2);

    x = getRandomInt(xStart, xEnd);
    y = getRandomInt(yStart, yEnd);

    const position = await WA.player.getPosition();
    if (position) {
      Object.assign(positions[positionType], position);
    }
  } else {
    Object.assign(positions[positionType], { x: undefined, y: undefined });
  }

  if (x !== undefined && y !== undefined) {
    WA.player.teleport(x, y);
  }

  removeButtons();
  addActionButtons();
}

function addTeleportButton(id: string, imageSrc: string, toolTip: string, positionType: PositionType, getArea: () => Promise<Area | undefined>) {
  WA.ui.actionBar.addButton({
    id,
    type: 'action',
    imageSrc,
    toolTip,
    callback: async () => {
      const position = positions[positionType];
      let area;

      if (position.x === undefined || position.y === undefined) {
        area = await getArea();
      }

      teleportPlayerToArea(area, positionType);
    }
  });
}

function addPauseButton() {
  addTeleportButton('pause-btn',
    'https://github.com/othaldo/workadventure-ds/blob/master/src/assets/ds/pause.png?raw=true',
    'Zum Pausenbereich teleportieren und zurück',
    PositionType.LastPositionBreak,
    async () => await WA.room.area.get("pauseArea"));
}

function addCustomerCallButton() {
  addTeleportButton('customer-call-btn',
    'https://github.com/othaldo/workadventure-ds/blob/master/src/assets/ds/call.png?raw=true',
    'Zum \'Im Gespräch\'-Bereich teleportieren und zurück',
    PositionType.LastPositionCall,
    async () => {
      const customerCallArea1 = await WA.room.area.get('ccArea1');
      const customerCallArea2 = await WA.room.area.get('ccArea2');
      const position = await WA.player.getPosition();

      // Berechne die Mittelpunkte der Areas
      const midPointArea1 = {
        x: customerCallArea1.x + customerCallArea1.width / 2,
        y: customerCallArea1.y + customerCallArea1.height / 2
      };
      const midPointArea2 = {
        x: customerCallArea2.x + customerCallArea2.width / 2,
        y: customerCallArea2.y + customerCallArea2.height / 2
      };

      // Berechne die Distanzen zur aktuellen Position
      const distanceToArea1 =
        getDistance(position.x, position.y, midPointArea1.x, midPointArea1.y);
      const distanceToArea2 =
        getDistance(position.x, position.y, midPointArea2.x, midPointArea2.y);

      // Bestimme die nächstgelegene Area
      return distanceToArea1 < distanceToArea2 ?
        customerCallArea1 :
        customerCallArea2;
    });
}

function addActionButtons() {
  addPauseButton();
  addCustomerCallButton();
}

function removeButtons() {
  WA.ui.actionBar.removeButton('pause-btn');
  WA.ui.actionBar.removeButton('customer-call-btn');
}

function registerAreaOnLeaveHandler() {
  WA.room.area.onLeave('pauseArea').subscribe(() => {
    clearLastPositions();
  });
  WA.room.area.onLeave('ccArea1').subscribe(() => {
    clearLastPositions();
  });
  WA.room.area.onLeave('ccArea2').subscribe(() => {
    clearLastPositions();
  });
}

// Waiting for the API to be ready
WA.onInit()
  .then(() => {
    const userTag = WA.player.tags;

    // If user is admin, name it with a dark blue border
    if (userTag.includes('admin')) {
      WA.player.setOutlineColor(27, 42, 65);
    }

    addActionButtons();
    showOrHideChristmasLayer();
    registerAreaOnLeaveHandler();

    // The line below bootstraps the Scripting API Extra library that adds a
    // number of advanced properties/features to WorkAdventure
    bootstrapExtra()
      .then(() => {
        console.log('Scripting API Extra ready');
      })
      .catch(e => console.error(e));
  })
  .catch(e => console.error(e));

export { };
