import 'package:http/http.dart' as http;

class ReadQuestionDS {
  Future call() async {
    var url = Uri.http(
      'localhost:3000',
      'questions',
    );

    final response = await http.get(url);

    if (response.statusCode == 200) {
      return Future.value(response.body);
    } else {
      return Future.error(response.statusCode);
    }
  }
}
