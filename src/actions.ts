import { Area } from '@workadventure/iframe-api-typings/iframe_api.js';

const tileSize = 32;

// Ermittelt die Basis-URL aus der Bundle-URL (prod) bzw. src-URL (dev)
const BUNDLE_BASE = (() => {
  try {
    const u = (import.meta as any).url as string | undefined;
    if (!u) return '';
    return u.replace(/\/(assets|src)\/.*$/, '/');
  } catch {
    return '';
  }
})();

function assetUrl(path: string): string {
  return BUNDLE_BASE + path;
}

enum PositionType {
    LastPositionBreak,
    LastPositionCall,
    LastPositionPool,
}

interface Position {
    x: number | undefined;
    y: number | undefined;
}

const positions: Record<PositionType, Position> = {
    [PositionType.LastPositionBreak]: { x: undefined, y: undefined },
    [PositionType.LastPositionCall]: { x: undefined, y: undefined },
    [PositionType.LastPositionPool]: { x: undefined, y: undefined },
};

function clearLastPositions() {
    for (let position of Object.values(positions)) {
        position.x = undefined;
        position.y = undefined;
    }
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
    WA.room.area.onLeave('poolArea').subscribe(() => {
        clearLastPositions();
    });
}

function addTeleportButton(id: string, imageSrc: string, toolTip: string, positionType: PositionType, getArea: () => Promise<Area | undefined>) {
    WA.ui.actionBar.addButton({
        id,
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

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
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

function addPauseButton() {
    addTeleportButton('pause-btn',
        assetUrl('ds/pause.png'),
        'Zum Pausenbereich teleportieren und zurück',
        PositionType.LastPositionBreak,
        async () => await WA.room.area.get("pauseArea"));
}

function addCustomerCallButton() {
    addTeleportButton('customer-call-btn',
        assetUrl('ds/call.png'),
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

function addPoolButton() {
    addTeleportButton('pool-btn',
        assetUrl('ds/pool.png'),
        'Zum Pool-Bereich teleportieren und zurück',
        PositionType.LastPositionPool,
        async () => await WA.room.area.get('poolArea'));
}

function addActionButtons() {
    addPauseButton();
    addCustomerCallButton();
    addPoolButton();
}

function removeButtons() {
    WA.ui.actionBar.removeButton('pause-btn');
    WA.ui.actionBar.removeButton('customer-call-btn');
    WA.ui.actionBar.removeButton('pool-btn');
}

export class Actions {
    static registerActions() {
        addActionButtons();
        registerAreaOnLeaveHandler();
    }
}