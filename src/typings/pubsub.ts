export interface PubSubMessage {
    type: 'MESSAGE';
    data: {
        topic: string;
        message: string;
    };
}

export interface PubSubRewardRedemtion {
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

export type ParsedPubSubEvent = ParsedRewardRedeemed;
