const queryUrl = "https://opentdb.com/api.php?";

class Trivia {
  constructor(category, amount) {
    $.ajax({
      url: `https://opentdb.com/api.php?amount=${amount}&category=${category}`,
      method: "get",
    }).then(function(response) {
      console.log(response);
      window.b = response;
    })
  }

}

$(document).ready($("#page-title").fadeIn(500, function() {
  $("#setup").fadeIn(500)
}));



// let a = new Trivia("18", "4");