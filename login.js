function login() {
  const userName = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:8081/login?arg1=" + userName + "&arg2=" + password)
    .then((response) => response.text())
    .then((data) => {
      if (data == "Login Successful") {
        location.href = "index.html";
      }
      console.log("API RESPONSE: " + data);
    })
    .catch((error) => console.error(error));
}
