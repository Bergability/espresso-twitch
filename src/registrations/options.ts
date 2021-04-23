import fetch from 'node-fetch';
import { Espresso } from '../../../../espresso/declarations/core/espresso';
import { Option } from '../../../../espresso/declarations/typings/inputs';
import { bergsAccessToken, clientId, bergsId } from '../tokens';
import { CustomRewardPayload } from '../typings/api';

declare const espresso: Espresso;

espresso.options.register({
    slug: 'twitch:custom-rewards',
    get: () => {
        return new Promise((resovle, reject) => {
            fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${bergsId}`, {
                headers: {
                    'Client-Id': clientId,
                    Authorization: `Bearer ${bergsAccessToken}`,
                },
            })
                .then((res) => {
                    res.json()
                        .then((json) => {
                            const options = (json as CustomRewardPayload).data.reduce<Option[]>((acc, reward) => {
                                return [...acc, { text: reward.title, value: reward.id }];
                            }, []);
                            resovle(options);
                        })
                        .catch((e) => {
                            console.log(e);
                            reject(e);
                        });
                })
                .catch((e) => {
                    reject(e);
                });
        });
    },
});
