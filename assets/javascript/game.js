class Clock {
  //question timer
  constructor(time) {
    this.clockRunning = false;
    this.time = undefined;
    this.clockRow = $("#clock-row");
    this.clockElement = $("#clock");
    this.currentTime = time;
    this.set()
  }

  set() {
    //set clock and interval
    this.clockElement.text(`Time Remaining: ${this.currentTime}`);
    this.clockRow.css("display", "block");
    this.clockInterval = setInterval(this.decrement.bind(this), 1000)
  }

  decrement() {
    // time --
    if (this.currentTime < 1) {
      clearInterval(this.clockInterval);
      $("#question").text("OUT OF TIME");
      $("#answer-feild").fadeOut(750, function () {
        gameEnv.number++;
        $("#number").text(`#: ${gameEnv.number}`);
        gameEnv.incorrect++;
        gameEnv.roundIncorrect++;
        gameEnv.loadQuestion();
      });
      $("li").removeEventListener();
    }
    this.currentTime--;
    this.clockElement.text(`Time Remaining: ${this.currentTime.toString()}`);
  }

}

window.gameEnv = {
  answers: $(".answer"),
  triviaBox: $("#trivia-box"),
  startMenu: $("#startup"),
  triviaQue: [],
  triviaApi: "https://opentdb.com/api.php?",

  //implement later
  // imgApi: "https://api.unsplash.com/?" +
  // "client_id=9c65426339aa4c584d1c2dd8b160cbfa502cf5d143c111141de73600bbb0daca" +
  // "&w=1920" +
  // "&h=1080",

  display: [
    //initial display
    function () {
    //0 start
      $("#page-title").fadeIn(500, function () {
        gameEnv.startMenu.fadeIn(500, gameEnv.setup());
      });
    },

    function () {
    //1 game
      gameEnv.triviaBox.fadeIn(600);
    },

    function() {
    //2 round change
      gameEnv.triviaBox.fadeOut(600, function () {
        $("#roundUp").fadeIn(600, function () {
          debugger;
          setTimeout(function () {
            $("#roundUp").fadeOut(600);
            gameEnv.loadQuestion.bind(gameEnv)();
          })
        })

      });
    },

    function () {
    //3 endgame
      $("#clock-row").fadeOut(500);
      $("#trivia-box").fadeOut(500, function() {
        $("#finalH").text("Final Results");
        $("#final-stats").text(`Score: 
        ${Math.floor((gameEnv.correct / 75) * 100)}`
         + "%");
        $("#final").fadeIn(500, function () {
          setTimeout(function () {
            $("#final").fadeOut(500, function () {
              window.location.reload();
            });
          }, 3000);
        });
      })
    }
  ],

  initialize: function () {
    //starts runtime
    this.display[0]();
  },

  // implement later
  // getOptions: function() {
  //   let defaults = ["questions", "difficulty", "category"];
  //   let amount, difficulty, category;
  //   let complete = true;
  //   $.each($("select option:selected"), function (index, value) {
  //     console.log(defaults.indexOf(value.text));
  //     if (defaults.indexOf(value.text) > -1 && complete) {
  //       alert("Complete setup to continue");
  //       complete = false;
  //     }
  //     else if (value.value === "dif" && complete) {
  //       difficulty = value.text;
  //     }
  //     else if (value.value === "amount" && complete) {
  //       amount = value.text;
  //     }
  //     else if (value.value.split("-")[0] === "cat" && complete) {
  //       category = value.value.split("-").pop();
  //     }
  //   });
  //   if (!complete) {
  //     return;
  //   }
  //   this.getTrivia(category, amount, difficulty)
  // },

  generateParameters: function(num) {
    //create parameters array for getOptions
    let parameters = [];
    let i = 0;
    while (parameters.length < num) {
      let category = Math.floor(Math.random() * (32 - 9) + 9).toString();
      let difficulty;
      let duplicate = false;
      for (let value of parameters) {
        if (value[0].indexOf(category) > -1) {
          duplicate = true;
          break;
        }
      }
      //ensure unique
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
    //initialize arena game Mode
    this.correct = 0;
    this.incorrect = 0;
    gameEnv.round = 0;
    this.arenaReady = false;
    this.mode = "arena";
    let parameters = this.generateParameters(5);
    parameters.forEach(function (element) {
      gameEnv.getTrivia(element[0], element[2], element[1], parameters);
    });
    this.startMenu.fadeOut(500, this.ajaxWait());
  },

  ajaxWait: function() {
    //start game when atleast one round is ready
    //processes round change
    //check if gameover then execute
    if (gameEnv.arenaReady) {
      clearInterval(this.clock.clockInterval);

      if (typeof  gameEnv.triviaQue[0] === "undefined") {
        gameEnv.triviaQue = [];
        gameEnv.current = "";
        gameEnv.round = 0;
        $("#roundH").text("Round: 1");
        $("#round-stats").text("  ");
        gameEnv.display[3]();
        return;
      }
      // gameEnv.round++;
      gameEnv.triviaBox.fadeOut(600, function () {
        if (gameEnv.round >= 1) {
          gameEnv.round++;
          $("#roundH").text(`Round: ${window.gameEnv.round}`);
          $("#round-stats").text(`Last Round Score: ${
          Math.floor((gameEnv.roundCorrect / 15) * 100) + "%"
            }`);
        }
        else if (gameEnv.round < 1) {
          $("#roundH").text(`Round: 1`);
          $("#round-stats").text("   ");
          gameEnv.round = 1

        }
        $("#roundUp").fadeIn(600, function () {
          setTimeout(function () {
            $("#roundUp").fadeOut(600, function () {
              gameEnv.roundCorrect = 0;
              gameEnv.roundIncorrect = 0;
              gameEnv.display[1]();
              gameEnv.number = 1;
              $("#round").text(`Round: ${gameEnv.round}`);
              $("#cat").text(gameEnv.triviaQue[0].questions[0].category);
              $("#number").text(`#: ${gameEnv.number}`);
              gameEnv.loadQuestion();
            });
          }, 1500)
        })
      });
    }
    else {
      let a = setTimeout(gameEnv.ajaxWait, 150);
    }
  },

  setAnswers() {
    //bind answers and quetion resplonse from api to html elements
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

  loadQuestion: function() {
    //next question //listener initialization & reset
    if (typeof this.triviaQue[0].questions[0] === "undefined") {
      clearInterval(gameEnv.clock.clockInterval);
      this.triviaQue.splice(0, 1);
      this.ajaxWait();
    }

    else {
      this.setAnswers();
      if (typeof gameEnv.clock !== "undefined") {
        clearInterval(this.clock.clockInterval);
      }

      this.clock = new Clock(10);
      gameEnv.triviaQue[0].questions.splice(0, 1);

      //win/loose
      $("#question").text(htmlFixer(gameEnv.current.question));
      $("li").on("click", function () {
        let cAns = $(this);
        if (cAns.attr("data-win") === "win") {
          gameEnv.correct++;
          gameEnv.roundCorrect++;
          cAns.attr("data-win", "");
          $("#question").text("Correct");
          cAns.addClass("correct-answer");
          $("li").off("click");
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
          $("li").off("click");
          setTimeout(function () {
            cAns.removeClass("wrong-answer")
          }, 500);
        }
        else {
          return;
        }
        clearInterval(gameEnv.clock.clockInterval);
        gameEnv.number++;
        if (gameEnv.number < 16) {
          $("#number").text(`#: ${gameEnv.number}`);
        }
        $("#answer-feild").fadeOut(600, function () {
          gameEnv.loadQuestion();
        });
      });
    }
  },

  shuffle: function(array) {
    //randomize array
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
    //send ajax for trivia questions
    $.ajax({
      url: "https://opentdb.com/api.php?"
      + `category=${category}&`
      + `amount=${amount}&`
      + `difficulty=${difficulty}&`,
      // + `token=${gameEnv.session}`,
      method: "GET"
    }).then(function(response) {
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
    //title menu event listener
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

  // Implement later
  // randomBackground: function(theme) {
  //   $.ajax({
  //     url: gameEnv.imgApi + "count=1",
  //     method: "GET"
  //   }).then(function (response) {
  //     console.log(response);
  //   });
  // }
};

$(document).ready(gameEnv.initialize());

function htmlFixer(string) {
  //fix html charecters for $.text
  let ret = string.replace(/&quot;/g, '"');
  ret = ret.replace(/&amp;/g, '&');
  ret = ret.replace(/&#039;/g, "'");
  ret = ret.replace(/&oacute;/g, "o");
  ret = ret.replace(/&iacute;/g, "i");
  ret = ret.replace(/&rsquo;/g, "`");
  ret = ret.replace(/&eacute;/g, "`");
  ret = ret.replace(/&tilde;/g, "`");
  return ret;

}
