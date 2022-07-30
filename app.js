const request = require('request');
const express = require('express');
const app = express();
const { application } = require('express');
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }));

async function sendEmails(rateVal) {
    const fs = require('fs');
    const readline = require('readline');
    const fileStream = fs.createReadStream('emails.txt');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const nodemailer = require("nodemailer");


    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "gses2.appemailsender@gmail.com",
            pass: "txubvuzyvftjlqxr"
        },
    });

    for await (const line of rl) {
        console.log(line);
        let info = await transporter.sendMail({
            from: "gses2.appemailsender@gmail.com", // sender address
            to: line, // receiver
            subject: "btc to uah rate", // Subject line
            text: rateVal.toString(), // plain text body

        });
    }
}
async function isNew(addingEmail) {
    const fs = require('fs');
    const readline = require('readline');
    const fileStream = fs.createReadStream('emails.txt');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {

        if (line === addingEmail) {
            return 0;
        }
    }
    return 1;
}

app.get('/api/rate', (UserReq, UserRes) => {

    request('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=uah', { json: true }, (err, MyRes, body) => {
        if (err) { UserRes.status(400).send(); }
        console.log(body.bitcoin.uah);
        UserRes.status(200).send((body.bitcoin.uah).toString());
    });

});
app.post('/api/sendEmails', (UserReq, UserRes) => {

    request('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=uah', { json: true }, (err, MyRes, body) => {
        if (err) { UserRes.status(400).send(); }
        sendEmails(body.bitcoin.uah);

        UserRes.status(200).send();
    });
});

app.post('/api/subscribe', (UserReq, UserRes) => {
    const fs = require('fs');
    const emailAddress = UserReq.body.email;
    console.log(typeof(emailAddress));
    console.log(emailAddress);
    if (isNew(emailAddress) === 0) {
        UserRes.status(409).send();
    } else {
        fs.appendFile("emails.txt", emailAddress, function(error){
            if(error) UserRes.status(400).send(); 
                 
        });
        UserRes.status(200).send();
    }

});

app.listen(3000, () => console.log('listening on port 3000...'))