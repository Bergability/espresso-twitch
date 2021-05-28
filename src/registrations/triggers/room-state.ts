import { Espresso } from '../../../../../espresso/declarations/core/espresso';
import { Input } from '../../../../../espresso/declarations/typings/inputs';

declare const espresso: Espresso;

/**
 *
 * Chat room states
 *
 */

interface RoomStateSettings {
    enabled: boolean;
    disabled: boolean;
}

const roomStateSettings: Input<RoomStateSettings>[] = [
    {
        type: 'toggle',
        key: 'enabled',
        label: 'Trigger when enabled?',
        default: true,
    },
    {
        type: 'toggle',
        key: 'disabled',
        label: 'Trigger when disabled?',
        default: true,
    },
];

interface RoomStateData {
    enabled: boolean;
}

const roomStateVariables = [
    { name: 'enabled', description: 'If the room state was enabled or disabled. Value will be "true" or "false".' },
    { name: 'mode', description: 'The mode that was enabled. This is helpful when using mutiple roomstate triggers for one action set.' },
];

const roomStatePredicate = (data: RoomStateData, settings: RoomStateSettings) => {
    if (data.enabled === true && settings.enabled === true) return true;
    else if (data.enabled === false && settings.disabled === true) return true;
    else return false;
};

// Emotes only
espresso.triggers.register({
    slug: 'twitch:chat-emotes-only',
    name: 'Emote only mode',
    provider: 'Twitch',
    catigory: 'Chat Room State',
    settings: roomStateSettings,
    predicate: roomStatePredicate,
});

// Follower only
espresso.triggers.register({
    slug: 'twitch:chat-follower-only',
    name: 'Follower only mode',
    provider: 'Twitch',
    catigory: 'Chat Room State',
    variables: [{ name: 'length', description: 'The amount of time (in min.) that a user must have followed for.' }, ...roomStateVariables],
    settings: roomStateSettings,
    predicate: roomStatePredicate,
});

// R9K
espresso.triggers.register({
    slug: 'twitch:chat-r9k-mode',
    name: 'R9K / Unique mode',
    provider: 'Twitch',
    catigory: 'Chat Room State',
    settings: roomStateSettings,
    variables: roomStateVariables,
    predicate: roomStatePredicate,
});

// Slow mode
espresso.triggers.register({
    slug: 'twitch:chat-slow-mode',
    name: 'Slow mode',
    provider: 'Twitch',
    catigory: 'Chat Room State',
    variables: [{ name: 'length', description: 'The amount of time (in sec.) between user messsages.' }, ...roomStateVariables],
    settings: roomStateSettings,
    predicate: roomStatePredicate,
});

// Sub only mode
espresso.triggers.register({
    slug: 'twitch:chat-sub-only',
    name: 'Subscriber only mode',
    provider: 'Twitch',
    catigory: 'Chat Room State',
    variables: roomStateVariables,
    settings: roomStateSettings,
    predicate: roomStatePredicate,
});
