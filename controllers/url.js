const URL = require("../models/url");

async function generateNewUrl(req, res) {
  const { nanoid } = await import("nanoid");
  const shortID = nanoid();
  const body = req.body;
  if (!body.url) return res.status(400).json({ message: `url is expected` });

  await URL.create({
    shortId: shortID,
    redirectUrl: body.url,
    visitHistory: [],
    totalClicks: action
  });
  return res.send({ id: shortID });
}
async function getAnalytics(req,res){
    const shortId=req.params.shortId
    const result=await URL.findOne({shortId})
    return res.json({
        totalClicks:result.visitHistory.length,
        analytics:result.visitHistory
    })

}

module.exports = generateNewUrl,getAnalytics;
