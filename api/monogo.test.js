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
  
    // Test to fetch data using a token
    it('should fetch data using a token', async () => {
      // Assuming you have a token generated for authentication
      const token = jwt.sign({ userId: 'your_user_id' }, privateKey);
      
      // Assuming you have a collection named 'users' in your MongoDB
      const usersCollection = db.collection('users');
      
      // Assuming you want to fetch a user document using the token's userId
      const userId = jwt.decode(token).userId;
      const user = await usersCollection.findOne({ userId });
      
      expect(user).toBeDefined();
      // Add more assertions or expectations as needed
    });
  });
  