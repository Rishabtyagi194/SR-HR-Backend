import axios from "axios";
import { getKeywordSuggestions } from "../services/redisService.js";

export const locationController = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) return res.json([]);

    // Geoapify API Call
    const response = await axios.get(
      "https://api.geoapify.com/v1/geocode/autocomplete",
      {
        params: {
          text: q,
          apiKey: process.env.GEOAPIFY_API_KEY,
          limit: 8
        }
      }
    );

    await getKeywordSuggestions(keyword);
    
    const results = response.data.features.map(item => ({
      name: item.properties.formatted,
      city: item.properties.city,
      country: item.properties.country,
      lat: item.properties.lat,
      lng: item.properties.lon
    }));

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Location search failed" });
  }
}

