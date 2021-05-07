import path from 'path';
import { Espresso } from '../../../../espresso/declarations/core/espresso';
import TwitchAPIFetch from '../api';

declare const espresso: Espresso;

espresso.server.register({
    path: '/twitch/new-custom-reward',
    method: 'get',
    response: (req, res) => {
        // fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${bergsId}`, {
        //     method: 'POST',
        //     headers: {
        //         'Client-Id': clientId,
        //         Authorization: `Bearer ${bergsAccessToken}`,
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ title: 'Bot reward', cost: 100 }),
        // })
        //     .then((r) => {
        //         r.json()
        //             .then(() => {
        //                 res.send('New reward created!\n Check your rewards dashboard to edit the reward!');
        //             })
        //             .catch((e) => {
        //                 console.log(e);
        //             });
        //     })
        //     .catch((e) => {
        //         console.log(e);
        //     });

        const pluginDirPath = espresso.plugins.getPath('twitch');
        if (!pluginDirPath) {
            res.send('error file not found');
            return;
        }

        res.sendFile(path.join(pluginDirPath, 'public', 'new-custom-reward.html'));
    },
});

espresso.server.register({
    path: '/twitch/welcome',
    method: 'get',
    response: (req, res) => {
        const pluginDirPath = espresso.plugins.getPath('twitch');
        if (!pluginDirPath) {
            res.send('error file not found');
            return;
        }

        res.sendFile(path.join(pluginDirPath, 'public', 'welcome.html'));
    },
});

espresso.server.register({
    path: '/twitch/auth/main',
    method: 'get',
    response: (req, res) => {
        const { error } = req.query;

        const pluginDirPath = espresso.plugins.getPath('twitch');
        if (!pluginDirPath) {
            res.send('error file not found');
            return;
        }

        if (error) {
            res.sendFile(path.join(pluginDirPath, 'public', 'auth-fail.html'));
            return;
        }

        res.sendFile(path.join(pluginDirPath, 'public', 'auth-success.html'));
    },
});

espresso.server.register({
    path: '/twitch/auth/bot',
    method: 'get',
    response: (req, res) => {
        const { error } = req.query;

        const pluginDirPath = espresso.plugins.getPath('twitch');
        if (!pluginDirPath) {
            res.send('error file not found');
            return;
        }

        if (error) {
            res.sendFile(path.join(pluginDirPath, 'public', 'auth-fail.html'));
            return;
        }

        res.sendFile(path.join(pluginDirPath, 'public', 'auth-success.html'));
    },
});

espresso.server.register({
    path: '/api/twitch/auth',
    method: 'post',
    response: (req, res) => {
        const { token, account } = req.body;

        if (!token || !account) {
            res.status(400);
            res.json({});
            return;
        }

        if (account !== 'main' && account !== 'bot') {
            res.status(400);
            res.json({});
            return;
        }

        espresso.store.set(`twitch.${account}.token`, token);
        TwitchAPIFetch('https://api.twitch.tv/helix/users', 'get', undefined, token)
            .then((json) => {
                if (json.data[0]) {
                    const username = json.data[0].display_name;
                    const userId = json.data[0].id;
                    espresso.store.set(`twitch.${account}.username`, username);
                    espresso.store.set(`twitch.${account}.id`, userId);
                    res.json({ username, userId });
                    return;
                }

                res.json({});
            })
            .catch((e) => {
                console.log(e);
                res.json({});
            });
    },
});
