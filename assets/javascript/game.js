window.gameEnv = {
  triviaQue: [],
  triviaApi: "https://opentdb.com/api.php?",
  imgApi: "https://api.unsplash.com/?" +
  "client_id=9c65426339aa4c584d1c2dd8b160cbfa502cf5d143c111141de73600bbb0daca" +
  "&w=1920" +
  "&h=1080",

  display: [
    //initial display
    function () {
      $("#page-title").fadeIn(500, function () {
        $("#startup").fadeIn(500, gameEnv.setup());
      });
    }
  ],

  initialize: function () {
    this.display[0]();
  },

  getOptions: function() {
    let defaults = ["questions", "difficulty", "category"];
    let amount, difficulty, category;
    let complete = true;
    $.each($("select option:selected"), function (index, value) {
      console.log(defaults.indexOf(value.text));
      if (defaults.indexOf(value.text) > -1 && complete) {
        alert("Complete setup to continue");
        complete = false;
      }
      else if (value.value === "dif" && complete) {
        difficulty = value.text;
      }
      else if (value.value === "amount" && complete) {
        amount = value.text;
      }
      else if (value.value.split("-")[0] === "cat" && complete) {
        category = value.value.split("-").pop();
      }
    });
    if (!complete) {
      return
    }
    this.getTrivia(category, amount, difficulty)
  },

  generateParameters: function() {
    let parameters = [];
    let i = 0;
    while (parameters.length < 5) {
      let category = Math.floor(Math.random() * (32 - 9) + 9).toString();
      let difficulty;
      let duplicate = false;
      for (let value of parameters) {
        if (value[0].indexOf(category) > -1) {
          duplicate = true;
          break;
        }
      }
      if (!duplicate) {
        if (i < 1) {
          difficulty = "easy"
        }
        else if (i < 4) {
          difficulty = "medium";
        }
        else {
          difficulty = "hard"
        }
        parameters.push([category, difficulty, "15"]);
        i++;
      }
    }
    return parameters;
  },

  startArena: function() {
    let parameters = this.generateParameters();
    console.log(parameters);
    parameters.forEach(function(element) {
      gameEnv.getTrivia(element[0], element[2], element[1], parameters);
    })

  },


  getTrivia: function(category, amount, difficulty, parameters) {
    $.ajax({
      url: "https://opentdb.com/api.php?"
      + `category=${category}&`
      + `amount=${amount}&`
      + `difficulty=${difficulty}&`,
      // + `token=${gameEnv.session}`,
      method: "GET"
    }).then(function(response) {
      console.log(response.response_code);
      if (response.response_code > 0) {
        let adjust = parseInt(category);
        let exit = false;
        while (!exit) {
          if (adjust < 33) {
            adjust++;
          }
          else{
            adjust = 9;
          }
          for (let value of parameters) {
            if ((!value[0].indexOf(adjust.toString()) > -1)) {
              exit = true;
            }
          }
          if (exit) {
            gameEnv.getTrivia(adjust.toString(), amount, difficulty, parameters);
          }
        }
      }
      else {
        let trivia = {
          questions: response.results,
          category: category,
          amount: amount,
          difficulty: difficulty,
        };
        gameEnv.triviaQue.push(trivia);
      }
    });
  },


  setup: function() {
    $(".btn").on("click", function () {
      switch ($(this).val()) {
        case "arena":
          gameEnv.startArena();
          break;
        case "custom":
          gameEnv.getOptions()
      }
    });
  },

  randomBackground: function(theme) {
    $.ajax({
      url: gameEnv.imgApi + "count=1",
      method: "GET"
    }).then(function (response) {
      console.log(response);
    });
  }
};

$(document).ready(gameEnv.initialize());

