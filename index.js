require('dotenv').config();

//чтоб не падал облачный сервис
const express = require('express')
const app = express()
const port = 8000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


const {MongoClient} = require('mongodb');
const clientDB = new MongoClient(process.env.MONGO_URL);

const TelegramApi = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramApi(token, {polling:true});
const errOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text:'Ввести номер ошибки', callback_data:'errNumber'}]
        ]
    })
}

let prkType='all';


const start = async()=> {

    try {
        await clientDB.connect();
        console.log('Соединение с БД установлено.');
        const errorcode = clientDB.db('ErrorDB').collection('ErrorCode');
        //await errorcode.insertOne({prktype: 'GlobalStar', error: '400', fullerrore: 'E-400', description: 'описание', fix: 'решение'});
    }
    catch (e) {
        console.log(e);
    }

    bot.setMyCommands([
        {command: '/start', description: 'Начало работы.'}
    ])
    
    bot.on('message', async msg =>{
        const text = msg.text;
        const chatId = msg.chat.id;
    
        if (text ==='/start') {
            await bot.sendSticker(chatId, 'CAACAgIAAxkBAAELysFnj1u8appY8vL7gGl-O2NaaT6QIwACMF0AAjMvgEhUAof3VQABWBE2BA');
            return bot.sendMessage(chatId, 'Информация по ошибкам. Введите номер ошибки (без Е и т.п., просто число.)', {
            reply_markup: {
                keyboard: [
                    ['🚗 GlobalStar', '🚙 T20 ND'],
                    ['⭐️ Поиск по всем ТРК']
                ],
                resize_keyboard: true
            }
        })

        }
        
        if (text !== '/start') {
            const errorcode = clientDB.db('ErrorDB').collection('ErrorCode');
            let err;
        if (prkType === 'all') {
            err = errorcode.find({error: text});
        } else {
            err = errorcode.find({error: text, prktype: prkType});
        }
            
            //console.log(err);

        if (text === '🚗 GlobalStar') {
            prkType = 'GlobalStar';
            return bot.sendMessage(chatId, 'Будет произведен поиск только по GlobalStar.');
        } 
        if (text === '🚙 T20 ND') {
            prkType = 'T20 ND';
            return bot.sendMessage(chatId, 'Будет произведен поиск только по T20 ND.');
        }
        if (text === '⭐️ Поиск по всем ТРК') {
            prkType = 'all';
            return bot.sendMessage(chatId, 'Будет произведен поиск по всем ТРК из базы.');
        }   
   
        // console.log(prkType);
        // Print a message if no documents were found
        if (prkType === 'all') {
            if ((await errorcode.countDocuments({error: text})) === 0) {
                return bot.sendMessage(chatId, 'Ошибка не найдена.');
            }
        }
        else {
            if ((await errorcode.countDocuments({error: text, prktype: prkType})) === 0) {
                console.log("prkType");
                return bot.sendMessage(chatId, 'Ошибка не найдена.');
            }
        }
            // Print returned documents
            for await (const doc of err) {
                console.log(doc.prktype + ' : (' + doc.fullerror + ') : ' +doc.description);
                bot.sendMessage(chatId, doc.prktype + ' : (' + doc.fullerror + ') : ' +doc.description);
            }
        
        }

        //bot.sendMessage(chatId, `Send ${text}`);
    
    })

    bot.on('callback_query', async msg =>{
        const data = msg.data;
        const chatId = msg.message.chat.id;
        
        bot.sendMessage(chatId, `Send ${data}`)
        //console.log(msg);
    })

}

start();