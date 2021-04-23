export interface CustomReward {
    broadcaster_name: string;
    broadcaster_login: string;
    broadcaster_id: string;
    id: string;
    image: any[];
    background_color: string;
    is_enabled: boolean;
    cost: number;
    title: string;
    prompt: string;
    is_user_input_required: boolean;
    max_per_stream_setting: any[];
    max_per_user_per_stream_setting: any[];
    global_cooldown_setting: any[];
    is_paused: boolean;
    is_in_stock: boolean;
    default_image: any[];
    should_redemptions_skip_request_queue: boolean;
    redemptions_redeemed_current_stream?: any;
    cooldown_expires_at?: any;
}

export interface CustomRewardPayload {
    data: CustomReward[];
}
