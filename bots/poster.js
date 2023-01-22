const { upload } = require('youtube-videos-uploader'); //vanilla javascript

const uploader = async (email, senha, title, description) => {
    // recoveryemail is optional, only required to bypass login with recovery email if prompted for confirmation
const credentials = { email: email , pass: senha}

// minimum required options to upload video
const video1 = { path: 'video1.mp4', title, description }

// Returns uploaded video links in array
upload (credentials, [video1]).then(console.log)
}

module.exports = uploader