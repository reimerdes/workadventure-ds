import { bootstrapExtra } from '@workadventure/scripting-api-extra';
import { Holydays } from './holydays';
import { Actions } from './actions';

(async () => {
  await WA.onInit();
})();

// Waiting for the API to be ready
WA.onInit()
  .then(() => {
    const userTag = WA.player.tags;

    // If user is admin, name it with a dark blue border
    if (userTag.includes('admin')) {
      WA.player.setOutlineColor(27, 42, 65);
    }

    Actions.registerActions();
    Holydays.init();

    // The line below bootstraps the Scripting API Extra library that adds a
    // number of advanced properties/features to WorkAdventure
    bootstrapExtra()
      .then(() => {
        console.log('Scripting API Extra ready');
      })
      .catch(e => console.error(e));
  })
  .catch(e => console.error(e));