const uuid = require('uuid');
const moment = require('moment');
const {update} = require('./../../util/dynamo/operations');

const {BOOK_TABLE_NAME} = process.env;

exports.handler = async (event) => {
  console.log('--------------------');
  console.log('---- updateBook/index.js');
  console.log('--------------------');
  console.log({event});

  const dateNowStr = moment().format();
  const updateBookInput = event.arguments.input;
  const bookId = updateBookInput.id;

  const updatedBook = {
    ...updateBookInput,
    updatedAt: dateNowStr
  };

  // We remove ID from fields to update
  delete updatedBook.id;

  await update({
    id: bookId, 
    data: updatedBook,
    tableName: BOOK_TABLE_NAME
  });

  // We add ID to return updated object.
  updatedBook.id = bookId;
  return updatedBook;
};
