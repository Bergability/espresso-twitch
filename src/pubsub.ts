import WebSocket from 'ws';
import { PubSubMessage, ParsedPubSubEvent } from './typings/pubsub';
import { Espresso } from '../../../espresso/declarations/core/espresso';

declare const espresso: Espresso;

class TwitchPubSub {
    public ws = new WebSocket('wss://pubsub-edge.twitch.tv');
    private heartbeatInterval = 1000 * 60; //ms between PING's
    // private reconnectInterval = 1000 * 3; //ms to wait before reconnect
    private heartbeatHandle?: NodeJS.Timeout;

    constructor(private token: string, private channelId: string) {
        this.connect();
    }

    public connect() {
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
    }

    public disconnect() {
        this.ws.close();
    }

    private onOpen(event: any) {
        this.heartbeat();
        this.heartbeatHandle = setInterval(() => {
            this.heartbeat();
        }, this.heartbeatInterval);

        espresso.events.dispatch('twitch:pubsub-connected');

        // this.listen(`channel-bits-events-v2.${this.channelId}`);
        // this.listen(`channel-bits-badge-unlocks.${this.channelId}`);
        this.listen(`channel-points-channel-v1.${this.channelId}`);
        // this.listen(`channel-subscribe-events-v1.${this.channelId}`);
        // this.listen(`chat_moderator_actions.*.${this.channelId}`);
        // this.listen(`channel.follow.${this.channelId}`);
    }

    private onClose(event: any) {
        espresso.events.dispatch('twitch:pubsub-disconnected');
        if (this.heartbeatHandle) clearInterval(this.heartbeatHandle);
    }

    private onMessage(e: any) {
        const data = JSON.parse(e.data) as PubSubMessage;
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
        const message = {
            type: 'LISTEN',
            nonce: espresso.utilities.uuid(),
            data: {
                topics: [topic],
                auth_token: espresso.tokens.get(this.token),
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

export default TwitchPubSub;
