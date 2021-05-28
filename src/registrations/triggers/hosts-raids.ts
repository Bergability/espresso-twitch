import { Espresso } from '../../../../../espresso/declarations/core/espresso';
import { Input } from '../../../../../espresso/declarations/typings/inputs';

declare const espresso: Espresso;

interface HostRaidSettings {
    limit: boolean;
    viewers: number;
}

const hostRaidSettings: Input<HostRaidSettings>[] = [
    {
        type: 'toggle',
        key: 'limit',
        default: false,
        label: 'Require minimum viewer count?',
        helper: 'Set a minimum amount of viewers for this trigger.',
    },
    {
        type: 'number',
        key: 'viewers',
        default: 100,
        label: 'Minimum amount',
        helper: 'The minimum amount of viewers required to trigger.',
        conditions: [{ value: 'limit', operator: 'equal', comparison: true }],
    },
];

const hostRaidPredicate = (data: { username: string; viewers: number }, settings: HostRaidSettings) => {
    console.log(data);

    // If min viewers is not required return true
    if (settings.limit === false) return true;

    // If viewer count is lower than the min return false
    if (data.viewers <= settings.viewers) return false;

    // If we are here that means the view count is higher or equal to the min
    return true;
};

/**
 *
 * Hosts and raids
 *
 */
// espresso.triggers.register({
//     slug: 'twitch:all-host-events',
//     name: 'All host events',
//     provider: 'Twitch',
//     catigory: 'Hosts / Raids',
//     variables: [
//         { name: 'username', description: 'The name of the user who hosted the channel' },
//         { name: 'viewers', description: 'The number of viewers from the host' },
//         { name: 'autohost', description: 'If this was an auto host or not' },
//     ],
//     settings: hostRaidSettings,
//     predicate: hostRaidPredicate,
// });

// espresso.triggers.register({
//     slug: 'twitch:channel-hosted',
//     name: 'Channel hosted',
//     provider: 'Twitch',
//     catigory: 'Hosts / Raids',
//     variables: [
//         { name: 'username', description: 'The name of the user who hosted the channel' },
//         { name: 'viewers', description: 'The number of viewers from the host' },
//     ],
//     settings: hostRaidSettings,
//     predicate: hostRaidPredicate,
// });

// espresso.triggers.register({
//     slug: 'twitch:channel-autohosted',
//     name: 'Channel autohosted',
//     provider: 'Twitch',
//     catigory: 'Hosts / Raids',
//     variables: [
//         { name: 'username', description: 'The name of the user who hosted the channel' },
//         { name: 'viewers', description: 'The number of viewers from the host' },
//     ],
//     settings: hostRaidSettings,
//     predicate: hostRaidPredicate,
// });

espresso.triggers.register({
    slug: 'twitch:channel-raided',
    name: 'Channel raided',
    provider: 'Twitch',
    catigory: 'Hosts / Raids',
    variables: [
        { name: 'username', description: 'The name of the user who raided the channel' },
        { name: 'viewers', description: 'The number of viewers from the raid' },
    ],
    settings: hostRaidSettings,
    predicate: hostRaidPredicate,
});
