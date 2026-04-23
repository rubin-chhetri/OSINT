import axios from "axios";
import BaseAdapter from "./base.adapter.js";
import osintConfig from "../../config/osint.js";

class GithubAdapter extends BaseAdapter {
  constructor() {
    super("GitHub", "Code Footprint");
  }

  async fetch(query) {
    try {
      const response = await axios.get(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `token ${osintConfig.githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      // Limit to top 5 results to keep the report clean
      const items = response.data.items?.slice(0, 5) || [];
      return this.formatResult(items, `https://github.com/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error(`GitHub Error: ${error.message}`);
      return null;
    }
  }
}

export default new GithubAdapter();
