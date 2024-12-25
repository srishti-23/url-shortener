// Ensure generateNewUrl and getAnalytics are defined and exported
const URL = require("../models/url");
const userAgent = require("useragent");
const os= require("os")


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
// async function redirectShortUrl(req, res) {
//   const { customAlias } = req.params;
//   try {
//     const result = await URL.findOne({ customAlias });
//     console.log("Alias founded", result);
//     if (!result) {
//       return res.status(404).json({ message: "ALias not found" });
//     }
//     const ua = userAgent.parse(req.headers["user-agent"]);
//     console.log("Parsed User-Agent:", ua);
//     console.log("OS Name:", ua.os.name);
//     console.log("Device Type:", ua.device.type);
//     // const osName = ua.os.name || "Unknown";
//     // const deviceName = ua.device.type || "Unknown";
//     result.visitHistory.push({
//       timestamp: new Date(),
//       osName,
//       deviceName,
//       userId: req.user?.id || "anonymous",
//       action: "redirect",
//     });
//     result.totalClicks += 1; // Increment totalClicks
//     await result.save();
//     console.log("Updated totalClicks:", result.totalClicks);
//     return res.redirect(result.longUrl);
//   } catch (error) {
//     // Handle server error
//     console.error("Error while searching for alias:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// }
async function redirectShortUrl(req, res) {
  const { customAlias } = req.params;
  try {
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
    return res.redirect(result.longUrl);
  } catch (error) {
    console.error("Error while searching for alias:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getAnalytics(req, res) {
  const { alias } = req.params;

  try {
    // Find the URL with the given alias
    const result = await URL.findOne({ customAlias: alias });

    if (!result) {
      return res.status(404).json({ message: "URL not found" });
    }

    const visitHistory = result.visitHistory || []; // Default to an empty array if undefined
    const totalClicks = visitHistory.length;

    // Get unique clicks based on user identifiers
    const uniqueClicks = new Set(
      visitHistory.map((visit) => visit.userId).filter(Boolean) // Ensure userId is valid
    ).size;

    // Group clicks by date (recent 7 days)
    const today = new Date();
    const recent7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toISOString().split("T")[0];
    });

    const clicksByDate = recent7Days.map((date) => ({
      date,
      clickCount: visitHistory.filter(
        (visit) => visit.date && visit.date.startsWith(date) // Check if date exists and starts with current date
      ).length,
    }));

    // OS type analytics
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

    const osType = Object.entries(osTypeMap).map(([osName, data]) => ({
      osName,
      uniqueClicks: data.uniqueClicks,
      uniqueUsers: data.uniqueUsers.size,
    }));

    // Device type analytics
    const deviceTypeMap = {};
    visitHistory.forEach((visit) => {
      if (visit.deviceType) {
        if (!deviceTypeMap[visit.deviceType]) {
          deviceTypeMap[visit.deviceType] = { uniqueClicks: 0, uniqueUsers: new Set() };
        }
        deviceTypeMap[visit.deviceType].uniqueClicks += 1;
        deviceTypeMap[visit.deviceType].uniqueUsers.add(visit.userId);
      }
    });

    const deviceType = Object.entries(deviceTypeMap).map(([deviceName, data]) => ({
      deviceName,
      uniqueClicks: data.uniqueClicks,
      uniqueUsers: data.uniqueUsers.size,
    }));

    // Server OS Details using os module
    const serverDetails = {
      platform: os.platform(), // OS platform
      arch: os.arch(), // CPU architecture
      totalMemory: os.totalmem(), // Total memory
      freeMemory: os.freemem(), // Free memory
      uptime: os.uptime(), // Server uptime in seconds
      cpus: os.cpus().length, // Number of CPU cores
    };

    // Send the response
    return res.json({
      totalClicks,
      uniqueClicks,
      clicksByDate,
      osType,
      deviceType,
      serverDetails,
    });
  } catch (error) {
    console.error("Error in /analytics route:", error);
    res.status(500).json({ error: "Server error" });
  }
}




