import { Espresso } from '../../../../espresso/declarations/core/espresso';
import { Input, RepeaterInput } from '../../../../espresso/declarations/typings/inputs';
import Bot from '../bot';

declare const espresso: Espresso;

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

interface CommandVariable {
    name: string;
    description: string;
}

interface ChatCommand {
    aliases: string[];
    variables: CommandVariable[];
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
        type: 'repeater',
        key: 'variables',
        label: 'Command variables',
        addLabel: 'Add variable',
        emptyLabel: 'No variables',
        removeLabel: 'Remove variable',
        default: [],
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
];

espresso.triggers.register({
    slug: 'twitch-chat-command',
    name: 'Twitch chat command',
    provider: 'Twitch',
    catigory: 'Twitch chat',
    settings: ChatCommandSettings,
    predicate: (data: ChatMessageData & { aliase: string }, settings: ChatCommand) => {
        return settings.aliases.includes(data.aliase);
    },
});
