const express = require('express');
const app = express();


app.get('/login', (req, res) => {

const user  = req.query.usern; 
 
const pass = req.query.pass;

if (!user || !pass) {
res.status(400).send('Missing user or pass in query parameters');
return;
}

const request = require('request');
const fs = require("fs");

const proxies = fs.readFileSync("proxies.txt").toString().split("\n").map(v => v.trim());

function req(url, options) {
return new Promise((resolve, reject) => {
request(url, options, (err, response, body) => {
if (err) {
reject(err);
} else {
resolve([response, body]);
}
});
});
}

for (let w = 0; w < proxies.length; w++) {
let proxy = proxies[w];
req("https://auth.roblox.com/v2/login", {
proxy: proxy,
method: "POST"
})
.then(([response, body]) => {
let csrf = response.headers["x-csrf-token"];
return req("https://auth.roblox.com/v2/login", {
proxy: proxy,
method: "POST",
headers: {
"x-csrf-token": csrf,
"content-type": "application/json"
},
json: {
cvalue: user,
ctype: "Username",
password: pass,
}

});
})
.then(([response, body]) => {
if (response.statusCode === 200) {
res.status(200).send(response);
} else {
let fieldData = JSON.parse(body.errors[0].fieldData);
res.status(response.statusCode).send(JSON.stringify({ Blob: fieldData.dxBlob, CaptchaId: fieldData.unifiedCaptchaId}));
}
})
.catch((err) => {
res.status(500).send(err);
});
}
});
app.listen(3000, () => {
console.log('Server running on port 3000');
})
