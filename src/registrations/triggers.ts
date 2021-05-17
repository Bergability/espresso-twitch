import { Espresso } from '../../../../espresso/declarations/core/espresso';
import { Input } from '../../../../espresso/declarations/typings/inputs';
import { Variable } from '../../../../espresso/declarations/typings/espresso';

declare const espresso: Espresso;

/**
 *
 * Chat message trigger
 *
 */
interface ChatMessageData {
    message: string;
}

espresso.triggers.register({
    slug: 'twitch:chat-message',
    name: 'Chat message',
    provider: 'Twitch',
    catigory: 'Chat',
    // TODO add vars
});

interface TwtichChatMessageContains {
    strings: string[];
}

const TwtichChatMessageContainsSettings: Input<TwtichChatMessageContains>[] = [
    {
        type: 'chips',
        key: 'strings',
        default: [],
        label: 'Keywords',
        textTransform: 'lowercase',
        duplicates: false,
        emptyText: 'No keywords set',
    },
];

/**
 *
 * Chat message contains
 *
 */
espresso.triggers.register({
    slug: 'twitch:chat-message-contains',
    name: 'Chat message contains',
    provider: 'Twitch',
    catigory: 'Chat',
    version: '1.0.0',
    settings: TwtichChatMessageContainsSettings,
    predicate: (data: ChatMessageData, settings: TwtichChatMessageContains) => {
        let shouldRun = false;

        settings.strings.forEach((string) => {
            if (data.message.toLowerCase().includes(string)) shouldRun = true;
        });

        return shouldRun;
    },
});

/**
 *
 * Chat command
 *
 */
interface CommandVariable {
    name: string;
    description: string;
}

interface ChatCommand {
    aliases: string[];
    useVariables: boolean;
    variables: CommandVariable[];
    requireLast: boolean;
    concatLast: boolean;
}

const ChatCommandSettings: Input<ChatCommand, CommandVariable>[] = [
    {
        type: 'chips',
        key: 'aliases',
        default: [],
        label: 'Command aliases',
        emptyText: 'No command aliases',
        textTransform: 'lowercase',
        duplicates: false,
    },
    {
        type: 'toggle',
        key: 'useVariables',
        label: 'Use custom variables in this command?',
        default: false,
    },
    {
        type: 'repeater',
        key: 'variables',
        label: 'Command variables',
        addLabel: 'Add variable',
        emptyLabel: 'No variables',
        removeLabel: 'Remove variable',
        default: [],
        conditions: [{ value: 'useVariables', operator: 'equal', comparison: true }],
        inputs: [
            {
                type: 'text',
                key: 'name',
                label: 'Variable name',
                default: '',
            },
            {
                type: 'text',
                key: 'description',
                label: 'Variable description',
                default: '',
            },
        ],
    },
    {
        type: 'toggle',
        key: 'requireLast',
        label: 'Require last variable',
        default: true,
        conditions: [
            [
                { value: 'useVariables', operator: 'equal', comparison: true },
                { value: 'variables', operator: 'array-length-greater-than', comparison: 0 },
            ],
        ],
    },
    {
        type: 'toggle',
        key: 'concatLast',
        label: 'Concatenate end of message into final variable?',
        default: false,
        conditions: [
            [
                { value: 'useVariables', operator: 'equal', comparison: true },
                { value: 'variables', operator: 'array-length-greater-than', comparison: 0 },
            ],
        ],
    },
];

espresso.triggers.register({
    slug: 'twitch:chat-command',
    name: 'Twitch chat command',
    provider: 'Twitch',
    catigory: 'Chat',
    version: '1.0.0',
    settings: ChatCommandSettings,
    variables: (settings: ChatCommand) => {
        const variables: Variable[] = [
            { name: 'message', description: 'The chat message containing this command.' },
            { name: 'username', description: 'The username of the user who sent this message.' },
        ];

        return settings.variables.reduce<Variable[]>((acc, { name, description }) => {
            return [...acc, { name, description }];
        }, variables);
    },
    getVariables: (triggerData: any, triggerSettings: ChatCommand) => {
        // Exit if not using variables
        if (!triggerSettings.useVariables) return triggerData;

        let splitMessage: string[] = triggerData.message.split(' ');
        splitMessage.shift();

        triggerSettings.variables.forEach((variable, index) => {
            // If is the last variable
            if (index === triggerSettings.variables.length - 1 && triggerSettings.concatLast === true) {
                splitMessage = [splitMessage.join(' ')];
            }

            triggerData[variable.name] = splitMessage[0];
            splitMessage.shift();
        });
        return triggerData;
    },
    predicate: (data: ChatMessageData & { aliase: string }, settings: ChatCommand) => {
        return settings.aliases.includes(data.aliase);
    },
});

