// Initialize Firebase (Make sure you have already initialized it in firebase-config.js)
// ...

// Get references to HTML elements
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const userList = document.getElementById("userList");
const chatArea = document.getElementById("chatArea");
const chatUsername = document.getElementById("chatUsername");
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Function to display user list after searching
function displayUserList(users) {
  userList.innerHTML = ""; // Clear previous list

  users.forEach((user) => {
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item");
    listItem.innerText = user.displayName + " (" + user.username + ")";
    listItem.setAttribute("data-uid", user.uid); // Store user ID in data-uid attribute
    userList.appendChild(listItem);
  });
}

// Function to display chat messages
function displayChatMessages(messages) {
  chatMessages.innerHTML = ""; // Clear previous messages

  messages.forEach((message) => {
    const messageDiv = document.createElement("div");
    messageDiv.innerText = message.sender + ": " + message.content;
    chatMessages.appendChild(messageDiv);
  });
}

// Event listener for search button
searchBtn.addEventListener("click", () => {
  const searchTerm = searchInput.value.trim();
  if (searchTerm === "") {
    return; // Do nothing if search input is empty
  }

  // TODO: Implement the logic to search for users by name or username
  // Fetch the users that match the search term from Firebase database
  // Example code:
  firebase
    .database()
    .ref("users")
    .orderByChild("displayName")
    .equalTo(searchTerm)
    .once("value")
    .then((snapshot) => {
      const matchingUsers = [];
      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        matchingUsers.push(user);
      });
      displayUserList(matchingUsers);
    })
    .catch((error) => {
      console.error("Error searching users:", error);
    });
});

// Event listener for clicking on a user in the list
userList.addEventListener("click", (event) => {
  const target = event.target;
  if (target.tagName === "LI") {
    const uid = target.getAttribute("data-uid");
    const displayName = target.innerText.split(" (")[0]; // Get the username from the list item text

    // Show the chat area with the selected user
    chatUsername.innerText = "Chat with: " + displayName;
    chatArea.style.display = "block";

    // TODO: Implement the logic to fetch and display the chat messages between the current user and the selected user
    // Example code:
    firebase
      .database()
      .ref("messages")
      .orderByChild("uid")
      .equalTo(uid)
      .once("value")
      .then((snapshot) => {
        const messages = [];
        snapshot.forEach((childSnapshot) => {
          const message = childSnapshot.val();
          messages.push(message);
        });
        displayChatMessages(messages);
      })
      .catch((error) => {
        console.error("Error fetching chat messages:", error);
      });
  }
});

// Event listener for sending a message
sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message !== "") {
    // TODO: Implement the logic to send the message to the selected user
    // Example code:
    const uid = /* Get the UID of the selected user */
    const sender = /* Get the display name of the current user */
    // Save the message to Firebase database
    firebase
      .database()
      .ref("messages")
      .push({
        uid: uid,
        sender: sender,
        content: message,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      })
      .then(() => {
        console.log("Message sent successfully!");
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  }
  messageInput.value = ""; // Clear the message input after sending
});
