const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
// const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

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
const dbName = 'answersdb';


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    console.log("start connecting to mongodb");
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("answersdb").command({ ping: 1 });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return ('done');
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
export function run()
// run().catch(console.dir);

async function verifyToken() {

  const verifyToken = (req, res, next) => {
    const token =
      req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }
    try {
      const decoded = jwt.verify(token, config.TOKEN_KEY);
      req.user = decoded;
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
    return next();
  };
}



var myObj = [];

app.get('/connect', async (req, res) => {
  console.log(req.body);
  await client.connect();
  // Send a ping to confirm a successful connection
  result  = await client.db(dbName).command({ ping: 1 });
  console.log(result);
  res.json({ 'data': 'Done' });
});

app.get('/users', async (req, res) => {
  console.log(req.query);
  const page = req.query.page - 1;
  const limit = 10;

  var query = req.query;
  delete query.page;
  if (query.name == '') delete query.name;
  else query.name = { $eq: query.name };

  try {

    const decoded = jwt.verify(query.token, privateKey);
    console.log(decoded);
    query.user = decoded.name;

    await client.connect();
    console.log('connection done for verify token.');
    var valid = false;
    var admin = true;
    //read token information
    await client.db("alidb").collection("tokens").findOne({ 'user_id': query.user, 'token': query.token }).then((result) => {
      console.log('token data', result);
      if (result != null) {
        valid = true;
        admin = result.promessions == 'admin';
      }
    });

    console.log('get user data form mongo db.', valid);

    if (valid) {
      var find = {};
      if (!admin) find.name = 'user';
      const cursor = client.db("alidb").collection("users").find(find).limit(limit).skip(page * limit);
      myObj = {};
      myObj.docs = await cursor.toArray();
      myObj.status = 200;
      myObj.msg = 'data found';
    } else {
      myObj = {
        'status': 400,
        'msg': 'Invalid Token information',
        'docs': []
      };
    }

    console.log(myObj);

  } catch {
    console.log('error')
    myObj = {
      'status': 400,
      'msg': 'Invalid Token information',
      'docs': []
    };
  }
  finally {
    console.log('session closed');
    await client.close();
  }
  res.json(myObj);
});

app.put('/users', async function (req, res) {
  console.log(req.body);
  var query = req.body;
  try {

    await client.connect();
    console.log('connection done for insert.');

    const decoded = jwt.verify(query.token, privateKey);
    console.log(decoded);
    query.user = decoded.name;
    query.name = decoded.name;

    var valid = false;
    await client.db("alidb").collection("tokens").findOne({ 'user_id': query.user, 'token': query.token }).then((result) => {
      console.log('token data', result);
      if (result != null) {
        valid = true;
        query.name = result.user_id;
      }
    });
    delete query.token;
    delete query.user;
    if (valid)
      await client.db("alidb").collection('users').insertOne(query, function (err, res) {
        console.log('data inserted', res);

      });

  } finally {
    await client.close();
  }

  res.json([]);
})

app.post('/users/:user_id', async function (req, res) {
  console.log(req.originalUrl, req.body);

  try {
    await client.connect();
    console.log('connection done for insert.');

    const result = await client.db("alidb").collection("users")
      .updateOne({ _id: new ObjectId(req.originalUrl.split('users/')[1]) }, { $set: req.body });

    const cursor = client.db("alidb").collection("users").find({});
    myObj = await cursor.toArray();
  } finally {
    await client.close();
  }
  res.json(myObj);
})

app.delete('/users/:user_id', async function (req, res) {
  console.log(req.body);

  try {
    // await client.connect();
    console.log('connection done for delete.');

    const result = await client.db("alidb").collection("users")
      .deleteOne({ _id: new ObjectId(req.originalUrl.split('users/')[1]) });

    console.log(result);
    myObj = await client.db("alidb").collection("users").find({}).toArray();
  } finally {
    // await client.close();
  }
  res.json(myObj);
})

