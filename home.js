// Function to handle content upload
function uploadContent() {
  const file = fileInput.files[0];
  const content = textContent.value.trim();
  const user = firebase.auth().currentUser;

  if (user) {
    // Get the current timestamp
    const timestamp = firebase.database.ServerValue.TIMESTAMP;

    if (content !== "" || file) {
      // Upload file to Firebase Storage (if selected)
      let fileUrl = null;
      if (file) {
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(file.name);
        const uploadTask = fileRef.put(file);

        uploadTask.on(
          "state_changed",
          null,
          (error) => {
            console.error("Error uploading file:", error);
          },
          () => {
            // Get the download URL of the uploaded file
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then((url) => {
                fileUrl = url;
                // Save suggestion to Firebase Realtime Database
                saveSuggestionToDatabase(
                  user.displayName,
                  user.photoURL,
                  content,
                  fileUrl,
                  timestamp
                );
              })
              .catch((error) => {
                console.error("Error getting download URL:", error);
              });
          }
        );
      } else {
        // Save suggestion to Firebase Realtime Database (without file)
        saveSuggestionToDatabase(
          user.displayName,
          user.photoURL,
          content,
          null,
          timestamp
        );
      }
    }
  } else {
    console.log("No user is currently signed in.");
    // Redirect to the login page
    window.location.href = "login.html";
  }
}

// ... (rest of the code as before)

// Display user profile details
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    const profilePicture = document.createElement("img");
    const username = document.createElement("span");
    profilePicture.src = user.photoURL || "/img/default-profile.jpg"; // Provide a default profile picture URL
    profilePicture.classList.add("rounded-circle", "profile-picture"); // Add the 'profile-picture' class
    username.innerText = user.displayName || "Anonymous"; // Set a default name if the user has no display name

    const nav = document.querySelector("nav");
    nav.insertBefore(profilePicture, nav.firstChild);
    nav.appendChild(username);
  } else {
    // Redirect to the login page if the user is not signed in
    window.location.href = "login.html";
  }
});

// ... (rest of the code as before)

// ... (rest of the code as before)

// Function to save suggestion to Firebase Realtime Database
function saveSuggestionToDatabase(user, photoURL, content, fileUrl, timestamp) {
  const suggestionData = {
    user: user,
    photoURL: photoURL,
    content: content,
    timestamp: timestamp,
    fileUrl: fileUrl,
  };

  // For this example, we assume you have a 'suggestions' node in your database
  const databaseRef = firebase.database().ref("suggestions");
  databaseRef
    .push(suggestionData)
    .then(() => {
      console.log("Suggestion saved successfully:", suggestionData);

      // Clear the upload form
      fileInput.value = "";
      textContent.value = "";
    })
    .catch((error) => {
      console.error("Error saving suggestion:", error);
    });
}

// Function to display suggestions from other users
function displaySuggestions(suggestionsData) {
  suggestionsList.innerHTML = ""; // Clear previous suggestions

  suggestionsData.forEach((suggestion) => {
    const suggestionElement = document.createElement("div");
    suggestionElement.classList.add(
      "suggestion",
      "my-custom-suggestion",
      "custom-styling"
    );

    // User Info Section
    const userInfoDiv = document.createElement("div");
    userInfoDiv.classList.add("user-info", "row");

    const userDiv = document.createElement("div");
    userDiv.classList.add("col-sm-6");
    userDiv.innerHTML = `<span>${suggestion.user}</span>`;
    userInfoDiv.appendChild(userDiv);

    const timestampDiv = document.createElement("div");
    timestampDiv.classList.add("col-sm-6", "text-right");
    timestampDiv.innerHTML = `<span>${formatTimestamp(
      suggestion.timestamp
    )}</span>`;
    userInfoDiv.appendChild(timestampDiv);

    suggestionElement.appendChild(userInfoDiv);

    // Content Section
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");
    contentDiv.innerHTML = suggestion.content;
    suggestionElement.appendChild(contentDiv);

    // File URL (if available)
    if (suggestion.fileUrl) {
      const fileUrlDiv = document.createElement("div");
      fileUrlDiv.classList.add("row", "justify-content-center");

      const imageDiv = document.createElement("div");
      imageDiv.classList.add("col-sm-8");
      const imageTag = document.createElement("img");
      imageTag.src = suggestion.fileUrl;
      imageTag.alt = "Uploaded File";
      imageTag.classList.add("img-fluid");
      imageDiv.appendChild(imageTag);

      fileUrlDiv.appendChild(imageDiv);
      suggestionElement.appendChild(fileUrlDiv);
    }

    suggestionsList.appendChild(suggestionElement);
  });
}

// Format timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedHours = hours < 10 ? "0" + hours : hours;
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  return formattedHours + ":" + formattedMinutes;
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const textContent = document.getElementById("textContent");
  const suggestionsList = document.getElementById("suggestionsList");

  // Logout button event listener
  logoutBtn.addEventListener("click", () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("User logged out successfully");
        // Redirect to the login page or wherever you want to navigate after logout
      })
      .catch((error) => {
        console.error("Error occurred while logging out:", error);
      });
  });

  // Call the function to display suggestions on page load and when new suggestions are added
  const databaseRef = firebase.database().ref("suggestions");
  databaseRef.on("value", (snapshot) => {
    const suggestionsData = snapshot.val() || [];
    const suggestionsArray = Object.values(suggestionsData);
    displaySuggestions(suggestionsArray.reverse()); // Reverse to show the latest suggestions first
  });

  // Upload form event listener
  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    uploadContent(); // Call the uploadContent function when the form is submitted
  });

  // // Display user profile details
  // firebase.auth().onAuthStateChanged(function (user) {
  //   if (user) {
  //     const profilePicture = document.createElement("img");
  //     const username = document.createElement("span");
  //     profilePicture.src = user.photoURL || "/img/default-profile.jpg"; // Provide a default profile picture URL
  //     username.innerText = user.displayName || "Anonymous"; // Set a default name if the user has no display name

  //     const nav = document.querySelector("nav");
  //     nav.insertBefore(profilePicture, nav.firstChild);
  //     nav.appendChild(username);
  //   }
  // }
  // );
});
