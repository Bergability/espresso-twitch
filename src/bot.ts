import * as tmi from 'tmi.js';
import { Espresso } from '../../../espresso/declarations/core/espresso';

declare const espresso: Espresso;

class EspressoTwitchBot {
    public client: tmi.Client;

    constructor(public username: string, private token: string, public channel: string) {
        this.client = new tmi.Client({
            // options: { debug: true, messagesLogLevel: 'warn' },
            connection: {
                reconnect: true,
                secure: true,
            },
            identity: {
                username: this.username,
                password: `oauth:${espresso.tokens.get(this.token)}`,
            },
            channels: [this.channel],
        });

        // Set on message listener
        this.client.on('message', this.onMessage.bind(this));

        this.client
            .connect()
            .then(() => {
                espresso.events.dispatch('twitch:chat-bot-connected');
            })
            .catch((e) => {
                console.log(e);
            });
    }

    private onMessage(channel: string, tags: tmi.ChatUserstate, message: string, self: boolean) {
        // NEVER react to a message from the bot account
        if (self) return;

        // Leave if somehow the channel is not the one we are expecting
        if (channel !== `#${this.channel.toLowerCase()}`) return;

        let exclude: string[] = [];

        switch (tags['message-type']) {
            case 'chat':
                const messageData = {
                    message,
                    username: tags['display-name'],
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
    }
}

export default EspressoTwitchBot;
