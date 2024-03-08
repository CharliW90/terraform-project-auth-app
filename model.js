const {
  PutItemCommand,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { passwordHash, passwordCheck } = require("./hashify");

function formatDynamoData(data) {
  const user = structuredClone(data);

  user.username = user.username.S;
  user.password = user.password.S;

  return user;
}

exports.addUser = (user) => {
  console.log(`Registering ${user.username} as a new user...`)
  const hashKey = Date.now();
  const secret = passwordHash(hashKey, user.password)
  const newUser = {
    id: {
      N: `${hashKey}`
    },
    username: {
      S: `${user.username}`
    },
    password: {
      S: `${secret}`
    },
  };

  const client = new DynamoDBClient({
    region: "eu-west-2",
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  });

  const command = new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: newUser,
  });

  return client.send(command)
  .then(() => {
    const getCommand = new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: {
          N: `${hashKey}`
        },
      },
    });
    return client.send(getCommand)
  })
  .then((res) => {
    const registeredUser = res.Item;
    console.log(`...${res.Item.username.S} registered!\n`)
    return formatDynamoData(registeredUser)
  })
  .catch((err) => {
    console.log("ERROR:", err)
    return Promise.reject(err)
  });
};

exports.alreadyRegistered = (username) => {
  console.log(`Checking if ${username} already exists...`)
  const client = new DynamoDBClient({
    region: "eu-west-2",
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  });

  const query = new ScanCommand({
    TableName: process.env.TABLE_NAME,
    FilterExpression: "#username = :usernameVal",
    ExpressionAttributeNames: { "#username": "username" },
    ExpressionAttributeValues: { ":usernameVal": { S: `${username}` }}
  });
  return client.send(query)
  .then((res) => {
    if(res.Count > 0){
      console.log(`...they exist.\n`)
      return true // username already registered
    } else {
      console.log(`...they do not exist.\n`)
      return false // username unique
    }
  })
  .catch((err) => {
    console.log("ERROR:", err)
    return Promise.reject(err)
  })
}

exports.login = (username, password) => {
  console.log(`Trying to login ${username}...`)
  const client = new DynamoDBClient({
    region: "eu-west-2",
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  });

  const query = new ScanCommand({
    TableName: process.env.TABLE_NAME,
    FilterExpression: "#username = :usernameVal",
    ExpressionAttributeNames: { "#username": "username" },
    ExpressionAttributeValues: { ":usernameVal": { S: `${username}` }}
  });
  return client.send(query)
  .then((res) => {
    if(res.Items.length === 1 && (Object.keys(res.Items[0]).includes("password"))){
      if(passwordCheck(res.Items[0].id.N, res.Items[0].password.S, password)){
        console.log(`...${res.Items[0].username.S} logged in!\n`)
        return true
      }
    }
    console.log(`...login failed: Found ${res.Count} results for ${username}\nPasswordCheck returned: ${passwordCheck(res.Items[0].id.N, res.Items[0].password.S, password)}`)
    return false
  })
  .catch((err) => {
    console.log("ERROR:", err)
    return Promise.reject(err)
  })
}