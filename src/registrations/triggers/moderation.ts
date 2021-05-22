import { Espresso } from '../../../../../espresso/declarations/core/espresso';

declare const espresso: Espresso;

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
