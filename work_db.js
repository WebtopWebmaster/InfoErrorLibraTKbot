require('dotenv').config();

const {MongoClient} = require('mongodb');
const clientDB = new MongoClient(process.env.MONGO_URL);

const schema = {
    'PRKTYPE': {
      // JSON object property name.
      prop: 'prktype',
      type: String
    },
    'ERROR': {
        // JSON object property name.
        prop: 'error',
        type: String
      },
    'FULLERROR': {
        // JSON object property name.
        prop: 'fullerror',
        type: String
      },
    'DESCRIPTION': {
        // JSON object property name.
        prop: 'description',
        type: String
      },
    'FIX': {
        // JSON object property name.
        prop: 'fix',
        type: String
      },
        
}

const readXlsxFile = require('read-excel-file/node');

const start = async()=> {

    try {
        let allrows = [];

        readXlsxFile('./prkerror/GlobalStar.xlsx', { schema }).then(({ rows, errors }) => {
            console.log(rows, errors);
            allrows = rows;
          })
        
        await clientDB.connect();
        console.log('Соединение с БД установлено.');
        const errorcode = clientDB.db('ErrorDB').collection('ErrorCode');
        //await errorcode.insertOne({prktype: 'GlobalStar', error: '401', fullerrore: 'E-403', description: 'описание', fix: 'решение'});
        await errorcode.insertMany(allrows);
        await clientDB.close();
    }
    catch (e) {
        console.log(e);
    }

}

start();
