const { compile } = require('nexe')

compile({
  input: './index.js',
  build: true, //required to use patches
}).then(() => {
  console.log('success')
})