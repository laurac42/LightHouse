export type Address = {
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    post_code: string;
}

export type AddressLatandLong = {
    id: number;
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    post_code: string;
    latitude: number | null;
    longitude: number | null;
}

export type PersonalLocationAddress = {
    address_line_1: string | undefined;
    address_line_2?: string | null;
    city: string;
    post_code: string;
    nickname: string;
    travel_mode: string;
}