import './registrations/actions';
import './registrations/options';
import './registrations/routes';
import './registrations/triggers';

import './twitch';

// interface UserData {
//     id: string | null;
//     token: string | null;
//     username: string | null;
// }

// interface Settings {
//     main: UserData;
//     bot: UserData;
//     version: string;
// }

// // Set default Twitch config
// if (espresso.store.get('twitch') === undefined) {
//     const defaultSettings: Settings = {
//         main: { id: null, username: null, token: null },
//         bot: { id: null, username: null, token: null },
//         version: '1.0.0',
//     };
//     espresso.store.set('twitch', defaultSettings);
// }

// const settings = espresso.store.get('twitch') as Settings;

// if (!settings.main.token || !settings.bot.token) {
//     // Let the app get situated
//     setTimeout(() => {
//         espresso.utilities.openInBrowser(`http://localhost:${espresso.server.port}/twitch/welcome`);
//     }, 1500);
// }

// if (settings.main.username !== null && settings.bot.username !== null && settings.bot.token !== null) {
//     Bot.init(settings.bot.username, settings.bot.token, settings.main.username);
//     Bot.connect();
// }

// if (settings.main.token !== null && settings.main.id !== null) {
//     PubSub.init(settings.main.token, settings.main.id);
//     PubSub.connect();
// }
