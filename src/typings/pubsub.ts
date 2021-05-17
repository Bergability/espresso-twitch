export interface PubSubMessage {
    type: 'MESSAGE' | 'PONG' | 'RECONNECT';
    data: {
        topic: string;
        message: string;
    };
}

/**
 *
 * Reward redemption
 *
 */
export interface PubSubRewardRedemtion {
    topic: string;
    timestamp: string;
    redemption: {
        id: string;
        user: {
            id: string;
            login: string;
            display_name: string;
        };
        channel_id: string;
        redeemed_at: string;
        reward: {
            id: string;
            channel_id: string;
            title: string;
            prompt: string;
            cost: number;
            is_user_input_required: boolean;
            is_sub_only: boolean;
            image?: any;
            default_image: {
                url_1x: string;
                url_2x: string;
                url_4x: string;
            };
            background_color: string;
            is_enabled: boolean;
            is_paused: boolean;
            is_in_stock: boolean;
            max_per_stream: {
                is_enabled: boolean;
                max_per_stream: number;
            };
            should_redemptions_skip_request_queue: boolean;
            template_id?: any;
            updated_for_indicator_at: string;
            max_per_user_per_stream: {
                is_enabled: boolean;
                max_per_user_per_stream: number;
            };
            global_cooldown: {
                is_enabled: boolean;
                global_cooldown_seconds: number;
            };
            redemptions_redeemed_current_stream?: any;
            cooldown_expires_at?: any;
        };
        status: string;
    };
}

export interface ParsedRewardRedeemed {
    type: 'reward-redeemed';
    data: PubSubRewardRedemtion;
}

/**
 *
 * Moderation event
 *
 */
export interface PubSubModerationEvent {
    type: 'chat_login_moderation';
    topic: string;
    moderation_action: 'ban' | 'unban' | 'timeout' | string;
    args: [string, string, string];
    created_by: string;
    created_by_user_id: string;
    created_at: string;
    msg_id: string;
    target_user_id: string;
    target_user_login: string;
    from_automod: boolean;
}

export interface ParsedModerationEvent {
    type: 'moderation_action';
    data: PubSubModerationEvent;
}

/**
 *
 * Bits event
 *
 */
export interface BitsEventData {
    topic: string;
    user_name: string;
    channel_name: string;
    user_id: string;
    channel_id: string;
    time: string;
    chat_message: string;
    bits_used: number;
    total_bits_used: number;
    is_anonymous: boolean;
    context: 'cheer';
    badge_entitlement: null;
}

export interface ParsedBitsEvent {
    version: string;
    message_type: 'bits_event';
    message_id: string;
    data: BitsEventData;
}

/**
 *
 * Sub event
 *
 */
export interface TwitchEmote {
    start: number;
    end: number;
    id: number;
}
export interface SubMessage {
    message: string;
    emotes: TwitchEmote[] | null;
}

export interface ParsedNormalSubEvent {
    user_name: string;
    display_name: string;
    channel_name: string;
    user_id: string;
    channel_id: string;
    time: string;
    sub_plan: 'Prime' | '1000' | '2000' | '3000';
    sub_plan_name: string;
    cumulative_months: number;
    streak_months: number;
    context: 'sub' | 'resub';
    is_gift: false;
    sub_message: SubMessage;
}

export interface ParsedGiftSubEvent {
    user_name: string;
    display_name: string;
    channel_name: string;
    user_id: string;
    channel_id: string;
    time: string;
    sub_plan: '1000' | '2000' | '3000';
    sub_plan_name: string;
    months: number;
    context: 'subgift' | 'resubgift';
    is_gift: true;
    sub_message: SubMessage;
    recipient_id: string;
    recipient_user_name: string;
    recipient_display_name: string;
    multi_month_duration?: number;
}

export interface ParsedAnonGiftSubEvent {
    channel_name: string;
    channel_id: string;
    time: string;
    sub_plan: '1000' | '2000' | '3000';
    sub_plan_name: string;
    months: number;
    context: 'anonsubgift' | 'anonresubgift';
    is_gift: true;
    sub_message: SubMessage;
    recipient_id: string;
    recipient_user_name: string;
    recipient_display_name: string;
    multi_month_duration?: number;
}

export type ParsedSubEvent = ParsedNormalSubEvent | ParsedGiftSubEvent | ParsedAnonGiftSubEvent;

export type ParsedPubSubEvent = ParsedRewardRedeemed | ParsedModerationEvent | ParsedBitsEvent | ParsedSubEvent;
