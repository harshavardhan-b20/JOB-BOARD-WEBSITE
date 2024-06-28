document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginContainer = document.getElementById('loginContainer');
  const signupContainer = document.getElementById('signupContainer');
  const loginLink = document.getElementById('loginLink');
  const signupLink = document.getElementById('signupLink');
  const loginMessage = document.getElementById('loginMessage');
  const signupMessage = document.getElementById('signupMessage');
  

  // Hide signup container initially
  signupContainer.style.display = 'none';

  // Switch to signup form
  signupLink.addEventListener('click', function (e) {
    e.preventDefault();
    loginContainer.style.display = 'none';
    signupContainer.style.display = 'block';
  });

  // Switch to login form
  loginLink.addEventListener('click', function (e) {
    e.preventDefault();
    signupContainer.style.display = 'none';
    loginContainer.style.display = 'block';
  });

// Handle login form submission
loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const role = document.getElementById('loginRole').value;

  // Send login data to backend
  fetch('http://localhost:5500/api/auth/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, role })
  })
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          if (data && data.token) {
              localStorage.setItem('jwtToken', data.token);
              localStorage.setItem('username', data.username); // Store username in local storage
              switch (role) {
                  case 'jobseeker':
                      window.location.href = '/jobboard/jobseeker.html';
                      break;
                  case 'recruiter':
                  case 'admin':
                      window.location.href = '/jobboard/recruiter.html';
                      break;
                  default:
                      break;
              }
          } else if (data?.message) {
              loginMessage.textContent = data.message;
          } else if (data?.emailnotfound) {
              loginMessage.textContent = data.emailnotfound;
          } else if (data?.passwordincorrect) {
              loginMessage.textContent = data.passwordincorrect;
          } else {
              console.log(data); // Log the response for debugging
              loginMessage.textContent = 'Login failed';
          }
      })
      .catch(error => {
          console.error('Error:', error);
          loginMessage.textContent = 'An error occurred during login';
      });
});


  // Handle signup form submission
  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value; 
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const rePassword = document.getElementById('signupRePassword').value;
    const role = document.getElementById('signupRole').value;

    if (password !== rePassword) {
      signupMessage.textContent = 'Passwords do not match';
      return;
    }

    // Send signup data to backend
    fetch('http://localhost:5500/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, email, password, role })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'block';
        loginMessage.textContent = 'Signup successful! Please log in.';
      })
      .catch(error => {
        console.error('Error:', error);
        signupMessage.textContent = 'An error occurred during signup';
      });
  });




});

