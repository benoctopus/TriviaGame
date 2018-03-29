class Clock {
  constructor(time) {
    this.clockRunning = false;
    this.time = undefined;
    this.clockRow = $("#clock-row");
    this.clockElement = $("#clock");
    this.currentTime = time;
    this.set()
  }

  set() {
    this.clockRunning = true;
    this.clockElement.text(this.currentTime)
    this.clockInterval = setInterval(this.decrement, 1000)
  }

  decrement() {
    if (this.currentTime < 1) {
      clearInterval(this.clockInterval);
    }
    this.currentTime--;
    this.clockElement.text(this.currentTime);
  }

}

window.gameEnv = {
  answers: $(".answer"),
  triviaBox: $("#trivia-box"),
  startMenu: $("#startup"),
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
        gameEnv.startMenu.fadeIn(500, gameEnv.setup());
      });
    },

    function () {
      console.log("here");
      gameEnv.triviaBox.fadeIn(500);
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
      return;
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
    this.correct = 0;
    this.incorrect = 0;
    this.round = 1;
    this.arenaReady = false;
    this.mode = "arena";
    let parameters = this.generateParameters();
    console.log(parameters);
    parameters.forEach(function (element) {
      gameEnv.getTrivia(element[0], element[2], element[1], parameters);
    });
    this.startMenu.fadeOut(500, this.ajaxWait());
  },

  ajaxWait: function() {
    if (gameEnv.arenaReady) {
      this.roundCorrect = 0;
      this.roundIncorrect = 0;
      console.log("here");
      gameEnv.display[1]();
      gameEnv.number = 1;
      $("#round").text(`Round: ${gameEnv.round}`);
      $("#cat").text(gameEnv.triviaQue[0].questions[0].category);
      $("#number").text(`#: ${gameEnv.number}`);
      gameEnv.loadQuestion();
    }
    else {
      console.log("waiting...");
      let a = setTimeout(gameEnv.ajaxWait, 150);
    }
  },

  setAnswers() {
    this.current = this.triviaQue[0].questions[0];
    let ansSet = $(".answer");
    let i = 0;
    let j = 0;
    let order = this.shuffle([1, 2, 3, 4]);
    this.current.incorrect_answers = this.shuffle(this.current.incorrect_answers);
    if (this.current.type === "boolean") {
      $("#ans-1").text("True");
      $("#ans-2").text("False");
      if (gameEnv.current.correct_answer === "True") {
        $("#ans-1").attr("data-win", "win");
        $("#ans-2").attr("data-win", "loose")
      }
      else {
        $("#ans-2").attr("data-win", "win");
        $("#ans-1").attr("data-win", "loose")
      }
      $("#ans-3, #ans-4").css("display", "none");
      $("#answer-feild").fadeIn(250);
    }
    else {
      ansSet.each(function () {
        ansSet.css("display", "block");
        ansSet.css("display", "list-item");
        console.log($(this));
        if (order[i] === 1) {
          $(this).text(
            htmlFixer(
              gameEnv.current.correct_answer)
          ).attr("data-win", "win");
        }
        else{
          $(this).text(
            htmlFixer(
              gameEnv.current.incorrect_answers[j])
          ).attr("data-win", "loose");
          j++
        }
        i++;
      });
      $("#answer-feild").fadeIn(250);
    }
  },

  startClock: function (time) {
    this.clock = {
    };
    this.clockInterval = setInterval(function (time) {
      if (gameEnv.clock.clockRunning === false) {
      }



    });
  },

  loadQuestion: function() {
    if (typeof this.triviaQue[0].questions[0] === "undefined") {
      this.round++;
      this.triviaQue.splice(0, 1);
      this.ajaxWait();
    }
    this.setAnswers();
    // this.current = this.triviaQue[0].questions[0];
    // let ansSet = $(".answer");
    // let i = 0;
    // let j = 0;
    // let order = this.shuffle([1, 2, 3, 4]);
    // this.current.incorrect_answers = this.shuffle(this.current.incorrect_answers);
    // if (this.current.type === "boolean") {
    //   $("#ans-1").text("True");
    //   $("#ans-2").text("False");
    //   if (gameEnv.current.correct_answer === "True") {
    //     $("#ans-1").attr("data-win", "win");
    //     $("#ans-2").attr("data-win", "loose")
    //   }
    //   else {
    //     $("#ans-2").attr("data-win", "win");
    //     $("#ans-1").attr("data-win", "loose")
    //   }
    //   $("#ans-3, #ans-4").css("display", "none");
    //   $("#answer-feild").fadeIn(250);
    // }
    // else {
    //   ansSet.each(function () {
    //     ansSet.css("display", "block");
    //     ansSet.css("display", "list-item");
    //     console.log($(this));
    //     if (order[i] === 1) {
    //       $(this).text(
    //         htmlFixer(
    //           gameEnv.current.correct_answer)
    //       ).attr("data-win", "win");
    //     }
    //     else{
    //       $(this).text(
    //         htmlFixer(
    //           gameEnv.current.incorrect_answers[j])
    //       ).attr("data-win", "loose");
    //       j++
    //     }
    //     i++;
    //   });
    //   $("#answer-feild").fadeIn(250);
    // }
    gameEnv.triviaQue[0].questions.splice(0,1);
    //win/loose
    $("#question").text(htmlFixer(gameEnv.current.question));
    $("li").on("click", function () {
      let cAns = $(this);
      console.log(cAns.attr("data-win"));
      if (cAns.attr("data-win") === "win") {
        gameEnv.correct++;
        gameEnv.roundCorrect++;
        cAns.attr("data-win", "");
        $("#question").text("Correct");
        cAns.addClass("correct-answer");
        setTimeout(function () {
          cAns.removeClass("correct-answer")
        }, 500);
      }
      else if (cAns.attr("data-win") === "loose") {
        cAns.attr("data-win", "");
        gameEnv.incorrect++;
        gameEnv.roundIncorrect++;
        $("#question").text("Wrong!");
        cAns.addClass("wrong-answer");
        setTimeout(function () {
          cAns.removeClass("wrong-answer")
        }, 500);
      }
      else {
        return
      }
      gameEnv.number++;
      $("#number").text(`#: ${gameEnv.number}`);
      console.log("correct");
      $("#answer-feild").fadeOut(500, function () {
        cAns.removeClass("correct-answer wrong-answer");
        gameEnv.loadQuestion();
      });
      $("li").removeEventListener();
    });
  },

  shuffle: function(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
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
        gameEnv.arenaReady = true;
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

function htmlFixer(string) {
  let ret = string.replace(/&quot;/g, '"');
  ret = ret.replace(/&amp;/g, '&');
  ret = ret.replace(/&#039;/g, "'");
  ret = ret.replace(/&oacute;/g, "o");
  ret = ret.replace(/&iacute;/g, "i");
  ret = ret.replace(/&rsquo;/g, "'");
  return ret;

}