/**
 *
 * Custom reward
 *
 */
interface CustomReward {
    reward: string;
}

const customRewardSettings: Input<CustomReward>[] = [
    {
        type: 'select',
        key: 'reward',
        default: '',
        label: 'Custom reward redeemed',
        options: 'twitch:custom-rewards',
        helper:
            'Not seeing your reward? You have to let Espresso create the reward in order for it to be allowed to manage it. Click the following button to create a reward.',
    },
    {
        type: 'button',
        label: 'Create new reward',
        link: `http://localhost:${espresso.store.get('port')}/twitch/new-custom-reward`,
        external: true,
    },
];

espresso.triggers.register({
    slug: 'twitch:custom-reward',
    name: 'Custom reward',
    provider: 'Twitch',
    catigory: 'Rewards',
    version: '1.0.0',
    settings: customRewardSettings,
    variables: [
        { name: 'message', description: 'The chat message sent with the command. This will be blank if no message is required.' },
        { name: 'username', description: 'The username of the user who sent this message.' },
        { name: 'redemption_id', description: 'The ID of the reward request, use this to auto redeem / reject a reward.' },
        { name: 'reward_id', description: 'The ID of the custom reward that has been redeemed' },
    ],
    predicate: (data: any, settings: CustomReward) => {
        return settings.reward === data.reward_id;
    },
});

/**
 *
 * Cheer / Bits
 *
 */
interface BitsCheered {
    min: boolean;
    amount: number;
}

const bitsCheeredSettings: Input<BitsCheered>[] = [
    {
        type: 'toggle',
        key: 'min',
        default: false,
        label: 'Require minimum amount',
        helper: 'Set a minimum amount of bits for this trigger.',
    },
    {
        type: 'number',
        key: 'amount',
        default: 100,
        label: 'Minimum amount',
        helper: 'The minimum amount of bits required to trigger.',
        conditions: [{ value: 'min', operator: 'equal', comparison: true }],
    },
];

espresso.triggers.register({
    slug: 'twitch:bits-cheered',
    name: 'Bits cheered',
    provider: 'Twitch',
    catigory: 'Chat',
    version: '1.0.0',
    settings: bitsCheeredSettings,
    variables: [
        { name: 'username', description: 'The username of the user who cheered the bits.' },
        { name: 'amount', description: 'The amount of bits cheered.' },
        { name: 'total', description: 'The total amount of bits this users has cheered.' },
        { name: 'message', description: 'The message sent with the bits.' },
        { name: 'anonymous', description: 'If the bits were sent anonymously.' },
    ],
});

/**
 *
 * Uesr banned
 *
 */
espresso.triggers.register({
    slug: 'twitch:chat-user-banned',
    name: 'User banned',
    provider: 'Twitch',
    catigory: 'Moderation',
    version: '1.0.0',
    variables: [
        { name: 'username', description: 'The username of the user who was banned.' },
        { name: 'reason', description: 'The reason the user was banned. If no reason is provided this will be set to "No reason provided"' },
        { name: 'moderator', description: 'The moderator who banned the user.' },
    ],
});

/**
 *
 * User unbanned
 *
 */
espresso.triggers.register({
    slug: 'twitch:chat-user-unbanned',
    name: 'User unbanned',
    provider: 'Twitch',
    catigory: 'Moderation',
    version: '1.0.0',
    variables: [
        { name: 'username', description: 'The username of the user who was unbanned.' },
        { name: 'moderator', description: 'The moderator who unbanned the user.' },
    ],
});

/**
 *
 * User timeout
 *
 */
espresso.triggers.register({
    slug: 'twitch:chat-user-timeout',
    name: 'User timed out',
    provider: 'Twitch',
    catigory: 'Moderation',
    version: '1.0.0',
    variables: [
        { name: 'username', description: 'The username of the user who was timed out.' },
        { name: 'duration', description: 'The duration (in seconds) of the timeout.' },
        { name: 'reason', description: 'The reason the user was timed out. If no reason is provided this will be set to "No reason provided"' },
        { name: 'moderator', description: 'The moderator who timed out the user.' },
    ],
});

/**
 *
 * Subscription events
 *
 */
interface TwitchAllSubEventsSettings {
    gifts: boolean;
}

const twitchAllSubEventsSettings: Input<TwitchAllSubEventsSettings>[] = [
    {
        type: 'toggle',
        key: 'gifts',
        default: true,
        label: 'Include gift subscriptions?',
    },
];

interface TwitchResubSettings {
    useMin: boolean;
    useMax: boolean;
    min: number;
    max: number;
}

