import { Espresso } from '../../../../espresso/declarations/core/espresso';
import { Option } from '../../../../espresso/declarations/typings/inputs';
import { bergsId } from '../tokens';
import { CustomRewardPayload } from '../typings/api';
import TwitchAPIFetch from '../api';

declare const espresso: Espresso;

espresso.options.register({
    slug: 'twitch:custom-rewards',
    get: async () => {
        try {
            const json = await TwitchAPIFetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${bergsId}`, 'GET');
            const options = (json as CustomRewardPayload).data.reduce<Option[]>((acc, reward) => {
                return [...acc, { text: reward.title, value: reward.id }];
            }, []);
            return options;
        } catch (e) {
            console.log(e);
            return [];
        }
    },
});

espresso.options.register({
    slug: 'twitch:custom-rewards-accessible',
    get: async () => {
        try {
            const json = await TwitchAPIFetch(
                `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${bergsId}&only_manageable_rewards=true`,
                'GET'
            );
            const options = (json as CustomRewardPayload).data.reduce<Option[]>((acc, reward) => {
                return [...acc, { text: reward.title, value: reward.id }];
            }, []);
            return options;
        } catch (e) {
            console.log(e);
            return [];
        }
    },
});
