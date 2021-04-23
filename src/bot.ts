import * as tmi from 'tmi.js';
import { botOauth } from './tokens';
import { Espresso } from '../../../espresso/declarations/core/espresso';

declare const espresso: Espresso;

const Bot = new tmi.Client({
    options: { debug: true, messagesLogLevel: 'info' },
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

            // If the message is a custom reward
            if (tags['custom-reward-id']) {
                espresso.triggers.trigger('twitch-custom-reward', {
                    ...messageData,
                    reward_id: tags.id,
                });
                return;
            }

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

const foo = {
    'badge-info': { subscriber: '53' },
    badges: { broadcaster: '1', subscriber: '3048', partner: '1' },
    color: '#0E75BD',
    'custom-reward-id': 'bf7fda40-bce5-4d01-a74e-952feec1166d',
    'display-name': 'Bergability',
    emotes: null,
    flags: null,
    id: 'e2008201-e2ce-4006-aa68-08101b2e91af',
    mod: false,
    'room-id': '113128856',
    subscriber: true,
    'tmi-sent-ts': '1619138635950',
    turbo: false,
    'user-id': '113128856',
    'user-type': null,
    'emotes-raw': null,
    'badge-info-raw': 'subscriber/53',
    'badges-raw': 'broadcaster/1,subscriber/3048,partner/1',
    username: 'bergability',
    'message-type': 'chat',
};