app.put('/login', async function (req, res) {
  console.log(req.body);
  const query = req.body;
  var hashPassword = '';

  var auth = false; var auth = false;
  try {
    await client.connect();
    console.log('connection done for login.');
    await client.db("alidb").collection('auth').findOne({ 'name': query.name }).then((results) => {
      console.log(results);
      if (results != null) {
        hashPassword = results.password;
        query.hash = results.password;
        query.permissions = results.permissions;
      } else hashPassword = '';

    });

    // await bcrypt.compare(query.password, query.hash).then((value) => auth = value);

    const token = jwt.sign(
      { name: query.name, password: query.password },
      privateKey,
      {
        expiresIn: "24h",
      }
    );
    console.log('add data in token');
    if (auth)
      await client.db("alidb").collection('tokens').insertOne(
        {
          'token': token,
          'user_id': query.name,
          'promessions': query.permissions,
          'create_time': new Date().toLocaleString(),
          'valid_time': '24h'
        }
      ).then((results) => {
        console.log(results);
        query.token = token;
      });

  } finally {
    await client.close();
  }

  if (auth) {
    res.json({ 'auth': true, 'token': query.token, 'data': 'successfully' });
  }
  else {
    res.json({ 'auth': false, 'data': 'wrong auth' });
  }

})

app.put('/register', async function (req, res) {
  console.log(req.body);
  var password = req.body.password;
  var query = req.body;
  delete query.password;

  var registered = false;

  try {
    await client.connect();
    console.log('connection done for register.');

    await client.db("alidb").collection('auth').findOne(query).then(async (res) => {

      var hashPassword = '';
      // await bcrypt.hash(password, 10).then((res) => hashPassword = res);
      query.password = hashPassword;
      query.promessions = ['user'];

      console.log(query);

      if (res == null)
        await client.db("alidb").collection('auth').insertOne(query, function (err, res) {
          registered = true;
          console.log(res);
        });
      else registered = false;

    });


  } finally {
    await client.close();
  }
  res.json({ 'result': registered ? 'Auth Created' : 'Auth Available' });
})

///////////////// questions /////////////
app.put('/questions/create', async function (req, res) {
  console.log(req.body);
  var query = req.body;
  try {
    myObj = {};
    myObj.status = 400;
    await client.connect();
    console.log('connection done for insert.', query);

    var result = await client.db(dbName).collection('questions').insertOne(query);
    console.log(result);
    if(result.acknowledged){
      myObj.status = 200;
      myObj.msg = 'Inserted done.';
      myObj.doc = result.insertedId;
    }
  } finally {
    await client.close();
  }
  res.json(myObj);
})

app.get('/questions', async function (req, res) {
  console.log(req.body);
  var query = req.body;
  try {

    await client.connect();
    console.log('connection done for reading.', query);

    const cursor = client.db(dbName).collection("questions").find({}).limit(10).skip(0);
    myObj = {};
    myObj.status = 200;
    myObj.msg = 'data found';
    myObj.docs = await cursor.toArray();

  } finally {
    await client.close();
  }

  res.json(myObj);
})

///////////// items /////////////
app.get('/items', async function (req, res) {
  console.log(req.body);
  var query = req.body;
  try {

    await client.connect();
    console.log('connection done for reading.', query);

    const cursor = client.db("alidb").collection("items").find({}).limit(10).skip(0);
    myObj = {};
    myObj.docs = await cursor.toArray();
    myObj.status = 200;
    myObj.msg = 'data found';

  } finally {
    await client.close();
  }

  res.json(myObj);
})

app.put('/create_order', async function (req, res) {
  console.log(req.body);
  var query = req.body;
  try {
    await client.connect();
    console.log('connection done for insert.', query);

    await client.db("alidb").collection('orders').insertOne(query, function (err, res) {
      console.log('order inserted', res);
    });
    myObj = {};
    myObj.docs = [];
    myObj.status = 200;
    myObj.msg = 'order created';
  } finally {
    await client.close();
  }
  res.json(myObj);
})

app.get('/orders', async function (req, res) {
  console.log(req.body);
  var query = req.body;
  try {
    await client.connect();
    console.log('connection done for read.', query);
    const cursor = client.db("alidb").collection("orders").aggregate([{
      $lookup: {
        from: 'items',
        localField: 'items',
        foreignField: '_id',
        as: 'items'
      }
    }]);7
    
    myObj = {};
    myObj.docs = await cursor.toArray();
    console.log(myObj);
    myObj.status = 200;
    myObj.msg = 'data found';
  } finally {
    await client.close();
  }

  myObj.msg = 'data found';
  res.json(myObj);
})


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
