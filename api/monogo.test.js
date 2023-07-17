const jwt = require("jsonwebtoken");


const { MongoClient, ServerApiVersion, ObjectId, Int32 } = require('mongodb');
const uri = "mongodb+srv://ali4fun:z7Da3LDb5HC8CDAo@appdb.t7zpmu8.mongodb.net/?retryWrites=true&w=majority";
const privateKey = 'Q2SRhpAiByQUiTS8fPeg';

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

describe('MongoDB Connection and Data Fetching', () => {
  let connection;
  let db;

  // Establish the MongoDB connection before running the tests
  beforeAll(async () => {
    const dbName = 'alidb';

    connection = await MongoClient.connect(uri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });

    db = connection.db(dbName);
  });

  // Close the MongoDB connection after running the tests
  afterAll(async () => {
    await connection.close();
  });

  // Test to verify MongoDB connection
  it('should establish a MongoDB connection', () => {
    expect(connection).toBeDefined();
    expect(db).toBeDefined();
  });

  it('should have valid user', async () => {
    const usersCollection = db.collection('auth');
    const user = await usersCollection.findOne({ 'name': 'admin' });
    expect(user).not.toBe(null);
  });

  it('should have valid auth', async () => {
    const usersCollection = db.collection('auth');
    const user = await usersCollection.findOne({ 'name': 'admin' });
    expect(jwt.decode(user.password).name).toBe('admin');
  });

  it('should have to read  items', async () => {
    const usersCollection = db.collection('items');
    const items = await usersCollection.find().toArray();
    expect(items).toBeInstanceOf(Array)
  });



  it('should have update  items', async () => {
    const usersCollection = db.collection('items');
    const result = await usersCollection
      .updateOne({ _id: new ObjectId('6497f48805f3795aca96c51a') }, { $set: { 'price': 90 } });
    expect(result).not.toBe(null);
  });

  it('should be format data', async () => {
    const usersCollection = db.collection('items');
    const result = await usersCollection.findOne({});
    console.log(result);
    expect(result._id).toBeInstanceOf(ObjectId);
    // expect(result.price).not.toBe(null);
  });
});
