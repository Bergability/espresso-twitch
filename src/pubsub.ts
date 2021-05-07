import WebSocket from 'ws';
import { PubSubMessage, ParsedPubSubEvent } from './typings/pubsub';
import { Espresso } from '../../../espresso/declarations/core/espresso';

declare const espresso: Espresso;

class TwitchPubSub {
    private ws = new WebSocket('wss://pubsub-edge.twitch.tv');
    private heartbeatInterval = 1000 * 60; //ms between PING's
    private reconnectInterval = 1000 * 3; //ms to wait before reconnect
    private heartbeatHandle?: NodeJS.Timeout;
    private token?: string;
    private channelId?: string;

    public init(token: string, channelId: string) {
        this.token = token;
        this.channelId = channelId;
    }

    public connect() {
        this.ws = new WebSocket('wss://pubsub-edge.twitch.tv');
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
    }

    private onOpen(event: any) {
        console.log('open!');

        this.heartbeat();
        this.heartbeatHandle = setInterval(() => {
            this.heartbeat();
        }, this.heartbeatInterval);

        if (this.token) {
            console.log('adding listeners');

            // this.listen(`channel-bits-events-v2.${this.channelId}`);
            // this.listen(`channel-bits-badge-unlocks.${this.channelId}`);
            this.listen(`channel-points-channel-v1.${this.channelId}`);
            // this.listen(`channel-subscribe-events-v1.${this.channelId}`);
            // this.listen(`chat_moderator_actions.*.${this.channelId}`);
            // this.listen(`channel.follow.${this.channelId}`);
        }
    }

    private nonce(length: number) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private onClose(event: any) {
        console.log('Twitch PubSub connection closed.');
        if (this.heartbeatHandle) clearInterval(this.heartbeatHandle);
        setTimeout(this.connect, this.reconnectInterval);
    }

    private onMessage(e: any) {
        const data = JSON.parse(e.data) as PubSubMessage;
        console.log(data);
        if (data.type === 'MESSAGE') {
            const message = JSON.parse(data.data.message) as ParsedPubSubEvent;

            switch (message.type) {
                case 'reward-redeemed':
                    console.log('reward redmeededddd');

                    espresso.triggers.trigger('twitch-custom-reward', {
                        username: message.data.redemption.user.display_name,
                        redemption_id: message.data.redemption.id,
                        reward_id: message.data.redemption.reward.id,
                    });
                    break;

                case 'moderation_action':
                    break;
            }
        }
    }

    private onError(event: any) {
        console.log(event);
    }

    private listen(topic: string) {
        if (!this.token) {
            console.log('Error: attempting to listen to Twitch PubSub event without an auth token.');
            return;
        }

        const message = {
            type: 'LISTEN',
            nonce: this.nonce(15),
            data: {
                topics: [topic],
                auth_token: this.token,
            },
        };
        this.ws.send(JSON.stringify(message));
    }

    private heartbeat() {
        const message = {
            type: 'PING',
        };
        this.ws.send(JSON.stringify(message));
    }
}

const pubSub = new TwitchPubSub();

export default pubSub;
