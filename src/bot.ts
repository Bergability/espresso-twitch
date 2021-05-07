import * as tmi from 'tmi.js';
import { Espresso } from '../../../espresso/declarations/core/espresso';

declare const espresso: Espresso;

class EspressoTwitchBot {
    public client?: tmi.Client;
    public channel?: string;

    private username?: string;
    private token?: string;

    public init(username: string, token: string, channel: string) {
        // Set internal vars
        this.username = username;
        this.token = token;
        this.channel = channel;

        // Start a new client
        this.client = new tmi.Client({
            // options: { debug: true, messagesLogLevel: 'warn' },
            connection: {
                reconnect: true,
                secure: true,
            },
            identity: {
                username,
                password: `oauth:${token}`,
            },
            channels: [channel],
        });

        // Set on message listener
        this.client.on('message', (channel, tags, message, self) => {
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
    }

    public connect() {
        if (this.client) {
            this.client.connect().catch((e) => {
                console.log(e);
            });
        }
    }
}

const Bot = new EspressoTwitchBot();

export default Bot;
