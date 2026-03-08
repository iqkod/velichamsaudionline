const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('../PostedQuestionsPreview - വെളിച്ചം ഖുർആൻ ഓൺലൈൻ.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(console.error);
