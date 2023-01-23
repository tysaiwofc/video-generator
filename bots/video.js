
const { Configuration, OpenAIApi } = require("openai");
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const c = require('colors')
let { getAudioUrl } = require("google-tts-api");
let http = require('http');
const fetch = require('node-fetch-commonjs')
const { API_KEY } = require('../env.json')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const configuration = new Configuration({
  apiKey: API_KEY,
});
const openai = new OpenAIApi(configuration);

// Função para gerar uma imagem com o OpenAI
const generateImage = async (prompt) => {
    const response = await openai.createImage({
        prompt: prompt,
        size: "1024x1024",
    });
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
    downloadAudio(audioUrl, `./files/${name}.mp3`)
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

    console.log(c.blue('Texto:   ' + response.data.choices[0].text))
    return response.data.choices[0].text?.slice(0, 200);
};

// Função para criar um vídeo a partir de uma imagem e um texto
const createVideo = async (imageUrl, text) => {
    // Baixa a imagem gerada pelo OpenAI
    const imageData = await (await fetch(imageUrl)).buffer();
    fs.writeFileSync('./files/image.jpg', imageData);


    // Cria um arquivo de texto com o texto gerado pelo GPT-3
    fs.writeFileSync('./files/text.txt', text?.slice(0, 25));

    // Usa o ffmpeg para criar um vídeo com a imagem e o texto
    ffmpeg('./files/image.jpg')
        .loop(25)
        .input('./files/audio.mp3')
        .input('./files/text.txt')
        .complexFilter(
            [
                {
                    filter: 'drawtext',
                    options: {
                        fontfile: 'arial.ttf',
                        textfile: './files/text.txt',
                        x: '(main_w/2-text_w/2)',
                        y: '(main_h/2-text_h/2)',
                        fontsize: 56,
                        fontcolor: 'red',
                        shadowcolor: 'black',
                        shadowx: 2,
                        shadowy: 2
                    }
                },
            ]
        )
        .save('./files/video.mp4')
        .on('end', function () {
            console.log(c.green('VIDEO GERADO COM SUCESSO!'));
        }).on('progress', function(progress) {
            console.clear()
            console.log(c.cyan(`${progress.currentFps}%`));
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