const twitchResubSettings: Input<TwitchResubSettings>[] = [
    {
        type: 'toggle',
        key: 'useMin',
        default: false,
        label: 'Limit to months over a certain number?',
    },
    {
        type: 'number',
        key: 'min',
        default: 1,
        min: 1,
        label: 'Minimum months',
        helper: 'The minimum number of months required to trigger.',
        conditions: [{ value: 'useMin', operator: 'equal', comparison: true }],
    },
    {
        type: 'toggle',
        key: 'useMax',
        default: false,
        label: 'Limit to months under a certain number?',
    },
    {
        type: 'number',
        key: 'max',
        default: 15,
        min: 1,
        label: 'Maximum months',
        helper: 'The maximum number of months required to trigger.',
        conditions: [{ value: 'useMax', operator: 'equal', comparison: true }],
    },
];

const subVariables = [
    { name: 'username', description: 'The name of the user who subscribed.' },
    { name: 'months', description: 'The cumulative number of months the user has been subscribed for' },
    { name: 'tier', description: 'The tier the user subscribed at. Will be either "Prime", "1000", "2000", or "3000"' },
];

const giftSubVariables = [...subVariables, { name: 'gifter', description: 'The username of the user gifted the subscription.' }];

const subPredicate = (data: { months: number }, settings: TwitchResubSettings) => {
    let shouldRun: boolean = true;

    if (settings.useMin && data.months >= settings.min) shouldRun = false;
    if (settings.useMax && data.months <= settings.max) shouldRun = false;
    return shouldRun;
};

espresso.triggers.register({
    slug: 'twitch:all-subscription',
    name: 'All subscriptions',
    provider: 'Twitch',
    catigory: 'Subscriptions',
    version: '1.0.0',
    settings: [...twitchAllSubEventsSettings, ...twitchResubSettings],
    variables: (settings: TwitchAllSubEventsSettings) => {
        const vars = [
            { name: 'username', description: 'The name of the user who subscribed / recieved the a gift subscription.' },
            { name: 'months', description: 'The cumulative number of months the user has been subscribed for' },
            { name: 'tier', description: 'The tier the user subscribed at. Will be either "Prime", "1000", "2000", or "3000"' },
            { name: 'gift', description: 'If the subscription is a gift or not' },
        ];

        if (settings.gifts) {
            return [{ name: 'gifter', description: 'The username of the user gifted the subscription.' }, ...vars];
        }

        return vars;
    },
    predicate: (data: { gift: boolean; months: number }, settings: TwitchAllSubEventsSettings & TwitchResubSettings) => {
        if (subPredicate(data, settings) === false) return false;
        if (settings.gifts === false && data.gift === true) return false;
        return true;
    },
});

espresso.triggers.register({
    slug: 'twitch:all-gift-subscription',
    name: 'All gift subscriptions',
    provider: 'Twitch',
    catigory: 'Subscriptions',
    version: '1.0.0',
    settings: twitchResubSettings,
    variables: [
        { name: 'username', description: 'The name of the user who recieved the a gift subscription.' },
        { name: 'tier', description: 'The tier of the gift subscription. Will be either "Prime", "1000", "2000", or "3000"' },
        { name: 'gifter', description: 'The username of the user gifted the subscription.' },
        { name: 'gift', description: 'If the subscription is a gift or not' },
    ],
    predicate: subPredicate,
});

espresso.triggers.register({
    slug: 'twitch:new-subscription',
    name: 'New subscription',
    provider: 'Twitch',
    catigory: 'Subscriptions',
    version: '1.0.0',
    variables: subVariables,
});

espresso.triggers.register({
    slug: 'twitch:resubscription',
    name: 'Resubscription',
    provider: 'Twitch',
    catigory: 'Subscriptions',
    version: '1.0.0',
    settings: twitchResubSettings,
    variables: subVariables,
    predicate: subPredicate,
});

espresso.triggers.register({
    slug: 'twitch:gift-subscription',
    name: 'Gift subscription',
    provider: 'Twitch',
    catigory: 'Subscriptions',
    version: '1.0.0',
    variables: giftSubVariables,
});

espresso.triggers.register({
    slug: 'twitch:gift-resubscription',
    name: 'Gift resubscription',
    provider: 'Twitch',
    catigory: 'Subscriptions',
    version: '1.0.0',
    variables: giftSubVariables,
    settings: twitchResubSettings,
    predicate: subPredicate,
});

espresso.triggers.register({
    slug: 'twitch:anon-gift-subscription',
    name: 'Anonymous gift subscription',
    provider: 'Twitch',
    catigory: 'Subscriptions',
    version: '1.0.0',
    variables: giftSubVariables,
});

espresso.triggers.register({
    slug: 'twitch:anon-gift-resubscription',
    name: 'Anonymous gift resubscription',
    provider: 'Twitch',
    catigory: 'Subscriptions',
    version: '1.0.0',
    variables: giftSubVariables,
    settings: twitchResubSettings,
    predicate: subPredicate,
});
