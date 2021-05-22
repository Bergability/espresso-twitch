import { Espresso } from '../../../../../espresso/declarations/core/espresso';
import { Input } from '../../../../../espresso/declarations/typings/inputs';

declare const espresso: Espresso;

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
