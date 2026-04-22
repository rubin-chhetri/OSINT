import axios from "axios";
import BaseAdapter from "./base.adapter.js";
import osintConfig from "../../config/osint.js";

class NewsAdapter extends BaseAdapter {
  constructor() {
    super("NewsAPI", "Contextual & Regulatory");
  }

  async fetch(query) {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${query}&apiKey=${osintConfig.newsKey}&pageSize=5`,
      );

      return this.formatResult(
        response.data.articles,
        `https://news.google.com/search?q=${query}`,
      );
    } catch (error) {
      console.error(`News Error: ${error.message}`);
      return null;
    }
  }
}

export default new NewsAdapter();
