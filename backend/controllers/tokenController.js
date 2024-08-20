const Token = require('../models/Token');

exports.saveTokens = async (req, res) => {
  const { userAddress, tokens } = req.body;
  try {
    await Token.findOneAndUpdate(
      { userAddress },
      { tokens },
      { upsert: true }
    );
    res.status(200).send('Tokens saved');
  } catch (err) {
    res.status(500).send('Error saving tokens');
  }
};

exports.getTokens = async (req, res) => {
  const { userAddress } = req.query;
  try {
    const result = await Token.findOne({ userAddress });
    res.status(200).json(result ? result.tokens : []);
  } catch (err) {
    res.status(500).send('Error fetching tokens');
  }
};
