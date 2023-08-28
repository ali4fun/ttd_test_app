import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class CreateQuestionDS {
  Future call(String question, String userId) async {
    var url = Uri.http(
      'localhost:3000',
      'questions/create',
    );
    final doc = {
      'user_id': userId,
      'question': question,
      'create_time': DateTime.now().toIso8601String()
    };

    final response = await http.put(url, body: doc);
    debugPrint(response.body);
    if (response.statusCode == 200) {
      return Future.value(response.body);
    } else {
      return Future.error(response.statusCode);
    }
  }
}
