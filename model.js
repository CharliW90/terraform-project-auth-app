const {
  PutItemCommand,
  DynamoDBClient,
  GetItemCommand,
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

const addUser = (username, password) => {
  const hashKey = Date.now();
  const client = new DynamoDBClient({
    region: "eu-west-2",
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  });
  return alreadyRegistered(username)
  .then((registered) => {
    if(registered){
      return Promise.reject({ status: 200, msg: 'Registration unsuccessful - username already exists' })
    } else {
      console.log(`Registering ${username} as a new user...`)
      const secret = passwordHash(hashKey, password)
      const newUser = {
        id: {
          N: `${hashKey}`
        },
        username: {
          S: `${username}`
        },
        password: {
          S: `${secret}`
        },
      };

      const command = new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: newUser,
      });

      return client.send(command)
    }
  })
  .then(() => {
    const getCommand = new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: { N: `${hashKey}` },
      },
    });
    return client.send(getCommand)
  })
  .then((res) => {
    const registeredUser = res.Item;
    console.log(`...${res.Item.username.S} registered!\n`)
    return Promise.resolve(formatDynamoData(registeredUser))
  })
};

const login = (username, password) => {
  return alreadyRegistered(username)
  .then((registered) => {
    if(registered){
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
    } else {
      return Promise.reject({ status: 200, msg: 'Login unsuccessful - username does not exist' })
    }
  })
  .then((res) => {
    if(res.Items.length === 1 && (Object.keys(res.Items[0]).includes("password"))){
      if(passwordCheck(res.Items[0].id.N, res.Items[0].password.S, password)){
        console.log(`...${res.Items[0].username.S} logged in!\n`)
        return Promise.resolve(({ status: 200, msg: `Login for ${res.Items[0].username.S} successful!`, id: res.Items[0].id.N}))
      }
    }
    console.log(`...login failed: Found ${res.Count} results for ${username}\nPasswordCheck returned: ${passwordCheck(res.Items[0].id.N, res.Items[0].password.S, password)}`)
    return Promise.resolve({ status: 400, msg: 'Login unsuccessful - password does not match.' })
  })
}

const passwordChange = (username, password, newPassword) => {
  return alreadyRegistered(username)
  .then((registered) => {
    if(registered){
      return login(username, password)
    } else {
      return Promise.reject({ status: 400, msg: `Request unsuccessful - username "${username}" does not exist` })
    }
  })
  .then((res) => {
    if(res.status === 200){
      const newSecret = passwordHash(res.id, newPassword)
      console.log(`Trying to update password for ${res.id}...`)
      const client = new DynamoDBClient({
        region: "eu-west-2",
        credentials: {
          accessKeyId: process.env.ACCESS_KEY,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
      });
      const command = new UpdateItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: {id: {N: `${res.id}`}},
        UpdateExpression: 'SET password = :new_password',
        ExpressionAttributeValues: { ":new_password": { S: `${newSecret}` }}
      })

      return client.send(command)
    } else {
      return Promise.reject(res)
    }
  })
  .then((res) => {
    return Promise.resolve({ status: res.$metadata.httpStatusCode, msg: `Password for ${username} updated!`})
  })
}

const alreadyRegistered = (username) => {
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
      return Promise.resolve(true) // username already registered
    } else {
      console.log(`...they do not exist.\n`)
      return Promise.resolve(false) // username unique
    }
  })
}

module.exports = { addUser, login, passwordChange }