import { Espresso } from '../../../../../espresso/declarations/core/espresso';

declare const espresso: Espresso;

/**
 *
 * Hosts and raids
 *
 */
espresso.triggers.register({
    slug: 'twitch:all-host-events',
    name: 'All host events',
    provider: 'Twitch',
    catigory: 'Hosts / Raids',
    variables: [
        { name: 'username', description: 'The name of the user who hosted the channel' },
        { name: 'viewers', description: 'The number of viewers from the host' },
        { name: 'autohost', description: 'If this was an auto host or not' },
    ],
});

espresso.triggers.register({
    slug: 'twitch:channel-hosted',
    name: 'Channel hosted',
    provider: 'Twitch',
    catigory: 'Hosts / Raids',
    variables: [
        { name: 'username', description: 'The name of the user who hosted the channel' },
        { name: 'viewers', description: 'The number of viewers from the host' },
    ],
});

espresso.triggers.register({
    slug: 'twitch:channel-autohosted',
    name: 'Channel autohosted',
    provider: 'Twitch',
    catigory: 'Hosts / Raids',
    variables: [
        { name: 'username', description: 'The name of the user who hosted the channel' },
        { name: 'viewers', description: 'The number of viewers from the host' },
    ],
});

espresso.triggers.register({
    slug: 'twitch:channel-raided',
    name: 'Channel raided',
    provider: 'Twitch',
    catigory: 'Hosts / Raids',
    variables: [
        { name: 'username', description: 'The name of the user who raided the channel' },
        { name: 'viewers', description: 'The number of viewers from the raid' },
    ],
});
