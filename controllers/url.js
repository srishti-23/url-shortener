// Ensure generateNewUrl and getAnalytics are defined and exported
const URL = require("../models/url");
const userAgent = require("useragent");
const os = require("os");
const redis = require("../config/redis");

async function generateNewUrl(req, res) {
  const { nanoid } = await import("nanoid");
  const shortId = nanoid();
  const { longUrl, customAlias, topic } = req.body;

  if (!longUrl) {
    return res.status(400).json({ message: "longUrl is required" });
  }

  try {
    // Check for custom alias conflicts
    if (customAlias) {
      const existingAlias = await URL.findOne({ customAlias });
      if (existingAlias) {
        return res
          .status(400)
          .json({ message: "Custom alias is already in use" });
      }
    }

    const newUrl = await URL.create({
      longUrl,
      shortId,
      customAlias: customAlias || null,
      topic,
    });

    return res.status(201).json({
      shortId: newUrl.shortId,
      customAlias: newUrl.customAlias,
      createdAt: newUrl.createdAt,
    });
  } catch (error) {
    console.error("Error in /shorten route:", error);
    res.status(500).json({ error: "Server error" });
  }
}
async function redirectShortUrl(req, res) {
  const { customAlias } = req.params;
  try {
    const cachedLongUrl = await redis.get(customAlias); // Fetch from Redis cache
    if (cachedLongUrl) {
      console.log("Cache hit");
      return res.redirect(cachedLongUrl);
    }

    // Fetch from MongoDB if not in cache
    console.log("Cache miss");
    const result = await URL.findOne({ customAlias });
    console.log("Alias found:", result);

    if (!result) {
      return res.status(404).json({ message: "Alias not found" });
    }

    const userAgentHeader = req.headers["userAgent"] || "";
    const ua = userAgent.parse(userAgentHeader);

    console.log("Parsed User-Agent:", ua);

    const osName = ua.os?.name || "Unknown";
    const deviceName = ua.device?.type || "Unknown";

    console.log("OS Name:", osName);
    console.log("Device Type:", deviceName);

    result.visitHistory.push({
      timestamp: new Date(),
      osName,
      deviceName,
      userId: req.user?.id || "anonymous",
      action: "redirect",
    });

    result.totalClicks += 1;
    await result.save();

    console.log("Updated totalClicks:", result.totalClicks);

    // Corrected Redis set with result.longUrl
    await redis.set(customAlias, result.longUrl, "EX", 3600);
    
    return res.redirect(result.longUrl);
  } catch (error) {
    console.error("Error while searching for alias:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getAnalytics(req, res) {
  const { alias } = req.params;

  try {
    const cachedData = await redis.get(`analytics:${alias}`);
    if (cachedData) {
      console.log("Cache hit for alias:", alias);
      return res.json(JSON.parse(cachedData));
    }

    // Cache miss, fetch from DB
    console.log("Cache miss for alias:", alias);
    const result = await URL.findOne({ customAlias: alias });

    if (!result) {
      return res.status(404).json({ message: "URL not found" });
    }

    const visitHistory = result.visitHistory || [];
    const totalClicks = visitHistory.length;
    const uniqueClicks = new Set(
      visitHistory.map((visit) => visit.userId).filter(Boolean)
    ).size;

    const today = new Date();
    const recent7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toISOString().split("T")[0];
    });

    const clicksByDate = recent7Days.map((date) => ({
      date,
      clickCount: visitHistory.filter(
        (visit) => visit.date && visit.date.startsWith(date)
      ).length,
    }));

    const osType = calculateOsTypeAnalytics(visitHistory);
    const deviceType = calculateDeviceTypeAnalytics(visitHistory);

    const serverDetails = getServerDetails();

    const response = {
      totalClicks,
      uniqueClicks,
      clicksByDate,
      osType,
      deviceType,
      serverDetails,
    };

    // Cache response
    await redis.set(`analytics:${alias}`, JSON.stringify(response), "EX", 3600);

    return res.json(response);
  } catch (error) {
    console.error("Error in /analytics route:", error);
    res.status(500).json({ error: "Server error" });
  }
}
function calculateOsTypeAnalytics(visitHistory) {
  const osTypeMap = {};
  visitHistory.forEach((visit) => {
    if (visit.osName) {
      if (!osTypeMap[visit.osName]) {
        osTypeMap[visit.osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
      }
      osTypeMap[visit.osName].uniqueClicks += 1;
      osTypeMap[visit.osName].uniqueUsers.add(visit.userId);
    }
  });
  return Object.entries(osTypeMap).map(([osName, data]) => ({
    osName,
    uniqueClicks: data.uniqueClicks,
    uniqueUsers: data.uniqueUsers.size,
  }));
}
function calculateDeviceTypeAnalytics(visitHistory) {
  const deviceTypeMap = {};
  visitHistory.forEach((visit) => {
    if (visit.deviceType) {
      if (!deviceTypeMap[visit.deviceType]) {
        deviceTypeMap[visit.deviceType] = {
          uniqueClicks: 0,
          uniqueUsers: new Set(),
        };
      }
      deviceTypeMap[visit.deviceType].uniqueClicks += 1;
      deviceTypeMap[visit.deviceType].uniqueUsers.add(visit.userId);
    }
  });
  return Object.entries(deviceTypeMap).map(([deviceName, data]) => ({
    deviceName,
    uniqueClicks: data.uniqueClicks,
    uniqueUsers: data.uniqueUsers.size,
  }));
}
function getServerDetails() {
  const os = require("os");
  return {
    platform: os.platform(),
    arch: os.arch(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
    cpus: os.cpus().length,
  };
}
async function getTopicBasedAnalytics(req, res) {
  const { topic } = req.params;

  try {
    // Check cache
    const cachedData = await redis.get(`topicAnalytics:${topic}`);
    if (cachedData) {
      console.log("Cache hit for topic:", topic);
      return res.json(JSON.parse(cachedData));
    }

    // Cache miss
    console.log("Cache miss for topic:", topic);
    const urls = await URL.find({ topic });

    if (!urls || urls.length === 0) {
      return res.status(404).json({ message: "No URLs found for this topic" });
    }

    const analytics = urls.map((url) => {
      const visitHistory = url.visitHistory || [];
      const totalClicks = visitHistory.length;
      const uniqueClicks = new Set(
        visitHistory.map((visit) => visit.userId).filter(Boolean)
      ).size;

      return {
        url: url.shortenedURL,
        totalClicks,
        uniqueClicks,
        clicksByDate: calculateClicksByDate(visitHistory),
        osType: calculateOsTypeAnalytics(visitHistory),
        deviceType: calculateDeviceTypeAnalytics(visitHistory),
      };
    });

    const serverDetails = getServerDetails();

    const response = { topic, urls: analytics, serverDetails };

    // Cache response
    await redis.set(
      `topicAnalytics:${topic}`,
      JSON.stringify(response),
      "EX",
      3600
    );

    return res.json(response);
  } catch (error) {
    console.error("Error in /topic analytics route:", error);
    res.status(500).json({ error: "Server error" });
  }
}
function calculateClicksByDate(visitHistory) {
  return visitHistory.reduce((acc, visit) => {
    const date = new Date(visit.timestamp).toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
}

async function getOverallAnalytics(req, res) {
  const cacheKey = "overallAnalytics";

  try {
    // Check cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for overall analytics");
      return res.json(JSON.parse(cachedData));
    }

    console.log("Cache miss for overall analytics");
    const urls = await URL.find({});
    if (!urls || urls.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    const totalClicks = urls.reduce(
      (sum, url) => sum + (url.visitHistory || []).length,
      0
    );
    const uniqueUsers = new Set(
      urls.flatMap((url) => url.visitHistory.map((visit) => visit.userId))
    );

    const response = {
      totalClicks,
      uniqueUsers: uniqueUsers.size,
      serverDetails: getServerDetails(),
    };

    // Cache response
    await redis.set(cacheKey, JSON.stringify(response), "EX", 3600);

    return res.json(response);
  } catch (error) {
    console.error("Error in overall analytics:", error);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  generateNewUrl,
  getAnalytics,
  redirectShortUrl,
  getTopicBasedAnalytics,
  getOverallAnalytics,
};
