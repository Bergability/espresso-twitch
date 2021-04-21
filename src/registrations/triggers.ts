import { Espresso } from '../../../../espresso/declarations/core/espresso';
import { Input } from '../../../../espresso/declarations/typings/inputs';
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

interface TwtichChatCommand {
    aliases: string[];
}

const ChatCommandSettings: Input<TwtichChatCommand>[] = [
    {
        type: 'chips',
        key: 'aliases',
        default: [],
        label: 'Command aliases',
        emptyText: 'No command aliases',
        textTransform: 'lowercase',
        duplicates: false,
    },
];

espresso.triggers.register({
    slug: 'twitch-chat-command',
    name: 'Twitch chat command',
    provider: 'Twitch',
    catigory: 'Twitch chat',
    settings: ChatCommandSettings,
    predicate: (data: ChatMessageData & { aliase: string }, settings: TwtichChatCommand) => {
        return settings.aliases.includes(data.aliase);
    },
});
