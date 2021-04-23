import WebSocket from 'ws';
import { bergsAccessToken, bergsId } from './tokens';
import { PubSubMessage, ParsedPubSubEvent } from './typings/pubsub';
import { Espresso } from '../../../espresso/declarations/core/espresso';

declare const espresso: Espresso;

class TwitchPubSub {
    private ws = new WebSocket('wss://pubsub-edge.twitch.tv');
    private heartbeatInterval = 1000 * 60; //ms between PING's
    private reconnectInterval = 1000 * 3; //ms to wait before reconnect
    private heartbeatHandle?: NodeJS.Timeout;

    constructor() {
        this.connect();
    }

    private connect() {
        this.ws = new WebSocket('wss://pubsub-edge.twitch.tv');
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
    }

    private onOpen(event: any) {
        console.log('Connected to Twitch PubSub');

        this.heartbeat();
        this.heartbeatHandle = setInterval(() => {
            this.heartbeat();
        }, this.heartbeatInterval);

        this.listen(`channel-bits-events-v2.${bergsId}`);
        this.listen(`channel-bits-badge-unlocks.${bergsId}`);
        this.listen(`channel-points-channel-v1.${bergsId}`);
        this.listen(`channel-subscribe-events-v1.${bergsId}`);
        this.listen(`chat_moderator_actions.${bergsId}`);
        this.listen(`channel.follow.${bergsId}`);
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
        if (data.type === 'MESSAGE') {
            const message = JSON.parse(data.data.message) as ParsedPubSubEvent;

            switch (message.type) {
                case 'reward-redeemed':
                    espresso.triggers.trigger('twitch-custom-reward', {
                        username: message.data.redemption.user.display_name,
                        redemption_id: message.data.redemption.id,
                    });
                    break;
            }
        }
    }

    private onError(event: any) {
        console.log(event);
    }

    private listen(topic: string) {
        const message = {
            type: 'LISTEN',
            nonce: this.nonce(15),
            data: {
                topics: [topic],
                auth_token: bergsAccessToken,
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
