const Redis = require("ioredis");

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "172.26.27.86",
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    return Math.min(times * 100, 3000); // Reconnect after 3 seconds
  },
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

module.exports = {
  saveMessage: async (receiver_id, message) => {
    try {
      await redisClient.lpush(
        `messages:${receiver_id}`,
        JSON.stringify(message)
      );
    } catch (error) {
      console.error("Error saving message to Redis:", error);
    }
  },

  fetchMessages: async (user_id) => {
    try {
      const messages = await redisClient.lrange(`messages:${user_id}`, 0, -1);
      return messages.map((msg) => JSON.parse(msg));
    } catch (error) {
      console.error("Error fetching messages from Redis:", error);
      return [];
    }
  },
};
