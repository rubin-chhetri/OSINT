// services/osint/base.adapter.js
export default class BaseAdapter {
  constructor(name, category) {
    this.name = name;
    this.category = category;
  }

  /**
   * Standardizes the output so the frontend always knows what to expect
   */
  formatResult(data, sourceUrl = null) {
    return {
      source: this.name,
      category: this.category,
      data: data,
      sourceUrl,
      timestamp: new Date(),
    };
  }
}
