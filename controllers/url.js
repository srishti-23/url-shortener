// Ensure generateNewUrl and getAnalytics are defined and exported
const URL=require('../models/url')

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
async function redirectShortUrl(req,res){
  const {customAlias}=req.params 
  try{
    const result= await URL.findOne({ customAlias });
    console.log("Alias founded",result)
    if(!result){
      return res.status(404).json({message:"ALias not found"})
    }
    else{

      return res.redirect(result.longUrl);
      // return res.status(201).json({message:"longurl found"});
    }
  }
  catch (error) {
    // Handle server error
    console.error('Error while searching for alias:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
async function getAnalytics(req, res) {
  const { alias: shortId } = req.params;

  try {
      const result = await URL.findOne({ shortId });

      if (!result) {
          return res.status(404).json({ message: "URL not found" });
      }

      return res.json({
          totalClicks: result.visitHistory.length,
          analytics: result.visitHistory,
      });
  } catch (error) {
      console.error("Error in /analytics route:", error);
      res.status(500).json({ error: "Server error" });
  }
}

module.exports = { generateNewUrl, getAnalytics, redirectShortUrl };
