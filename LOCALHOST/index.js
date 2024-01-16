$(document).ready(function () {
  // Firebase Firestore database reference
  var firestore = firebase.firestore();
  var moviesCollection = firestore.collection('movies');

  // Code to check if the user has logged in before
  let loggedInUser = localStorage.getItem("loggedInUser");
  if (loggedInUser) {
    $("#loginForm").hide();
    $("#movieSuggestions").show();
    displayMovies();
  }

  // Code to handle the Login form submission
  $("#loginBtn").click(function (event) {
    event.preventDefault();
    let username = $("#username").val();
    if (username) {
      localStorage.setItem("loggedInUser", username);
      $("#loginForm").hide();
      $("#movieSuggestions").show();
      displayMovies();
    }
  });

  // Code to handle the Logout button click
  $("#logoutBtn").click(function (event) {
    event.preventDefault();
    localStorage.removeItem("loggedInUser");
    $("#movieSuggestions").hide();
    $("#loginForm").show();
  });

  // Code to handle the Suggest button click
  $("#suggestBtn").click(function (event) {
    event.preventDefault();
    let title = $("#movieTitle").val();
    let rating = 5;
    let user = localStorage.getItem("loggedInUser");
    if (title) {
      saveMovie(title, rating, user);
      $("#movieTitle").val("");
      displayMovies();
    }
  });

  // Code to handle the movie title auto-suggest
  $("#movieTitle").on("input", function () {
    let input = $(this).val().trim().toLowerCase();
    if (input === "") {
      $("#suggestionsList").empty();
      return;
    }
    let suggestions = getMovieSuggestions(input);
    displayMovieSuggestions(suggestions);
  });

  function getMovieSuggestions(input) {
    let movies = [];
    moviesCollection.get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          let movie = doc.data();
          if (movie.title.toLowerCase().includes(input)) {
            movies.push(movie.title);
          }
        });
      })
      .catch(function (error) {
        console.error("Error retrieving movie suggestions: ", error);
      });
    return movies;
  }

  function displayMovieSuggestions(suggestions) {
    let suggestionsList = $("#suggestionsList");
    suggestionsList.empty();
    for (let i = 0; i < suggestions.length; i++) {
      let suggestion = $("<li>")
        .addClass("suggestion")
        .text(suggestions[i]);
      suggestionsList.append(suggestion);
    }
  }

  $(document).on("click", ".suggestion", function () {
    let suggestion = $(this).text();
    $("#movieTitle").val(suggestion);
    $("#suggestionsList").empty();
  });

  // Code to fetch suggested movies from the database and display them on the website
  function displayMovies() {
    moviesCollection.get()
      .then(function (querySnapshot) {
        let movies = [];
        querySnapshot.forEach(function (doc) {
          let movie = doc.data();
          movies.push(movie);
        });

        // Sort the movies by rating in descending order
        movies.sort(function (a, b) {
          return b.rating - a.rating;
        });

        let moviesList = $("#moviesList");
        moviesList.empty();
        for (let i = 0; i < movies.length; i++) {
          let movie = movies[i];
          let ratingInput = $("<input>").attr({
            type: "range",
            min: 0,
            max: 10,
            step: 0.5,
            value: movie.rating,
            class: "ratingInput",
            "data-movie-id": movie.id,
          });
          let ratingDiv = $("<div>")
            .addClass("rating")
            .append(ratingInput)
            .append($("<span>").addClass("ratingValue").text(movie.rating));
          let commentForm = $("<form>")
            .addClass("commentForm")
            .attr("data-movie-id", movie.id);
          let commentInput = $("<input>").attr({
            type: "text",
            class: "form-control commentInput",
            placeholder: "Add a comment",
          });
          let commentBtn = $("<button>")
            .attr("type", "submit")
            .addClass("btn btn-primary")
            .text("Submit");
          commentForm.append(commentInput).append(commentBtn);
          let commentsList = $("<ul>").addClass("commentsList");
          for (let j = 0; j < movie.comments.length; j++) {
            let comment = $("<li>").addClass("comment").text(movie.comments[j]);
            commentsList.append(comment);
          }
          let movieDiv = $("<div>")
            .addClass("movie")
            .attr("data-movie-id", movie.id);
          let poster = $("<img>")
            .addClass("poster")
            .attr("src", movie.posterUrl);
          let title = $("<h3>").addClass("title").text(movie.title);
          let summary = $("<p>").addClass("summary").text(movie.summary);
          let user = $("<p>")
            .addClass("user")
            .text("Suggested by " + movie.user);
          movieDiv
            .append(poster)
            .append(
              $("<div>").addClass("details").append(title).append(summary).append(user).append(ratingDiv).append(commentForm).append(commentsList)
            );
          moviesList.append(movieDiv);
        }
      })
      .catch(function (error) {
        console.error("Error retrieving movies: ", error);
      });
  }

  // Code to save the suggested movie to the database
  function saveMovie(title, rating, user) {
    let movieInfo = {
      title: title,
      rating: rating,
      user: user,
      summary: "",
      posterUrl: "",
      comments: []
    };

    $.ajax({
      url: "https://www.omdbapi.com/",
      data: { t: title, apikey: "368967f2" },
      success: function (response) {
        if (response.Response == "True") {
          movieInfo.summary = response.Plot;
          movieInfo.posterUrl = response.Poster;
        }
        saveMovieSuggestion(movieInfo);
      },
      error: function () {
        saveMovieSuggestion(movieInfo);
      },
    });
  }

  function saveMovieSuggestion(movieInfo) {
    moviesCollection.add(movieInfo)
      .then(function (docRef) {
        console.log("Movie suggestion added with ID: ", docRef.id);
      })
      .catch(function (error) {
        console.error("Error adding movie suggestion: ", error);
      });
  }

  function updateMovieRating(movieId, rating) {
    moviesCollection.doc(movieId).update({ rating: rating })
      .then(function () {
        console.log("Movie rating updated successfully");
      })
      .catch(function (error) {
        console.error("Error updating movie rating: ", error);
      });
  }

  function saveMovieComment(movieId, comment) {
    moviesCollection.doc(movieId).update({
        comments: firebase.firestore.FieldValue.arrayUnion(comment)
      })
      .then(function () {
        console.log("Movie comment added successfully");
      })
      .catch(function (error) {
        console.error("Error adding movie comment: ", error);
      });
  }
});


