import { trimUsername } from '../utilities';
import { Espresso } from '../../../../espresso/declarations/core/espresso';
import { Input } from '../../../../espresso/declarations/typings/inputs';
import Bot from '../bot';

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
    slug: 'twitch-send-chat-message',
    name: 'Send chat message',
    catigory: 'Chat',
    provider: 'Twitch',
    description: 'Send a message in Twitch chat.',
    settings: twitchSendMessageSettings,
    // @ts-ignore
    run: async (triggerSettings, actionSettings, triggerData) => {
        // @ts-ignore
        Bot.say('bergability', espresso.parseVariables(actionSettings.message, triggerData)).catch((e) => console.log);
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
    slug: 'twitch-ban-user',
    name: 'Ban user',
    catigory: 'Chat',
    provider: 'Twitch',
    description: 'Ban a selected user from Twitch chat.',
    settings: banUserSettings,
    // @ts-ignore
    run: async (triggerSettings, actionSettings: TwitchBanUserAction) => {
        Bot.ban('bergability', trimUsername(actionSettings.user)).catch((e) => console.log);
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
    slug: 'twitch-unban-user',
    name: 'Unban user',
    catigory: 'Chat',
    provider: 'Twitch',
    description: 'Unban a selected user from Twitch chat.',
    settings: unbanUserSettings,
    // @ts-ignore
    run: async (triggerSettings, actionSettings: TwitchBanUserAction) => {
        Bot.unban('bergability', trimUsername(actionSettings.user)).catch((e) => console.log);
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
    slug: 'twitch-timeout-user',
    name: 'Timeout user',
    catigory: 'Chat',
    provider: 'Twitch',
    description: 'Timeout a user from Twitch chat for a set duration.',
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
        Bot.timeout('bergability', trimUsername(actionSettings.user), actionSettings.duration * unit).catch((e) => console.log);
    },
});
