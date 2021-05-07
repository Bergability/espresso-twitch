import { Espresso } from '../../../../espresso/declarations/core/espresso';
import { Option } from '../../../../espresso/declarations/typings/inputs';
import { CustomRewardPayload } from '../typings/api';
import TwitchAPIFetch from '../api';

declare const espresso: Espresso;

espresso.options.register({
    slug: 'twitch:custom-rewards',
    get: async () => {
        const mainId = espresso.store.get('twitch.main.id');
        if (mainId === null) return [];

        try {
            const json = await TwitchAPIFetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${mainId}`, 'GET');
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
        const mainId = espresso.store.get('twitch.main.id');
        if (mainId === null) return [];

        try {
            const json = await TwitchAPIFetch(
                `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${mainId}&only_manageable_rewards=true`,
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
