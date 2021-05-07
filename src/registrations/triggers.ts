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
    slug: 'twitch-chat-message',
    name: 'Chat message',
    provider: 'Twitch',
    catigory: 'Twitch chat',
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
    slug: 'twitch-chat-message-contains',
    name: 'Chat message contains',
    provider: 'Twitch',
    catigory: 'Twitch chat',
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
    slug: 'twitch-chat-command',
    name: 'Twitch chat command',
    provider: 'Twitch',
    catigory: 'Twitch chat',
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
        label: 'Custom reward',
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
    slug: 'twitch-custom-reward',
    name: 'Custom reward',
    provider: 'Twitch',
    catigory: 'Rewards',
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
