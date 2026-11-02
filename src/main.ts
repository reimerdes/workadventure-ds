import {bootstrapExtra} from '@workadventure/scripting-api-extra';

import {Actions} from './actions.js';
import {Holidays} from './holidays.js';
import {Night} from './night.js';

WA.onInit()
    .then(() => {
      const userTag = WA.player.tags;
      console.log('Meine WorkAdventure-Tags:', userTag);

      if (!WA.player.isLogged) {
        WA.ui.banner.openBanner({
          id: 'guest-access-info',
          text:
              'Du bist aktuell nicht eingeloggt. Bestimmte Bereiche sind nur für Mitglieder zugänglich.',
          bgColor: '#fa091e',
          textColor: '#ffe2d8',
          closable: false,
        });
      }

      if (userTag.includes('member')) {
        Actions.registerActions();
        // WA.player.setOutlineColor(68, 153, 169);
        // Eventuell hat das setzen der Outline-Farbe Performanceauswirkungen
        // ... Warum auch immer?!
      }
      Holidays.init();
      Night.init();

      // Subscriptions sammeln (optional, aber sauberer)
      WA.room.area.onEnter('gewaechshausArea').subscribe(() => {
        WA.room.hideLayer('Gewaechshaus');
      });

      WA.room.area.onLeave('gewaechshausArea').subscribe(() => {
        WA.room.showLayer('Gewaechshaus');
      });

      // The line below bootstraps the Scripting API Extra library that adds a
      // number of advanced properties/features to WorkAdventure
      bootstrapExtra()
          .then(() => {
            console.log('Scripting API Extra ready');
          })
          .catch(e => console.error(e));
    })
    .catch(e => console.error(e));
