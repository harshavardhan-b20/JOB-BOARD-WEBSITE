function sendEmail() {
    const firstName = document.getElementById("fname").value.trim();
    const lastName = document.getElementById("lname").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    // Check if any of the fields are empty
    if (firstName === "") {
        document.getElementById("fname").nextElementSibling.style.display = "block";
        return; // Stop execution
    } else {
        document.getElementById("fname").nextElementSibling.style.display = "none";
    }

    if (lastName === "") {
        document.getElementById("lname").nextElementSibling.style.display = "block";
        return; // Stop execution
    } else {
        document.getElementById("lname").nextElementSibling.style.display = "none";
    }

    if (email === "") {
        document.getElementById("email").nextElementSibling.style.display = "block";
        return; // Stop execution
    } else {
        document.getElementById("email").nextElementSibling.style.display = "none";
    }

    if (subject === "") {
        document.getElementById("subject").nextElementSibling.style.display = "block";
        return; // Stop execution
    } else {
        document.getElementById("subject").nextElementSibling.style.display = "none";
    }

    if (message === "") {
        document.getElementById("message").nextElementSibling.style.display = "block";
        return; // Stop execution
    } else {
        document.getElementById("message").nextElementSibling.style.display = "none";
    }

    // If all fields are filled, proceed to send email
    const bodyMessage = `FirstName: ${firstName}<br> LastName: ${lastName}<br> Email: ${email}<br> Subject: ${subject}<br> Message: ${message}`;

    Email.send({
        Host: "smtp.elasticemail.com",
        Username: "harshavardhanb843@gmail.com",
        Password: "0ADE1CD76DE6FF0F9079159465C21056336F",
        To: 'harshavardhanb843@gmail.com',
        From: email,
        Subject: subject,
        Body: bodyMessage
    }).then(
        message => {
            if (message === "OK"){
                Swal.fire({
                    title: "Success!",
                    text: "Message Sent Successfully!",
                    icon: "success"
                });
                // Reset the form after successful submission
                document.querySelector('form').reset();
            }
        }
    );
}

// Add event listener to the form
document.querySelector('form').addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent default form submission
    sendEmail(); // Call sendEmail function to handle form submission
});
