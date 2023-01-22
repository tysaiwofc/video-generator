
const { Configuration, OpenAIApi } = require("openai");
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
let { getAudioUrl } = require("google-tts-api");
let http = require('http');
const fetch = require('node-fetch-commonjs')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const configuration = new Configuration({
  apiKey: 'API KEY',
});
const openai = new OpenAIApi(configuration);

// Função para gerar uma imagem com o OpenAI
const generateImage = async (prompt) => {
    const response = await openai.createImage({
        prompt: prompt,
    });
    //console.log(response.data.data.url, response.data.data)
    return response.data.data[0].url;
};

function downloadAudio(url, dest) {
    var file = fs.createWriteStream(dest);
    http.get(url, function (response) {
      response.pipe(file)
    });
  }

const generateAudio = async (text, name) => {
    let audioUrl = await getAudioUrl(text, {
        lang: "pt-br",
        slow: false,
        host: 'http://translate.google.com',
        timeout: 20000,
    });
    console.log(audioUrl)
    downloadAudio(audioUrl, `./${name}.mp3`)
}

// Função para gerar um texto com o GPT-3
const generateText = async (prompt) => {
    const response = await openai.createCompletion({
        prompt: prompt,
        model: "text-davinci-003",
        temperature: 0,
        max_tokens: 200,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0,
    });

    console.log('Texto:   ' + response.data.choices[0].text)
    return response.data.choices[0].text?.slice(0, 200);
};

// Função para criar um vídeo a partir de uma imagem e um texto
const createVideo = async (imageUrl, text) => {
    // Baixa a imagem gerada pelo OpenAI
    const imageData = await (await fetch(imageUrl)).buffer();
    fs.writeFileSync('image.jpg', imageData);


    // Cria um arquivo de texto com o texto gerado pelo GPT-3
    fs.writeFileSync('text.txt', text?.slice(0, 25));

    // Usa o ffmpeg para criar um vídeo com a imagem e o texto
    ffmpeg('image.jpg')
        .loop(25)
        .input('./audio.mp3')
        .input('text.txt')
        .complexFilter(
            [
                {
                    filter: 'drawtext',
                    options: {
                        fontfile: 'arial.ttf',
                        textfile: 'text.txt',
                        x: '(main_w/2-text_w/2)',
                        y: '(main_h/2-text_h/2)',
                        fontsize: 40,
                        fontcolor: 'red',
                        shadowcolor: 'black',
                        shadowx: 2,
                        shadowy: 2
                    }
                },
            ]
        )
        .save('video.mp4')
        .on('end', function () {
            console.log('Vídeo criado com sucesso!');
        }).on('progress', function(progress) {
            console.log('Gerando video: ' + progress.currentFps + '%');
          });
};

const generateVideo = async  (tema) => {
    const text = await generateText(tema);
    const image = await generateImage(tema);
    await generateAudio(text, 'audio');
    await createVideo(image, tema);

    return true
}

module.exports = generateVideo
