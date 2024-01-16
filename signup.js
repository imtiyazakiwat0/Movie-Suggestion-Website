// Wait for the DOM to be fully loaded before running any code
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
  
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = signupForm.email.value;
      const password = signupForm.password.value;
  
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // User has signed up successfully
          const user = userCredential.user;
          console.log('User signed up successfully:', user.email); // Print the success message
          // Redirect to the home page or wherever you want to navigate after signup
          window.location.href = 'index.html'; // Redirect to index.html
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert(errorMessage);
        });
    });
  });
  