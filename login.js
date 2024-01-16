document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // User has logged in successfully
        const user = userCredential.user;
        console.log('User logged in successfully:', user.email); // Print the success message
        // Redirect to the home page or wherever you want to navigate after login
        window.location.href = 'index.html'; // Redirect to index.html

      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
  });
});
