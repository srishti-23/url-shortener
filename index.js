const express = require('express');
const urlRouter = require('./routes/url');
const { mongoDbConnect } = require('./config/db');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes')
const URL = require('./models/url');

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use('/auth', authRoutes);

mongoDbConnect('mongodb://localhost:27017/urlShortener')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection failed:', err));

const PORT = 8000;

app.use('/api', urlRouter);

app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;

    try {
        // Find the URL entry based on shortId
        const entry = await URL.findOneAndUpdate(
            { shortId },
            { $push: { visitHistory: { timestamp: new Date(), action: 'visited' } } },
            { new: true } // Return the updated document
        );

        if (!entry) {
            return res.status(404).send('Short URL not found');
        }

        // Redirect to the original URL
        res.redirect(entry.redirectUrl);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
