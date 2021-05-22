import { Espresso } from '../../../../../espresso/declarations/core/espresso';

declare const espresso: Espresso;

/**
 *
 * Chat room states
 *
 */

// Emotes only
espresso.triggers.register({
    slug: 'twitch:chat-emotes-only-enabled',
    name: 'Emotes only mode enabled',
    provider: 'Twitch',
    catigory: 'Chat Room State',
});

espresso.triggers.register({
    slug: 'twitch:chat-emotes-only-disabled',
    name: 'Emotes only mode disabled',
    provider: 'Twitch',
    catigory: 'Chat Room State',
});

// Follower only
espresso.triggers.register({
    slug: 'twitch:chat-follower-only-enabled',
    name: 'Follower only mode enabled',
    provider: 'Twitch',
    catigory: 'Chat Room State',
    variables: [{ name: 'length', description: 'The amount of time (in min.) that a user must have followed for.' }],
});

espresso.triggers.register({
    slug: 'twitch:chat-follower-only-disabled',
    name: 'Follower only mode disabled',
    provider: 'Twitch',
    catigory: 'Chat Room State',
});

// R9K
espresso.triggers.register({
    slug: 'twitch:chat-r9k-mode-enabled',
    name: 'R9K mode enabled',
    provider: 'Twitch',
    catigory: 'Chat Room State',
});

espresso.triggers.register({
    slug: 'twitch:chat-r9k-mode-disabled',
    name: 'R9K mode disabled',
    provider: 'Twitch',
    catigory: 'Chat Room State',
});

// Slow mode
espresso.triggers.register({
    slug: 'twitch:chat-slow-mode-enabled',
    name: 'Slow mode enabled',
    provider: 'Twitch',
    catigory: 'Chat Room State',
    variables: [{ name: 'length', description: 'The amount of time (in sec.) between user messsages.' }],
});

espresso.triggers.register({
    slug: 'twitch:chat-slow-mode-disabled',
    name: 'Slow mode disabled',
    provider: 'Twitch',
    catigory: 'Chat Room State',
});

// Sub only mode
espresso.triggers.register({
    slug: 'twitch:chat-sub-only-enabled',
    name: 'Subscriber only mode enabled',
    provider: 'Twitch',
    catigory: 'Chat Room State',
});

espresso.triggers.register({
    slug: 'twitch:chat-sub-only-disabled',
    name: 'Subscriber only mode disabled',
    provider: 'Twitch',
    catigory: 'Chat Room State',
});
