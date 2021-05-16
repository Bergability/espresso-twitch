import { trimUsername } from '../utilities';
import { Espresso } from '../../../../espresso/declarations/core/espresso';
import { Input } from '../../../../espresso/declarations/typings/inputs';
import Twitch from '../twitch';
import TwitchAPIFetch from '../api';

declare const espresso: Espresso;

/**
 *
 * Send message action
 *
 */
interface TwitchSendChatSettings {
    message: string;
}

const twitchSendMessageSettings: Input<TwitchSendChatSettings>[] = [
    {
        type: 'text',
        label: 'Message',
        key: 'message',
        helper: 'The message to send in Twitch chat.',
        default: 'Hello world!',
    },
];

espresso.actions.register({
    slug: 'twitch:send-chat-message',
    name: 'Send chat message',
    catigory: 'Chat',
    provider: 'Twitch',
    description: 'Send a message in Twitch chat.',
    version: '1.0.0',
    settings: twitchSendMessageSettings,
    // @ts-ignore
    run: async (triggerSettings, actionSettings, triggerData) => {
        if (Twitch.chatClient !== null && Twitch.chatClient.client.readyState() === 'OPEN')
            Twitch.chatClient.client
                .say(Twitch.chatClient.channel, espresso.parseVariables(actionSettings.message, triggerData))
                .catch((e) => console.log);
    },
});

/**
 *
 * Ban user action
 *
 */
interface TwitchBanUserAction {
    user: string;
    reason: string;
}

const banUserSettings: Input<TwitchBanUserAction>[] = [
    {
        type: 'text',
        label: 'Username',
        key: 'user',
        helper: 'The user to ban from Twitch chat.',
        default: '',
    },
    {
        type: 'text',
        label: 'Ban reason',
        key: 'reason',
        helper: 'The reason for banning this user.',
        default: '',
    },
];

espresso.actions.register({
    slug: 'twitch:ban-user',
    name: 'Ban user',
    catigory: 'Chat',
    provider: 'Twitch',
    description: 'Ban a selected user from Twitch chat.',
    version: '1.0.0',
    settings: banUserSettings,
    // @ts-ignore
    run: async (triggerSettings, actionSettings: TwitchBanUserAction) => {
        if (Twitch.chatClient !== null && Twitch.chatClient.client.readyState() === 'OPEN')
            Twitch.chatClient.client.ban(Twitch.chatClient.channel, trimUsername(actionSettings.user)).catch((e) => console.log);
    },
});

/**
 *
 * Unban user action
 *
 */
interface TwitchUnbanUserAction {
    user: string;
}

const unbanUserSettings: Input<TwitchUnbanUserAction>[] = [
    {
        type: 'text',
        label: 'Username',
        key: 'user',
        helper: 'The user to ban from Twitch chat.',
        default: '',
    },
];

espresso.actions.register({
    slug: 'twitch:unban-user',
    name: 'Unban user',
    catigory: 'Chat',
    provider: 'Twitch',
    description: 'Unban a selected user from Twitch chat.',
    version: '1.0.0',
    settings: unbanUserSettings,
    // @ts-ignore
    run: async (triggerSettings, actionSettings: TwitchBanUserAction) => {
        if (Twitch.chatClient !== null && Twitch.chatClient.client.readyState() === 'OPEN')
            Twitch.chatClient.client.unban(Twitch.chatClient.channel, trimUsername(actionSettings.user)).catch((e) => console.log);
    },
});

/**
 *
 * Timeout user action
 *
 */
interface TwitchTimeoutUserAction {
    user: string;
    duration: number;
    unit: 'seconds' | 'minutes' | 'hours';
}

const timeoutUserSettings: Input<TwitchTimeoutUserAction>[] = [
    {
        type: 'text',
        label: 'Username',
        key: 'user',
        helper: 'The user to ban from Twitch chat.',
        default: '',
    },
    {
        type: 'number',
        label: 'Duration',
        key: 'duration',
        helper: 'The length of time to wait.',
        default: 10,
    },
    {
        type: 'select',
        label: 'Unit',
        key: 'unit',
        default: 'seconds',
        options: [
            { text: 'Seconds', value: 'seconds' },
            { text: 'Minutes', value: 'minutes' },
            { text: 'Hours', value: 'hours' },
        ],
    },
];

