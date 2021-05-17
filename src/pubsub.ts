import WebSocket from 'ws';
import { PubSubMessage, ParsedPubSubEvent, ParsedBitsEvent, ParsedRewardRedeemed, ParsedModerationEvent, ParsedSubEvent } from './typings/pubsub';
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

        this.listen(`channel-bits-events-v2.${this.channelId}`);
        this.listen(`channel-points-channel-v1.${this.channelId}`);
        this.listen(`chat_moderator_actions.${this.channelId}.${this.channelId}`);
        this.listen(`channel-subscribe-events-v1.${this.channelId}`);

        // this.listen(`channel-bits-badge-unlocks.${this.channelId}`);
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

    private onError(event: any) {
        console.log(event);
    }

    private onClose(event: any) {
        espresso.events.dispatch('twitch:pubsub-disconnected');
        if (this.heartbeatHandle) clearInterval(this.heartbeatHandle);
    }

    private onMessage(e: any) {
        const event = JSON.parse(e.data) as PubSubMessage;

        switch (event.type) {
            case 'MESSAGE':
                const message = JSON.parse(event.data.message) as ParsedPubSubEvent;

                switch (event.data.topic) {
                    case `channel-bits-events-v2.${this.channelId}`:
                        this.onBitsEvent(message as ParsedBitsEvent);
                        break;

                    case `channel-points-channel-v1.${this.channelId}`:
                        this.onChannelPointsEvent(message as ParsedRewardRedeemed);
                        break;

                    case `chat_moderator_actions.${this.channelId}.${this.channelId}`:
                        this.onModerationEvent(message as ParsedModerationEvent);
                        break;

                    case `channel-subscribe-events-v1.${this.channelId}`:
                        this.onSubEvent(message as ParsedSubEvent);
                        break;
                }
                break;

            case 'RECONNECT':
                espresso.events.dispatch('twitch:pubsub-server-reconnect');
                break;
        }
    }

    private onSubEvent(message: ParsedSubEvent) {
        let exclude: string[] = [];
        let slug: string;

        const isGift = () => {
            switch (message.context) {
                case 'sub':
                case 'resub':
                    return false;

                case 'subgift':
                case 'resubgift':
                case 'anonsubgift':
                case 'anonresubgift':
                    return true;
            }
        };

        const getRecipientData = () => {
            switch (message.context) {
                case 'sub':
                case 'resub':
                    return {
                        username: message.display_name,
                        months: message.cumulative_months,
                        tier: message.sub_plan,
                        streak: message.streak_months,
                    };

                case 'subgift':
                case 'resubgift':
                case 'anonsubgift':
                case 'anonresubgift':
                    return { username: message.recipient_display_name, months: message.months, tier: message.sub_plan };
            }
        };

        const getSenderData = () => {
            switch (message.context) {
                case 'sub':
                case 'resub':
                    return {};

                case 'subgift':
                case 'resubgift':
                    return { gifter: message.display_name };

                case 'anonsubgift':
                case 'anonresubgift':
                    return { gifter: 'AnAnonymousGifter' };
            }
        };

        const trigger = (slug: string) => {
            exclude = [
                ...exclude,
                ...espresso.triggers.trigger(
                    slug,
                    {
                        ...getRecipientData(),
                        ...getSenderData(),
                        gift: isGift(),
                    },
                    exclude
                ),
            ];
        };

        switch (message.context) {
            case 'sub':
                slug = 'twitch:new-subscription';
                break;

            case 'resub':
                slug = 'twitch:resubscription';
                break;

            case 'subgift':
                slug = 'twitch:gift-subscription';
                break;

            case 'resubgift':
                slug = 'twitch:gift-resubscription';
                break;

            case 'anonsubgift':
                slug = 'twitch:anon-gift-subscription';
                break;
            case 'anonresubgift':
                slug = 'twitch:anon-gift-resubscription';
                break;
        }

        if (slug !== undefined) trigger(slug);
        if (isGift()) trigger('twitch:all-gift-subscription');
        trigger('twitch:all-subscription');
    }

    private onBitsEvent(message: ParsedBitsEvent) {
        switch (message.message_type) {
            case 'bits_event':
                espresso.triggers.trigger('twitch:bits-cheered', {
                    username: message.data.is_anonymous ? 'AnAnonymousCheerer' : message.data.user_name,
                    amount: message.data.bits_used,
                    total: message.data.total_bits_used,
                    message: message.data.chat_message,
                    anonymous: message.data.is_anonymous,
                });
                break;
        }
    }

    private onChannelPointsEvent(message: ParsedRewardRedeemed) {
        switch (message.type) {
            case 'reward-redeemed':
                espresso.triggers.trigger('twitch:custom-reward', {
                    username: message.data.redemption.user.display_name,
                    redemption_id: message.data.redemption.id,
                    reward_id: message.data.redemption.reward.id,
                });
                break;
        }
    }

    private onModerationEvent(message: ParsedModerationEvent) {
        switch (message.data.moderation_action) {
            case 'ban':
                espresso.triggers.trigger('twitch:chat-user-banned', {
                    username: message.data.moderation_action[0],
                    reason: message.data.moderation_action[1] || 'No reason provided',
                    moderator: message.data.created_by || message.data.from_automod ? 'Automod' : '',
                });
                break;

            case 'unban':
                espresso.triggers.trigger('twitch:chat-user-unbanned', {
                    username: message.data.moderation_action[0],
                    moderator: message.data.created_by || message.data.from_automod ? 'Automod' : '',
                });
                break;

            case 'timeout':
                espresso.triggers.trigger('twitch:chat-user-timeout', {
                    username: message.data.moderation_action[0],
                    duration: message.data.moderation_action[1],
                    reason: message.data.moderation_action[2] || 'No reason provided',
                    moderator: message.data.created_by || message.data.from_automod ? 'Automod' : '',
                });
                break;
        }
    }
}

export default TwitchPubSub;
