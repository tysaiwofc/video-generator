
const { Configuration, OpenAIApi } = require("openai");
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const c = require('colors')
let { getAudioUrl } = require("google-tts-api");
let http = require('http');
const fetch = require('node-fetch-commonjs')
const { API_KEY } = require('../env.json');
const robot = require("./youtube.js");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const configuration = new Configuration({
  apiKey: API_KEY,
});
const openai = new OpenAIApi(configuration);

// Função para gerar uma imagem com o OpenAI
const generateImage = async (prompt) => {
    console.log(c.bold('[ SERVER ] Gerando imagem....'))
    const response = await openai.createImage({
        prompt: prompt,
        size: "1024x1024",
    });

    console.log(c.bold('[ SERVER ] imagem gerada!'))
    return response.data.data[0].url;
};

function downloadAudio(url, dest) {
    console.log(c.bold('[ SERVER ] Baixando áudio...'))
    var file = fs.createWriteStream(dest);
    http.get(url, function (response) {
      response.pipe(file)
      console.log(c.bold('[ SERVER ] Áudio baixado!'))
    });
  }

const generateAudio = async (text, name) => {
    console.log(c.bold('[ SERVER ] Gerando audio...'))
    let audioUrl = getAudioUrl(text, {
        lang: "pt-br",
        slow: false,
        host: 'http://translate.google.com',
        timeout: 20000,
    });
    console.log(c.bold('[ SERVER ] Audio gerado!'))
    downloadAudio(audioUrl, `./files/${name}.mp3`)
}

// Função para gerar um texto com o GPT-3
const generateText = async (prompt) => {
    console.log(c.bold('[ SERVER ] Gerando texto...'))
    const response = await openai.createCompletion({
        prompt: prompt,
        model: "text-davinci-003",
        temperature: 0,
        max_tokens: 200,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0,
    });
    console.log(c.bold('[ SERVER ] Texto gerado!'))


    console.log(c.blue('Texto:   ' + response.data.choices[0].text))
    return response.data.choices[0].text?.slice(0, 200);
};


const createVideo = async (imageUrl, text) => {
    console.log(c.bold('[ SERVER ] Baixando imagem...'))
    const imageData = await (await fetch(imageUrl)).buffer();
    fs.writeFileSync('./files/image.jpg', imageData);
    console.log(c.bold('[ SERVER ] Imagem baixada!'))

    console.log(c.bold('[ SERVER ] Salvando texto...'))
    fs.writeFileSync('./files/text.txt', text?.slice(0, 25));
    console.log(c.bold('[ SERVER ] Texto salvo!'))

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
            fs.unlink("./files/text.txt", () => {
            });
            fs.unlink("./files/audio.mp3", () => {
            });
            fs.unlink("./files/image.jpg", () => {
            });
        }).on('progress', function(progress) {
            console.log(c.cyan(`TEMPO: ${progress.timemark.slice(0,8)}`));
          });
};

const generateVideo = async  (tema) => {
    const text = await generateText(tema);
    const image = await generateImage(tema);
    await generateAudio(text, 'audio');
    await createVideo(image, tema).then(() => {
        robot(tema)
    })
    

    return true
}

module.exports = generateVideo
