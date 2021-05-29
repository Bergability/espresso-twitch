import './triggers/chat';
import './triggers/hosts-raids';
// import './triggers/moderation';
import './triggers/rewards';
import './triggers/room-state';
import './triggers/subscriptions';

/**
 *
 * User joined chat
 *
 */
// interface TwitchUserJoinedChatSettings {
//     usernames: string[];
// }

// const twitchUserJoinedChatSettings: Input<TwitchUserJoinedChatSettings>[] = [
//     {
//         type: 'chips',
//         key: 'usernames',
//         default: [],
//         label: 'Users',
//         duplicates: false,
//         emptyText: 'No usernames set.',
//     },
// ];
// espresso.triggers.register({
//     slug: 'twitch:user-joined-chat',
//     name: 'User joined chat',
//     provider: 'Twitch',
//     catigory: 'Chat',
//     version: '1.0.0',
//     settings: twitchUserJoinedChatSettings,
//     variables: [{ name: 'username', description: 'The username of the user who joinned chat' }],
//     predicate: (data: { username: string }, settings: TwitchUserJoinedChatSettings) => {
//         return settings.usernames.reduce<boolean>((acc, u) => {
//             if (u.toLowerCase() === data.username.toLowerCase()) return true;
//             return acc;
//         }, false);
//     },
// });
