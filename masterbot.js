'use strict';

const Discord = require('discord.js');
const cron = require("node-cron");
const request = require('request');
const cheerio = require('cheerio');
const _ = require('lodash/array');


const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./product_url.db3');

const CONSTANT = require('./constant');

// Create an instance of a Discord client
const client = new Discord.Client();

/**
 * Danh sach URL
 */
const urls = [];

/**
 * Danh sach promise de thuc hien get nhieu URL
 */
const promises = [];

/**
 * Danh sach san pham
 */
const products = [];


 // Create product link table if not exists
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS PRODUCT_URL(url TEXT);")
});


// Chay schedule de hien thi thong tin san pham
client.on('ready', () => {
  console.log(`Discord Logged in as ${client.user.tag}!`);
  cron.schedule(CONSTANT.SCHEDULE_TIME, () => {
    // Lay danh sach URL san pham
    db.serialize(() => {
      db.all("SELECT * from PRODUCT_URL", (err, res) => {
        // TH co loi thi return
        if (err) {
          console.log(err);
          return;
        }

        // Kiem tra ket qua tra ve co rong khong
        if (res.length < 1) {
          return;
        } else {
          // Lap trong danh sach url lay duoc tu DB
          res.forEach(item => {
            // Moi item la 1 promise nen phai push vao mang Promises
            promises.push(new Promise((resolve, reject) => {
              request(item.url, (err, res, body) => {
                if (err)
                  return reject(err);

                // Dung cheerio de crawl du lieu voi cau truc html nhu sau
                let $ = cheerio.load(res.body);
                const name = $('div.header > h1.title').text();
                const price = $('div.group > p.price').text();
                const img = $('div.thumbnail > div > div.container > img').attr('src');
                const seller = $('div.seller-info > div > a.seller-name').text();

                // Khai bao bien product de map du lieu da crawl vao
                let product = {
                  pName: name,
                  pPrice: price,
                  pImage: img,
                  pSeller: seller,
                  pLink: item.url
                }
                // Them san pham vao danh sach san pham 
                products.push(product);
                // Tra ve resolve danh sach san pham
                return resolve(products);
              });
            }));
          });
          // Su dung promise all
          Promise.all(promises).then((results) => {
            // Su dung lodash de lay unique product
            var productsArray = _.uniqBy(results[0], 'pName');
            // Gui thong tin san pham cho nay
            // lap trong danh sach csan pham
            productsArray.forEach(productItem => {
              // Tra ve hinh anh cua san pham hoac neu khong co hinh anh thi "No image available"
              let image = productItem.pImage || "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
              // Gui thong tin san pham vao channel
              client.channels.get(CONSTANT.CHANNEL_ID)
                .send(`=============================================================
                      \n**${productItem.pName}**
                      \n***${productItem.pPrice}***
                      \n**${productItem.pLink}**
                      \n**${productItem.pSeller}**
                      `, {
                  files: [`${image}?file=file.png`]
                }).then(console.log(productItem));
            });
            // Gui end
          }).catch((error) => {
            console.log(error);
          });
        }
      });
    });
  });
});

// Bot lay URL cua san pham va luu vao DB
client.on('message', message => {
  // TH la tin nhan cua user
  if (!message.author.bot) {
    // TH noi dung bao gom 'tiki'
    if (message.content.includes('tiki')) {
      // message.channel.send(message.content);
      let url = message.content;
      // TODO: Hien tai dang xu ly tam
      let options = {
        url: url,
        json: true
      };
      request(options, (err, res) => {
        // TH URL khong hop le thi bot se bao loi va return
        if (err || res.statusCode !== 200) {
          message.channel.send('Bad URL! Please try again');
          return;
        }
        // TH URL hop le -> Them URL vao DB
        db.serialize(() => {
          db.run(`INSERT INTO PRODUCT_URL(url) VALUES ("${url}")`);
        });
      });
    }
  }
});

// Login bang token cua con bot.
// Khong duoc public token nay.
client.login(CONSTANT.BOT_TOKEN);