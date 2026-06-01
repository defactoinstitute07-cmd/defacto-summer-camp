const NodeCache = require("node-cache");

// Shared match and score cache instance
const matchCache = new NodeCache({ stdTTL: 5 }); // 5 seconds default TTL

module.exports = matchCache;
