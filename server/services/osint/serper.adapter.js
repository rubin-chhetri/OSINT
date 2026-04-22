// services/osint/serper.adapter.js
import axios from "axios";
import BaseAdapter from "./base.adapter.js";
import osintConfig from "../../config/osint.js";

class SerperAdapter extends BaseAdapter {
  constructor() {
    super("Google Search", "Social & Public Footprint");
  }

  async fetch(query) {
    try {
      const response = await axios.post(
        "https://google.serper.dev/search",
        { q: query },
        {
          headers: {
            "X-API-KEY": osintConfig.serperKey,
            "Content-Type": "application/json",
          },
        },
      );

      // We return formatted results (organic search entries)
      return this.formatResult(response.data.organic, "https://google.com");
    } catch (error) {
      console.error(`Serper Error: ${error.message}`);
      return null; // Return null so the orchestrator can filter it out
    }
  }
}

export default new SerperAdapter();