espresso.actions.register({
    slug: 'twitch:timeout-user',
    name: 'Timeout user',
    catigory: 'Chat',
    provider: 'Twitch',
    description: 'Timeout a user from Twitch chat for a set duration.',
    version: '1.0.0',
    settings: timeoutUserSettings,
    // @ts-ignore
    run: async (triggerSettings, actionSettings: TwitchTimeoutUserAction) => {
        let unit: number;

        switch (actionSettings.unit) {
            case 'seconds':
                unit = 1;
                break;

            case 'minutes':
                unit = 60;
                break;

            case 'hours':
                unit = 3600;
                break;
        }
        if (Twitch.chatClient !== null && Twitch.chatClient.client.readyState() !== 'OPEN')
            Twitch.chatClient.client
                .timeout(Twitch.chatClient.channel, trimUsername(actionSettings.user), actionSettings.duration * unit)
                .catch((e) => console.log);
    },
});

/**
 *
 * Accept / Reject reward
 *
 */
interface AcceptRejectReward {
    redemtionId: string;
    rewardId: string;
}

const acceptRewardSettings: Input<AcceptRejectReward>[] = [
    {
        type: 'select',
        key: 'rewardId',
        default: '',
        label: 'Custom reward',
        options: 'twitch:custom-rewards-accessible',
        helper: 'Not seeing your reward? Espresso can only manage rewards that it has created',
    },
    {
        type: 'text',
        label: 'Redemption ID',
        key: 'redemtionId',
        helper: 'The redemption ID you want to fulfill. This should probably come from a trigger variable.',
        default: '',
    },
    {
        type: 'button',
        label: 'Create new reward',
        link: `http://localhost:${espresso.store.get('port')}/twitch/new-custom-reward`,
        external: true,
    },
];

espresso.actions.register({
    slug: 'twitch:fulfill-custom-reward',
    name: 'Fulfill custom reward',
    provider: 'Twitch',
    catigory: 'Rewards',
    description: 'Fulfill a custom reward request.',
    version: '1.0.0',
    settings: acceptRewardSettings,
    // @ts-ignore
    run: async (triggerSettings, actionSettings: AcceptRejectReward, triggerData) => {
        const redemtionId = espresso.parseVariables(actionSettings.redemtionId, triggerData);
        const mainId = espresso.store.get('twitch.main.id');

        if (mainId === null) return false;

        try {
            await TwitchAPIFetch(
                `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${mainId}&reward_id=${actionSettings.rewardId}&id=${redemtionId}`,
                'PATCH',
                { status: 'FULFILLED' }
            );
            return true;
        } catch (e) {
            return false;
        }
    },
});

const rejectRewardSettings: Input<AcceptRejectReward>[] = [
    {
        type: 'select',
        key: 'rewardId',
        default: '',
        label: 'Custom reward',
        options: 'twitch:custom-rewards-accessible',
        helper: 'Not seeing your reward? Espresso can only manage rewards that it has created',
    },
    {
        type: 'text',
        label: 'Redemption ID',
        key: 'redemtionId',
        helper: 'The redemption ID you want to reject. This should probably come from a trigger variable.',
        default: '',
    },
    {
        type: 'button',
        label: 'Create new reward',
        link: 'http://localhost:23167/twitch/new-custom-reward',
        external: true,
    },
];

espresso.actions.register({
    slug: 'twitch:reject-custom-reward',
    name: 'Reject custom reward',
    provider: 'Twitch',
    catigory: 'Rewards',
    description: 'Reject a custom reward request.',
    version: '1.0.0',
    settings: rejectRewardSettings,
    // @ts-ignore
    run: async (triggerSettings, actionSettings: AcceptRejectReward, triggerData) => {
        const redemtionId = espresso.parseVariables(actionSettings.redemtionId, triggerData);
        const mainId = espresso.store.get('twitch.main.id');

        if (mainId === null) return false;

        try {
            await TwitchAPIFetch(
                `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${mainId}&reward_id=${actionSettings.rewardId}&id=${redemtionId}`,
                'PATCH',
                { status: 'CANCELED' }
            );
            return true;
        } catch (e) {
            return false;
        }
    },
});
