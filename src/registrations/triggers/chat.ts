import { Espresso } from '../../../../../espresso/declarations/core/espresso';
import { Input } from '../../../../../espresso/declarations/typings/inputs';
import { Item, List } from '../../../../../espresso/declarations/typings/items';
import { Variable } from '../../../../../espresso/declarations/typings/espresso';
import { Badges } from 'tmi.js';

declare const espresso: Espresso;

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
    variables: [
        { name: 'message', description: 'The chat message containing this command.' },
        { name: 'username', description: 'The username of the user who sent this message.' },
    ],
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
    variables: [
        { name: 'message', description: 'The chat message containing this command.' },
        { name: 'username', description: 'The username of the user who sent this message.' },
    ],
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
    limit: boolean;
    roles: string[];
    useLists: boolean;
    lists: string[];
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
        type: 'section',
        title: 'Command usage settings',
        description: ['The following settings allow you to set who can use this command. This can be based on username, role, or chat badges.'],
        inputs: [
            {
                type: 'toggle',
                key: 'limit',
                label: 'Limit command usage to certain users.',
                default: false,
            },
            {
                type: 'select',
                key: 'roles',
                label: 'Roles allowed to use this command.',
                options: [
                    { text: 'Broadcaster', value: 'broadcaster' },
                    { text: 'Moderators', value: 'moderator' },
                    { text: 'VIPs', value: 'vip' },
                    { text: 'Founders', value: 'founder' },
                    { text: 'Subscribers', value: 'subscriber' },
                    { text: 'Sub Gifter', value: 'sub-gifter' },
                    { text: 'Bits leader', value: 'bits-leader' },
                    { text: 'Bits (Someone with a bit badge)', value: 'bits' },
                    { text: 'Partner', value: 'partner' },
                ],
                helper:
                    'These roles are based on chat badges, if a user is not showing a badge for their role they will not have access to this command.',
                multiple: true,
                default: [],
                conditions: [{ value: 'limit', operator: 'equal', comparison: true }],
            },
            {
                type: 'toggle',
                key: 'useLists',
                label: 'Allow usernames from a list to use this command?',
                default: false,
                conditions: [{ value: 'limit', operator: 'equal', comparison: true }],
            },
            {
                type: 'select',
                label: 'User list',
                key: 'lists',
                multiple: true,
                options: 'espresso:lists',
                default: [],
                conditions: [
                    [
                        { value: 'limit', operator: 'equal', comparison: true },
                        { value: 'useLists', operator: 'equal', comparison: true },
                    ],
                ],
            },
        ],
    },
    {
        type: 'section',
        title: 'Command Variables',
        description: [
            'Command variables allow you to pull words from the command message and use them in your action set. For example this can be used to create a "!ban [username]" command.',
        ],
        inputs: [
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
                        // { value: 'variables', operator: 'array-length-greater-than', comparison: 0 },
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
                        // { value: 'variables', operator: 'array-length-greater-than', comparison: 0 },
                    ],
                ],
            },
        ],
    },
];

interface ChatCommandTriggerData {
    message: string;
    username: string;
    badges: Badges;
    aliase: string;
    [key: string]: any;
}

espresso.triggers.register({
    slug: 'twitch:chat-command',
    name: 'Chat command',
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
    getVariables: (triggerData: ChatCommandTriggerData, triggerSettings: ChatCommand) => {
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
    predicate: (triggerData: ChatCommandTriggerData, settings: ChatCommand) => {
        const { aliase, badges, username } = triggerData;
        const { limit, useLists, lists, roles } = settings;

        // If the command aliase is not one of the set aliases DO NOT RUN!
        if (!settings.aliases.includes(aliase)) return false;

        /**
         * User limit logic
         * If there is a limit on who can use this command
         * default to returning `false`.
         */
        if (limit) {
            // If roles are selected check those first
            if (Array.isArray(roles) && roles.length > 0) {
                // Loop over each role and see if the user has at least one
                const hasRole = roles.reduce<boolean>((acc, role) => {
                    if (badges[role] !== undefined) return true;
                    return acc;
                }, false);

                // If the user has at least one role they can run the command!
                if (hasRole) return true;
            }

            // Check if the command uses a list of users
            if (useLists) {
                const items = espresso.store.get('items') as Item[];

                // This is the final check
                const isInLists = lists.reduce<boolean>((acc, listId) => {
                    // Find the curren list
                    const list = items.find((i) => i.id === listId && i.type === 'list') as List;

                    // If we can't find the list we can't verify the user has access
                    if (!list) return acc;

                    const isInCurrentList = list.items.reduce<boolean>((acc, entry) => {
                        // If the username is in the list return true
                        if (entry.toLowerCase() === username.toLowerCase()) return true;
                        return acc;
                    }, false);

                    if (isInCurrentList) return true;

                    return acc;
                }, false);

                if (isInLists) return true;
            }

            // Deny access to the command by default
            return false;
        }

        // If none of the above conditions are met assume the command can be run
        return true;
    },
});
