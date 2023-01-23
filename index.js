const generateVideo = require('./bots/video.js')
const { config } = require('dotenv')
const { WEBHOOK_URL, WEBHOOK_URL2 } = require('./env.json')
const questions = require('questions');
const { WebhookClient } = require('discord.js')



config()

const teste = async () => {
    questions.askOne({ info:'Qual vai ser o tema?' }, async function(result){
        await generateVideo('O Que é ' + result)
    })
}

teste()

