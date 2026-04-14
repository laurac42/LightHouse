export async function POST(req: Request) {
    const params = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return Response.json({ error: "API key not found" }, { status: 500 });
    }
    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.set("origins", `${params.lat1},${params.long1}`);
    url.searchParams.set("destinations", `${params.lat2},${params.long2}`);
    url.searchParams.set("mode", params.travel_mode);
    url.searchParams.set("key", apiKey);
    // do your Gemini call here
    const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await response.json();
    const element = data.rows[0].elements[0];
    if (element.status === "OK") {
        if (element.duration.value <= 3600) {
            data.distance = Math.round(element.duration.value / 60) + " minutes"; // convert seconds to minutes
        } else if (element.duration.value > 3600) {
            data.distance = (element.duration.value / 3600).toFixed(2) + " hours";
        }
        
    } else {
        data.distance = null;
    }
    return Response.json(data);
}