// Code to handle sign-in with phone number
function signInWithPhoneNumber(phoneNumber) {
  var phoneNumber = "+1" + phoneNumber; // Modify this according to your phone number format
  var appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');

  firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
    .then(function (confirmationResult) {
      var verificationCode = window.prompt('Please enter the verification code that was sent to your phone:');
      return confirmationResult.confirm(verificationCode);
    })
    .then(function (result) {
      // User signed in successfully with phone number
      var user = result.user;
      // Do something with the signed-in user
    })
    .catch(function (error) {
      // Handle sign-in errors
      console.error("Error signing in with phone number: ", error);
    });
}

// Code to handle sign-in with Google (Gmail) account
function signInWithGoogle() {
  var provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth().signInWithPopup(provider)
    .then(function (result) {
      // User signed in successfully with Google account
      var user = result.user;
      // Do something with the signed-in user
    })
    .catch(function (error) {
      // Handle sign-in errors
      console.error("Error signing in with Google account: ", error);
    });
}



// Code to handle phone sign-in button click
$("#phoneSignInBtn").click(function (event) {
  event.preventDefault();
  var phoneNumber = $("#phoneNumberInput").val();
  if (phoneNumber) {
    signInWithPhoneNumber(phoneNumber);
  }
});

// Code to handle Google sign-in button click
$("#googleSignInBtn").click(function (event) {
  event.preventDefault();
  signInWithGoogle();
});
