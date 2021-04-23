import * as tmi from 'tmi.js';
import { botOauth } from './tokens';
import { Espresso } from '../../../espresso/declarations/core/espresso';

declare const espresso: Espresso;

const Bot = new tmi.Client({
    // options: { debug: true, messagesLogLevel: 'warn' },
    connection: {
        reconnect: true,
        secure: true,
    },
    identity: {
        username: 'botability',
        password: botOauth,
    },
    channels: ['bergability'],
});

Bot.connect().catch(console.error);

export default Bot;

Bot.on('message', (channel, tags, message, self) => {
    if (self) return;
    let exclude: string[] = [];

    switch (tags['message-type']) {
        case 'chat':
            const messageData = {
                message,
                username: tags.username,
            };

            exclude = [...exclude, ...espresso.triggers.trigger('twitch-chat-message', messageData, exclude)];
            exclude = [...exclude, ...espresso.triggers.trigger('twitch-chat-message-contains', messageData, exclude)];

            if (message.startsWith('!')) {
                const aliase = message.split(' ')[0].substr(1);
                exclude = [...exclude, ...espresso.triggers.trigger('twitch-chat-command', { ...messageData, aliase }, exclude)];
            }
            break;

        case 'action':
            console.log('action');
            console.log(tags);
            break;
    }
});
