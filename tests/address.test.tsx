// !! run using 'npm test'

import { getAgentAddress } from "../scripts/address_format";

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
  })),
}));

describe("getAgentAddress", () => {
    it("should extract address details with one address line", () => {
        const address = "165 High Street Arbroath DD11 1DR";
        const result = getAgentAddress(address);
        expect(result).toEqual({
            addressLine1: "165 High Street",
            addressLine2: "",
            city: "Arbroath",
            postcode: "DD11 1DR"
        });
    });

    it("should handle addresses with commas", () => {
        const address = "28 Marywell Brae, Kirriemuir DD8 4BP";
        const result = getAgentAddress(address);
        expect(result).toEqual({
            addressLine1: "28 Marywell Brae",
            addressLine2: "",
            city: "Kirriemuir",
            postcode: "DD8 4BP"
        });
    });

    it("should handle addresses with multiple numbers", () => {
        const address = "2 India Buildings 86 Bell Street Dundee DD1 1JQ";
        const result = getAgentAddress(address);
        expect(result).toEqual({
            addressLine1: "2 India Buildings",
            addressLine2: "86 Bell Street",
            city: "Dundee",
            postcode: "DD1 1JQ"
        });
    });

    it("should handle addresses with multiple address lines but one number", () => {
        const address = "Whitehall House, 33 Yeaman Shore Dundee DD1 4BJ";
        const result = getAgentAddress(address);
        expect(result).toEqual({
            addressLine1: "Whitehall House",
            addressLine2: "33 Yeaman Shore",
            city: "Dundee",
            postcode: "DD1 4BJ"
        });
    });
});