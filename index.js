const generateVideo = require('./bots/video.js')
const { config } = require('dotenv')
const { WEBHOOK_URL, WEBHOOK_URL2 } = require('./env.json')
const questions = require('questions');
const { WebhookClient } = require('discord.js')
const generateeRoteiro = require('./bots/roteiro.js')
const getTrends = require('./bots/trends.js')
require('./openai.js')

config()

const teste = async () => {
    questions.askOne({ info:'\n\n[ 1 ] Gerador de videos\n[ 2 ] Verificar assuntos mais falados na internet\n[ 3 ] Criar roteiro para o youtube\n\nEscolha uma opção digitando um numero' }, async function(result){
        if(result === '1') {
            questions.askOne({ info: "Digite um tema para seu video" }, async (re) => {
                await generateVideo('O Que é ' + re)
                setTimeout(() => {
                    teste()
                 }, 2000)  
            })
        } else if(result === '3') {
            questions.askOne({ info: "Qual o tema do roteiro?"}, async (tema) => {
             await generateeRoteiro(tema)
             setTimeout(() => {
                teste()
             }, 2000) 
            })
        } else if(result === '2') {
            await getTrends('BR')
            setTimeout(() => {
                teste()
             }, 2000) 
        }
        
    })
}

teste() 

