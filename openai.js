const { Configuration, OpenAIApi } = require("openai");
const { API_KEY } = require('./env.json');
const configuration = new Configuration({
    apiKey: API_KEY,
  });
const openai = new OpenAIApi(configuration);

module.exports = openai