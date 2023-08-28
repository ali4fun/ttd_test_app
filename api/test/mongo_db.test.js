// test connection with mongo db

// test read data

// test write data

// test update data

// test delete data

// test query of data

const jwt = require("jsonwebtoken");

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://ali4fun:z7Da3LDb5HC8CDAo@appdb.t7zpmu8.mongodb.net/?retryWrites=true&w=majority";
const privateKey = 'Q2SRhpAiByQUiTS8fPeg';

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

describe('MongoDB Connection Test', () => {
  let db;

  // Establish the MongoDB connection before running the tests
  beforeAll(async () => {
    const dbName = 'answersdb';
    await client.connect();
  }, 25000);

  // Close the MongoDB connection after running the tests
  afterAll(async () => {
    await client.close();
  });

  // Test to verify MongoDB connection
  it('should establish a MongoDB connection', async () => {

    const res = await client.db("answersdb").command({ ping: 1 });
    expect(res.ok).toBe(1);
  });


});

describe('MongoDB Data Fetching', () => {
  let db;

  let id;
  // Establish the MongoDB connection before running the tests
  beforeAll(async () => {
    const dbName = 'answersdb';
    await client.connect();
  }, 25000);

  // Close the MongoDB connection after running the tests
  afterAll(async () => {
    await client.close();
  });

  it('should have valid user', async () => {
    const usersCollection = await client.db("answersdb").collection('users').findOne({ 'name': 'admin', 'password': 'admin1' });
    console.log(usersCollection);
    id = usersCollection._id;
    expect(usersCollection).not.toBe(null);
  });

  it('should update user', async () => {
    let token = jwt.sign({
      name: 'admin'
    }, 'fkjasdkfljl234545$%#@$%$#kajsfd', { expiresIn: '1h' });
    const usersCollection = await client.db("answersdb").collection('users').updateOne({ _id:id }, { $set: {'token' : token} });
    expect(usersCollection).not.toBe(null);
  });

  it('should create user', async () => {
    let token = jwt.sign({
      name: 'new user'
    }, 'fkjasdkfljl234545$%#@$%$#kajsfd', { expiresIn: '1h' });
    const newUser = await client.db("answersdb").collection('users').insertOne({
      'token': token,
      'name':'new user',
      'pasword': 'new_user'
    });
    console.log(newUser);
    expect(newUser).not.toBe(null);
  });

  it('should delete user', async () => {   
    const deleteUser = await client.db("answersdb").collection('users').deleteOne({
      '_id': new ObjectId('64bfb567830aa9fcf3e64128'),
    });
    console.log(deleteUser);
    expect(deleteUser).not.toBe(null);
  });

  it('should create question', async () => {   
    const question = await client.db("answersdb").collection('questions').insertOne({
      'user_id' : id,
      'question' :'how much rating you give this app?',
      'create_time' : new Date().toLocaleString(),
    });
    console.log(question);
    id = question.insertedId;
    expect(question).not.toBe(null);
  });

  it('should delete question', async () => {
    const question = await client.db("answersdb").collection('questions').deleteOne({
     _id : new ObjectId(id)
    });
    console.log(question);
    expect(question).not.toBe(null);
  });
});
