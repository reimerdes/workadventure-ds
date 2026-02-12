import {bootstrapExtra} from '@workadventure/scripting-api-extra';

import {Actions} from './actions.js';
import {Holidays} from './holidays.js';
import {Night} from './night.js';

WA.onInit()
    .then(() => {
      const userTag = WA.player.tags;

      // If user is admin, name it with a dark blue border
      if (userTag.includes('admin')) {
        WA.player.setOutlineColor(250, 176, 0);
      }

      // log user tags to console
      console.log('User tags:', userTag);

      if (userTag.includes('member')) {
        Actions.registerActions();
        WA.player.setOutlineColor(68, 153, 169);
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
