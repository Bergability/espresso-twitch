import fetch from 'node-fetch';
import { bergsAccessToken, clientId, bergsId } from '../tokens';
import { Espresso } from '../../../../espresso/declarations/core/espresso';

declare const espresso: Espresso;

espresso.server.register({
    path: '/twitch/new-custom-reward',
    method: 'get',
    response: (req, res) => {
        fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${bergsId}`, {
            method: 'POST',
            headers: {
                'Client-Id': clientId,
                Authorization: `Bearer ${bergsAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: 'Bot reward', cost: 100 }),
        })
            .then((r) => {
                r.json()
                    .then(() => {
                        res.send('New reward created!\n Check your rewards dashboard to edit the reward!');
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            })
            .catch((e) => {
                console.log(e);
            });
    },
});
