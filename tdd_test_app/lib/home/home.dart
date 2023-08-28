import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:tdd_test_app/home/data_source/read_questions_ds.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool isConnected = false;
  List<dynamic> questions = [];

  @override
  void initState() {
    connect();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Questions List'),
        actions: [
          IconButton(
              onPressed: () {
                questionsList();
              },
              icon: const Icon(Icons.refresh))
        ],
      ),
      body: SafeArea(
          child: Center(
        child: Column(
          children: [
            const Text('Connect To Server'),
            isConnected
                ? const Text('Server connection done.')
                : ElevatedButton(
                    onPressed: () async {
                      connect();
                    },
                    child: const Text('Connect')),
            ...questions
                .map(
                  (e) => Card(
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Column(
                        children: [
                          Text(e['question']),
                          Text(e['create_time']),
                        ],
                      ),
                    ),
                  ),
                )
                .toList()
          ],
        ),
      )),
      floatingActionButton: FloatingActionButton.small(
          onPressed: () {
            takeQuestion(context);
          },
          child: const Icon(Icons.add)),
    );
  }

  takeQuestion(BuildContext context) {
    String question = '';
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Write Question Details'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            TextField(
              maxLines: 4,
              onChanged: (val) {
                question = val;
              },
              decoration: const InputDecoration(
                border: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.grey, width: 1),
                ),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () {
                    uploadQuestion(question);
                    Navigator.pop(context);
                  },
                  child: const Text('Save'),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  uploadQuestion(String question) async {
    if (question == '') return;
    var url = Uri.http(
      'localhost:3000',
      'questions/create',
    );
    final doc = {
      'user_id': 'admin',
      'question': question,
      'create_time': DateTime.now().toIso8601String()
    };
    // Await the http get response, then decode the json-formatted response.
    var response = await http.put(url, body: doc);
    debugPrint(response.body);
    if (response.statusCode == 200) {
      debugPrint('update done.');
      questionsList();
    }

    print('questions $question');
  }

  connect() async {
    var url = Uri.http(
      'localhost:3000',
      'connect',
    );
    // Await the http get response, then decode the json-formatted response.
    var response = await http.get(url);
    debugPrint(response.body);
    if (response.statusCode == 200) {
      setState(() => isConnected = true);
      questionsList();
    }
  }

  questionsList() async {
    ReadQuestionDS()().then((value) {
      questions = jsonDecode(value)['docs'];
      setState(() {});
    }).catchError((err) {
      debugPrint(err);
    });

    // var url = Uri.http(
    //   'localhost:3000',
    //   'questions',
    // );
    // // Await the http get response, then decode the json-formatted response.
    // var response = await http.get(url);
    // if (response.statusCode == 200) {
    //   questions = jsonDecode(response.body)['docs'];
    //   setState(() {});
    // }
    // debugPrint(response.body);
  }
}
