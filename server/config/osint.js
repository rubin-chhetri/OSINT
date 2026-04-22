import dotenv from "dotenv";
dotenv.config();

const osintConfig = {
  serperKey: process.env.SERPER_API_KEY,
  whoisKey: process.env.WHOIS_API_KEY,
  githubToken: process.env.GITHUB_TOKEN,
  newsKey: process.env.NEWS_API_KEY,

  // You can add default limits or settings here too
  searchLimit: 10,
};

export default osintConfig;
