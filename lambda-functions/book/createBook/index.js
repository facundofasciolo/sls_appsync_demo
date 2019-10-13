const uuid = require('uuid');
const moment = require('moment');
const { insertOrReplace } = require('./../../util/dynamo/operations');

const {BOOK_TABLE_NAME} = process.env;

exports.handler = async (event) => {
  console.log('--------------------');
  console.log('---- createBook/index.js');
  console.log('--------------------');
  console.log({event});
  
  const dateNowStr = moment().format();
  const createBookInput = event.arguments.input;
  
  const newBook = {
    id: uuid(),
    ...createBookInput,
    createdAt: dateNowStr,
    updatedAt: dateNowStr
  };

  const book = await insertOrReplace(newBook, BOOK_TABLE_NAME);
  return book;
};
