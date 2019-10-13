const AWS = require('aws-sdk');
const _ = require('lodash');

const DEFAULT_LIMIT = 15;
const IS_OFFLINE = process.env.IS_OFFLINE;
const REGION = IS_OFFLINE 
  ? 'localhost'
  : process.env.REGION
;
const DYNAMODB_ENDPOINT = IS_OFFLINE 
  ? process.env.DYNAMODB_ENDPOINT
  : null
;

const dynamoOpts = {region: REGION};
if (IS_OFFLINE) {
  dynamoOpts.endpoint = DYNAMODB_ENDPOINT;
}
// console.log({dynamoOpts});
const docClient = new AWS.DynamoDB.DocumentClient(dynamoOpts);

const insertOrReplace = async (item, tableName) => {
  const params = {
    TableName: tableName,
    Item: item,
  };
  // console.log({params});
  const result = await docClient.put(params).promise();
  // console.log({result});

  return item;
}

const find = async (id, tableName) => {
  const params = {
    Key: {id},
    TableName: tableName,
  };

  const result = await docClient.get(params).promise();

  if (_.isEmpty(result)) {
    return null;
  } else {
    return result.Item;
  }
}

const getWhereIdIn = async (ids, tableName) => {
  const keys = [];
  for (const id of ids) {
    keys.push({id});
  }

  const params = {RequestItems: {}};
  params.RequestItems[tableName] = {Keys: keys};
  console.log({params});
  console.log(params.RequestItems);
  console.log('Keys: ', params.RequestItems[tableName].Keys);

  try{
    const result = await docClient.batchGet(params).promise();
    console.log({result});
    console.log('getWhereIdIn:result', result);

    const items = result.Responses[tableName];
    console.log('getWhereIdIn:items', items);

    if (_.isEmpty(items)) {
      return [];
    }
    return items;
  } catch(err) {
    console.log('getWhereIdIn:err', err);
    return [];
  }
}

const list = async ({tableName, limit, nextToken}) => {
  if (!limit) {
    limit = DEFAULT_LIMIT;
  }

  const params = {
    Limit: limit,
    TableName: tableName,
  };
  if (nextToken) {
    params.ExclusiveStartKey = {id: nextToken};
  }

  // console.log({params});
  const result = await docClient.scan(params).promise();
  // console.log({result});

  let newNextToken = null;
  if (_.has(result, 'LastEvaluatedKey')) {
    newNextToken = result.LastEvaluatedKey.id;
  }

  return {
    nextToken: newNextToken,
    items: result.Items
  };
}

const query = async ({
  tableName, 
  indexName, 
  hashIndexOpts, 
  rangeIndexOpts={}
}) => {
  // rangeIndexOpts is not implemented yet.
  console.log({hashIndexOpts});
  const {attrName, attrValue, operator} = hashIndexOpts;
  console.log({attrName, attrValue, operator});

  const params = {
    TableName: tableName,
    IndexName: indexName, 
    KeyConditionExpression: `${attrName} ${operator} :hkey`,
    ExpressionAttributeValues: {
      ':hkey': attrValue,
    }
  };
  console.log({params});

  const result = await docClient.query(params).promise();
  console.log({result});

  return result.Items;
}

const update = async ({tableName, id, data}) => {
  const updateExpressions = [];
  const expressionsValues = {};
  for (const fieldName of Object.keys(data)) {
    const fieldValue = data[fieldName];
    updateExpressions.push(`${fieldName} = :${fieldName}`);
    expressionsValues[`:${fieldName}`] = fieldValue;
  }
  const updateExpression = 'set ' + updateExpressions.join(', ');

  const params = {
    TableName: tableName, 
    Key: {id},
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionsValues
  };
  console.log({params});

  const result = await docClient.update(params).promise();
  console.log({result});

  return result;
}


module.exports = {
  find,
  list,
  query,
  update,
  getWhereIdIn,
  insertOrReplace
};