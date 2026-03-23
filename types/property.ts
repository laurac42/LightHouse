import { Database } from "@/types/supabase";

export type Property = Database["public"]["Tables"]["properties"]["Row"];

export type EditableProperty = Pick<
    Database["public"]["Tables"]["properties"]["Row"],
    | "title"
    | "description"
    | "price"
    | "price_type"
    | "address_line_1"
    | "address_line_2"
    | "city"
    | "post_code"
    | "epc_rating"
    | "council_tax_band"
    | "num_bedrooms"
    | "num_bathrooms"
    | "square_feet"
    | "property_type"
    | "has_garage"
    | "is_new_build"
    | "features"
>;

export type AddableProperty = Pick<
    Database["public"]["Tables"]["properties"]["Row"],
    | "title"
    | "description"
    | "price"
    | "price_type"
    | "address_line_1"
    | "address_line_2"
    | "city"
    | "post_code"
    | "epc_rating"
    | "council_tax_band"
    | "num_bedrooms"
    | "num_bathrooms"
    | "square_feet"
    | "property_type"
    | "has_garage"
    | "is_new_build"
    | "features"
    | "status"
    | "seller_id"
>;