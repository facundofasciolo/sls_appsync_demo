const uuid = require('uuid');
const { list } = require('./../../util/dynamo/operations');

const {BOOK_TABLE_NAME} = process.env;

exports.handler = async (event) => {
  console.log('--------------------');
  console.log('---- listBooks/index.js');
  console.log('--------------------');
  console.log({event});
    
  const {arguments} = event;
  const {nextToken, limit} = arguments;
  
  const books = await list({
    limit,
    nextToken,
    tableName: BOOK_TABLE_NAME
  });
  return books;
};
