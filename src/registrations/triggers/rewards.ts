import { Espresso } from '../../../../../espresso/declarations/core/espresso';
import { Input } from '../../../../../espresso/declarations/typings/inputs';

declare const espresso: Espresso;

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
        label: 'Custom reward redeemed',
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
    slug: 'twitch:custom-reward',
    name: 'Custom reward',
    provider: 'Twitch',
    catigory: 'Rewards',
    version: '1.0.0',
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
