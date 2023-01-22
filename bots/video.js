
const { Configuration, OpenAIApi } = require("openai");
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const fetch = require('node-fetch-commonjs')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

// Função para gerar uma imagem com o OpenAI
const generateImage = async (prompt) => {
    const response = await openai.createImage({
        prompt: prompt,
        model: "image-alpha-001"
    });
    //console.log(response.data.data.url, response.data.data)
    return response.data.data[0].url;
};

// Função para gerar um texto com o GPT-3
const generateText = async (prompt) => {
    const response = await openai.createCompletion({
        prompt: prompt,
        model: "text-davinci-002"
    });
    return response.data.choices[0].text;
};

// Função para criar um vídeo a partir de uma imagem e um texto
const createVideo = async (imageUrl, text) => {
    // Baixa a imagem gerada pelo OpenAI
    const imageData = await (await fetch(imageUrl)).buffer();
    fs.writeFileSync('image.jpg', imageData);

    // Cria um arquivo de texto com o texto gerado pelo GPT-3
    fs.writeFileSync('text.txt', text);

    // Usa o ffmpeg para criar um vídeo com a imagem e o texto
    ffmpeg()
        .input('image.jpg')
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
                        fontsize: 24,
                        fontcolor: 'white',
                        shadowcolor: 'black',
                        shadowx: 2,
                        shadowy: 2
                    }
                }
            ],
            'overlay'
        )
        .save('video.mp4')
        .on('end', function () {
            console.log('Vídeo criado com sucesso!');
        });
};

const generateVideo = async  (tema) => {
    const text = await generateText(tema);
    const image = await generateImage(tema);
    const video = await createVideo(image, text)

    return true
}

module.exports = generateVideo