async function getTopicBasedAnalytics(req, res) {
  const { topic } = req.params;

  try {
    // Fetch all URLs matching the topic
    const urls = await URL.find({ topic });

    if (!urls || urls.length === 0) {
      return res.status(404).json({ message: "No URLs found for this topic" });
    }

    // Prepare analytics for each URL under the topic
    const analytics = urls.map((url) => {
      const visitHistory = url.visitHistory || []; // Default to an empty array if undefined
      const totalClicks = visitHistory.length;
      const uniqueClicks = new Set(
        visitHistory.map((visit) => visit.userId).filter(Boolean) // Ensure userId is valid
      ).size;
      const clicksByDate = visitHistory.reduce((acc, visit) => {
        const date = new Date(visit.timestamp).toISOString().split("T")[0]; // Format as YYYY-MM-DD
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      const osType = visitHistory.reduce((acc, visit) => {
        const os = visit.os || "Unknown";
        acc[os] = (acc[os] || 0) + 1;
        return acc;
      }, {});
      const deviceType = visitHistory.reduce((acc, visit) => {
        const device = visit.deviceType || "Unknown";
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {});

      return {
        url: url.shortenedURL,
        totalClicks,
        uniqueClicks,
        clicksByDate,
        osType,
        deviceType,
      };
    });

    // Add server details using os module
    const serverDetails = {
      platform: os.platform(), // OS platform (e.g., 'linux', 'darwin', 'win32')
      architecture: os.arch(), // CPU architecture (e.g., 'x64', 'arm')
      cpuCount: os.cpus().length, // Number of CPU cores
      totalMemory: os.totalmem(), // Total memory in bytes
      freeMemory: os.freemem(), // Free memory in bytes
      uptime: os.uptime(), // Server uptime in seconds
    };

    // Respond with the analytics data and server details
    return res.json({
      topic,
      urls: analytics,
      serverDetails, // Include server environment insights
    });
  } catch (error) {
    console.error("Error in /topic analytics route:", error);
    res.status(500).json({ error: "Server error" });
  }
}

async function getOverallAnalytics(req, res) {
  try {
    // Fetch all URLs
    const urls = await URL.find({});
    console.log("request received");
    console.log(urls);

    if (!urls || urls.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    // Total number of URLs
    const totalUrls = urls.length;

    // Calculate total clicks and unique clicks across all URLs
    let totalClicks = 0;
    const uniqueUserSet = new Set();
    const clicksByDate = {};
    const osAnalytics = {};
    const deviceAnalytics = {};

    urls.forEach((url) => {
      const visitHistory = url.visitHistory || [];

      // Total clicks
      totalClicks += visitHistory.length;

      // Unique users
      visitHistory.forEach((visit) => {
        if (visit.userId) {
          uniqueUserSet.add(visit.userId);
        }

        // Group clicks by date
        const date = new Date(visit.timestamp).toISOString().split("T")[0];
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;

        // OS Analytics
        const osName = visit.os || "Unknown";
        if (!osAnalytics[osName]) {
          osAnalytics[osName] = {
            osName,
            uniqueClicks: 0,
            uniqueUsers: new Set(),
          };
        }
        osAnalytics[osName].uniqueClicks += 1;
        if (visit.userId) {
          osAnalytics[osName].uniqueUsers.add(visit.userId);
        }

        // Device Analytics
        const deviceName = visit.deviceType || "Unknown";
        if (!deviceAnalytics[deviceName]) {
          deviceAnalytics[deviceName] = {
            deviceName,
            uniqueClicks: 0,
            uniqueUsers: new Set(),
          };
        }
        deviceAnalytics[deviceName].uniqueClicks += 1;
        if (visit.userId) {
          deviceAnalytics[deviceName].uniqueUsers.add(visit.userId);
        }
      });
    });

    // Add server details using os module
    const serverDetails = {
      platform: os.platform(), // OS platform (e.g., 'linux', 'darwin', 'win32')
      architecture: os.arch(), // CPU architecture (e.g., 'x64', 'arm')
      cpuCount: os.cpus().length, // Number of CPU cores
      totalMemory: os.totalmem(), // Total memory in bytes
      freeMemory: os.freemem(), // Free memory in bytes
      uptime: os.uptime(), // Server uptime in seconds
    };

    // Prepare the response
    const response = {
      totalUrls,
      totalClicks,
      uniqueClicks: uniqueUserSet.size,
      clicksByDate: Object.entries(clicksByDate).map(([date, count]) => ({
        date,
        totalClicks: count,
      })),
      osType: Object.values(osAnalytics).map(
        ({ osName, uniqueClicks, uniqueUsers }) => ({
          osName,
          uniqueClicks,
          uniqueUsers: uniqueUsers.size,
        })
      ),
      deviceType: Object.values(deviceAnalytics).map(
        ({ deviceName, uniqueClicks, uniqueUsers }) => ({
          deviceName,
          uniqueClicks,
          uniqueUsers: uniqueUsers.size,
        })
      ),
      serverDetails, // Include server details
    };

    return res.json(response);
  } catch (error) {
    console.error("Error in getting overall analytics:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  generateNewUrl,
  getAnalytics,
  redirectShortUrl,
  getTopicBasedAnalytics,
  getOverallAnalytics,
};
