const uuid = require('uuid');
const { find } = require('./../../util/dynamo/operations');

const {BOOK_TABLE_NAME} = process.env;

exports.handler = async (event) => {
  console.log('--------------------');
  console.log('---- getBook/index.js');
  console.log('--------------------');
  console.log({event});

  const id = event.arguments.id;
  const book = await find(id, BOOK_TABLE_NAME);
  
  return book;
};
