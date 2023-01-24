const openai = require('../openai.js')
const c = require('colors')
const fs = require('fs')
const generateeRoteiro = async (prompt) => {
    console.log(c.bold('[ SERVER ] Gerando roteiro...'))
    const response = await openai.createCompletion({
        prompt: `Crie um roteiro sobre ${prompt}`,
        model: "text-davinci-003",
        temperature: 0,
        max_tokens: 4000,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0,
    });

    console.log(c.bold('[ SERVER ] Roteiro gerado! Salvando....'))

    fs.writeFile('./files/roteiro.txt',response.data.choices[0].text, () => {
        console.log(c.bold('[ SERVER ] Roteiro salvo com sucesso ./files/roteiro.txt'))
    })

    return response.data.choices[0].text?.slice(0, 200);
};

module.exports = generateeRoteiro