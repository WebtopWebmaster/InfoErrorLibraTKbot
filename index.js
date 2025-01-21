require('dotenv').config();

const {MongoClient} = require('mongodb');
const clientDB = new MongoClient(process.env.MONGO_URL);

const TelegramApi = require('node-telegram-bot-api');
const token = '8032209676:AAEkoFpPWwDhwsHgRe-pfNzxvm5PbTXIwvk';
const bot = new TelegramApi(token, {polling:true});
const errOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text:'Ввести номер ошибки', callback_data:'errNumber'}]
        ]
    })
}


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
            // return bot.sendMessage(chatId, `Информация по ошибкам.`, errOptions);
            return bot.sendMessage(chatId, 'Информация по ошибкам. Введите номер ошибки (без Е и т.п., просто число.)');
        }
        
        if (text !== '/start') {
            const errorcode = clientDB.db('ErrorDB').collection('ErrorCode');
            const err = await errorcode.find({error: text});
            //console.log(err);

        // Print a message if no documents were found
        if ((await errorcode.countDocuments({error: text})) === 0) {
            return bot.sendMessage(chatId, 'Ошибка не найдена.');
        }
        // Print returned documents
        for await (const doc of err) {
            console.dir(doc);
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