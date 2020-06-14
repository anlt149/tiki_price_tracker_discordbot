const request = require("request");
const cron = require("node-cron");
const Discord = require('discord.js');
const client = new Discord.Client();
const cheerio = require('cheerio');

client.on('ready', () => {
    console.log(`Discord Logged in as ${client.user.tag}!`);
    cron.schedule("*/15 * * * * *", function () {
        console.log("---------------------");
        console.log("Running Cron Job");


        const url = 'https://tiki.vn/den-led-hau-xe-dap-tron-voi-5-che-do-canh-bao-an-toan-dap-xe-ban-dem-mai-lee-hang-chinh-hang-p20576742.html?spid=20576743&src=home-deal-hot';

        let options = {
            url: url,
            json: true,
            headers: {
                'Postman-Token': '513bb4d8-22b2-44c6-b830-aa612fd2e2e3',
                'cache-control': 'no-cache'
            }
        };

        request(options, (error, response, html) => {
            if (!error && response.statusCode == 200) {
                const $ = cheerio.load(html);
                const name = $('div.header > h1.title').text();
                const price = $('div.group > p.price').text();
                const img = $('div.thumbnail > div > div.container > img').attr('src');
                const seller = $('div.seller-info > div > a.seller-name').text();

                let product = {
                    pName: name,
                    pPrice: price,
                    pImage: img,
                    pSeller: seller
                }

                let image = product.pImage || "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                client.channels
                    .get("719114527643402252").send(`===============================================
                    \n**${product.pName}**
                    \n***${product.pPrice}***
                    \n*${product.pSeller}
                    `, {
                        files: [`${image}?file=file.png`]
                    }).then(console.log('promise done'));
            }
            return;
        });
    });
});

client.on('message', msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }
});

client.login('NzE5MTE2MDM2NzA3ODQ0MTM2.XuXDfg.xnTX1tJhn44WKjLynwOuYScAFrk');
