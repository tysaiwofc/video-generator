const c = require('colors')
const express = require('express')
const google = require('googleapis').google
const fs = require('fs')
const youtube = google.youtube({ version: 'v3'})
const content = require('../env.json')

const OAuth2 = google.auth.OAuth2


async function youtubeUploader(tema) {
  console.log('[ YOUTUBE ] Iniciando youtube...')


  await authenticateOAuth2()
  const videoInformation = await upload(tema)

  async function authenticateOAuth2() {
    const webServer = await startServer()
    const OAuthClient = await createOAuth2Client()
    requestConsent(OAuthClient)
    const authorizationToken = await waitAuth(webServer)
    await requestAuth(OAuthClient, authorizationToken)
    await setAuth(OAuthClient)
    await stopServer(webServer)

    async function startServer() {
      return new Promise((resolve, reject) => {
        const port = 80
        const app = express()

        const server = app.listen(port, () => {
          console.log(c.red(`[ YOUTUBE ] Porta aberta em http://localhost:${port}`))

          resolve({
            app,
            server
          })
        })
      })
    }

    async function createOAuth2Client() {
      const credentials = require('../client_secret.json')

      const OAuthClient = new OAuth2(
        credentials.web.client_id,
        credentials.web.client_secret,
        credentials.web.redirect_uris[0]
      )

      return OAuthClient
    }

    function requestConsent(OAuthClient) {
      const consentUrl = OAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube']
      })

      console.log(c.red(`[ YOUTUBE ] Acesse este link para authenticar: ${consentUrl}`))
    }

    async function waitAuth(webServer) {
      return new Promise((resolve, reject) => {
        console.log('[ YOUTUBE ] Esperando authenticação...')

        webServer.app.get('/callback', (req, res) => {
          const authCode = req.query.code
          console.log(c.red(`[ YOUTUBE ] Token de acesso: ${authCode}`))

          res.send('<h1>Volte pro console!</h1>')
          resolve(authCode)
        })
      })
    }

    async function requestAuth(OAuthClient, authorizationToken) {
      return new Promise((resolve, reject) => {
        OAuthClient.getToken(authorizationToken, (error, tokens) => {
          if (error) {
            return reject(error)
          }

          console.log('[ YOUTUBE ] Tokens de acessos recebidos!')

          OAuthClient.setCredentials(tokens)
          resolve()
        })
      })
    }

    function setAuth(OAuthClient) {
      google.options({
        auth: OAuthClient
      })
    }

    async function stopServer(webServer) {
      return new Promise((resolve, reject) => {
        webServer.server.close(() => {
          resolve()
        })
      })
    }
  }

  async function upload(t) {
    const videoFilePath = './files/video.mp4'
    const videoFileSize = fs.statSync(videoFilePath).size
    const videoTitle = t
    const videoDescription = content.description

    const requestParameters = {
      part: 'snippet, status',
      requestBody: {
        snippet: {
          title: videoTitle,
          description: videoDescription + ' este video é apenas um teste entao assita ok? por favor assita este video cara, mano que video top eu assistiria agora mano, super amei,,,',
        },
        status: {
          privacyStatus: 'public'
        }
      },
      media: {
        body: fs.createReadStream(videoFilePath)
      }
    }

    console.log('[ YOUTUBE ] Starting to upload the video to YouTube')
    const youtubeResponse = await youtube.videos.insert(requestParameters, {
      onProgress: onProgress
    })

    console.log(c.red(`[ YOUTUBE ] Video postado: https://youtu.be/${youtubeResponse.data.id}`))
    return youtubeResponse.data

    function onProgress(event) {
      const progress = Math.round( (event.bytesRead / videoFileSize) * 100 )
      console.log(c.red(`[ YOUTUBE ] ${progress}% ${'⬜'.repeat(progress / 4)}`))
    }

  }


}

module.exports = youtubeUploader
