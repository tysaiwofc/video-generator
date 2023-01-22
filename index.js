const generateVideo = require('./bots/video.js')
const uploader = require('./bots/poster.js')
const { config } = require('dotenv')
config()

const teste = async () => {
    await generateVideo('O Que é ' + 'Pão de queijo')
    //await uploader('jujubasuporte@gmail.com', '2004135MARS2022', 'o pão frances é', 'acesse o discord.gg/jujuba')
    //console.log('🔴 >>> GG, VIDEO FOI GERADO E POSTADO COM SUCESSO!')
}

teste()
