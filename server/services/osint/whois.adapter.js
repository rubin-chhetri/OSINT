import axios from "axios";
import BaseAdapter from "./base.adapter.js";
import osintConfig from "../../config/osint.js";

class WhoisAdapter extends BaseAdapter {
  constructor() {
    super("WhoisXML", "Technical Infrastructure");
  }

  async fetch(query) {
    let targetDomain = query.trim();

    // Logic: If there are spaces, convert to PascalCase (e.g., "Microsoft Corp" -> "MicrosoftCorp")
    if (targetDomain.includes(" ")) {
      targetDomain = targetDomain
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
    }

    // Logic: If no TLD, assume .com
    if (!targetDomain.includes(".")) {
      targetDomain = `${targetDomain}.com`;
    }



    const response = await axios.get(
      `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${osintConfig.whoisKey}&domainName=${targetDomain}&outputFormat=JSON`,
    );

    if (!response.data.WhoisRecord) {
      throw new Error(`No Whois record found for ${targetDomain}`);
    }

    return this.formatResult(
      response.data.WhoisRecord,
      `https://whois.com/whois/${targetDomain}`,
    );

  }
}

export default new WhoisAdapter();
