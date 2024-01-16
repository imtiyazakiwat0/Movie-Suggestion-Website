document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("backBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const profilePicture = document.getElementById("profilePicture");
  const profilePictureInput = document.getElementById("profilePictureInput");
  const displayNameInput = document.getElementById("displayNameInput");
  const lastSeenInput = document.getElementById("lastSeenInput");
  const onlineStatusInput = document.getElementById("onlineStatusInput");

  // Redirect to the homepage
  backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // Logout button event listener
  logoutBtn.addEventListener("click", () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("User logged out successfully");
        // Redirect to the login page or wherever you want to navigate after logout
        window.location.href = "login.html";

      })
      .catch((error) => {
        console.error("Error occurred while logging out:", error);
      });
  });

  // Display user profile details
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // Set profile picture if available
      if (user.photoURL) {
        profilePicture.src = user.photoURL;
        profilePicture.classList.add("rounded-circle", "img-thumbnail");
      }

      // Set display name if available
      if (user.displayName) {
        displayNameInput.value = user.displayName;
      }

      // Set last seen options if available
      const lastSeen = user.lastSeen || "everyone";
      lastSeenInput.value = lastSeen;

      // Set online status if available
      onlineStatusInput.checked = user.onlineStatus || false;
    }
  });

  // Save Settings button event listener
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  saveSettingsBtn.addEventListener("click", () => {
    const user = firebase.auth().currentUser;
    if (user) {
      const displayName = displayNameInput.value;
      const lastSeen = lastSeenInput.value;
      const onlineStatus = onlineStatusInput.checked;

      // Update user profile
      user.updateProfile({
        displayName: displayName,
        lastSeen: lastSeen,
        onlineStatus: onlineStatus,
      }).then(() => {
        console.log("User profile updated successfully");
        alert("profile updated successfully")
      }).catch((error) => {
        console.error("Error updating user profile:", error);
      });
    }
  });

  // Profile picture upload event listener
  profilePictureInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const user = firebase.auth().currentUser;

    if (user && file) {
      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child(user.uid + "-" + file.name);
      const uploadTask = fileRef.put(file);

      uploadTask.on("state_changed",
        null,
        (error) => {
          console.error("Error uploading file:", error);
        },
        () => {
          // Get the download URL of the uploaded file
          uploadTask.snapshot.ref.getDownloadURL().then((url) => {
            // Update user profile photo
            user.updateProfile({
              photoURL: url,
            }).then(() => {
              console.log("User profile photo updated successfully");
              profilePicture.src = url;
            }).catch((error) => {
              console.error("Error updating user profile photo:", error);
            });
          }).catch((error) => {
            console.error("Error getting download URL:", error);
          });
        }
      );
    }
  });
});
