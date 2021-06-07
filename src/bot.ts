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

        // Set event listeners
        this.client.on('message', this.onMessage.bind(this));

        // this.client.on('hosted', this.onHosted.bind(this));
        this.client.on('raided', this.onRaid.bind(this));

        this.client.on('emoteonly', this.onEmoteOnly.bind(this));
        this.client.on('followersonly', this.onFollowerOnly.bind(this));
        this.client.on('r9kbeta', this.onR9K.bind(this));
        this.client.on('slowmode', this.onSlowMode.bind(this));
        this.client.on('subscribers', this.onSubOnly.bind(this));
        // this.client.on('join', this.onUserJoin.bind(this));

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
                    badges: tags.badges,
                    color: tags.color || '#ff00ff',
                };

                exclude = [...exclude, ...espresso.triggers.trigger('twitch:chat-message', messageData, exclude)];
                exclude = [...exclude, ...espresso.triggers.trigger('twitch:chat-message-contains', messageData, exclude)];

                if (message.startsWith('!')) {
                    const aliase = message.split(' ')[0].substr(1);
                    exclude = [...exclude, ...espresso.triggers.trigger('twitch:chat-command', { ...messageData, aliase }, exclude)];
                }
                break;

            case 'action':
                console.log('action');
                console.log(tags);
                break;
        }
    }

    private onHosted(channel: string, username: string, viewers: number, autohost: boolean) {
        console.log({ username, viewers, autohost });

        let exclude: string[] = [];

        exclude = [...espresso.triggers.trigger('twitch:all-host-events', { username, viewers, autohost }), ...exclude];
        if (autohost === false) {
            exclude = [...espresso.triggers.trigger('twitch:channel-hosted', { username, viewers, autohost }), ...exclude];
        } else if (autohost === true) {
            exclude = [...espresso.triggers.trigger('twitch:channel-autohosted', { username, viewers, autohost }), ...exclude];
        }
    }

    private onRaid(channel: string, username: string, viewers: number) {
        espresso.triggers.trigger('twitch:channel-raided', { username, viewers });
    }

    private onEmoteOnly(channel: string, enabled: boolean) {
        espresso.triggers.trigger('twitch:chat-emotes-only', { enabled, mode: 'Emote only mode' });
    }

    // Length is in mins
    private onFollowerOnly(channel: string, enabled: boolean, length: number) {
        espresso.triggers.trigger('twitch:chat-follower-only', { enabled, length, mode: 'Follower only mode' });
    }

    private onR9K(channel: string, enabled: boolean) {
        espresso.triggers.trigger('twitch:chat-r9k-mode', { enabled, mode: 'R9K mode' });
    }

    // Length is in sec
    private onSlowMode(channel: string, enabled: boolean, length: number) {
        espresso.triggers.trigger('twitch:chat-slow-mode', { enabled, length, mode: 'Slow mode' });
    }

    private onSubOnly(channel: string, enabled: boolean) {
        espresso.triggers.trigger('twitch:chat-sub-only', { enabled, mode: 'Subscriber only mode' });
    }

    // private onUserJoin(channel: string, username: string, self: boolean) {
    //     // Never react to the bot doing anything
    //     if (self) return;
    //     espresso.triggers.trigger('twitch:user-joined-chat', { username });
    // }
}

export default EspressoTwitchBot;
