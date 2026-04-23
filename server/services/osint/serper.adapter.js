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
        { q: query, num: 20 },
        {
          headers: {
            "X-API-KEY": osintConfig.serperKey,
            "Content-Type": "application/json",
          },
        },
      );

      // Format results and identify platforms (Entity Resolution Phase I)
      const formattedResults = (response.data.organic || []).map((item) => {
        let platform = "Web";
        if (item.link.includes("linkedin.com")) platform = "LinkedIn";
        else if (item.link.includes("twitter.com") || item.link.includes("x.com")) platform = "Twitter/X";
        else if (item.link.includes("facebook.com")) platform = "Facebook";
        else if (item.link.includes("instagram.com")) platform = "Instagram";
        else if (item.link.includes("github.com")) platform = "GitHub";

        return {
          ...item,
          platform,
        };
      });

      return this.formatResult(formattedResults, "https://google.com");
    } catch (error) {
      console.error(`Serper Error: ${error.message}`);
      return null; // Return null so the orchestrator can filter it out
    }
  }
}

export default new SerperAdapter();
