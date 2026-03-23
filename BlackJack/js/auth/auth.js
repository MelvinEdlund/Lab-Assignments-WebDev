const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

loginBtn.addEventListener("click", login);
registerBtn.addEventListener("click", register);

function register() {
  let username = document.getElementById("registerUsername").value;
  let password = document.getElementById("registerPassword").value;

  if (!username || !password) {
    alert("Fyll i alla fält");
    return;
  }

  let users = getUsers();

  let userExists = users.find((u) => u.username === username);

  if (userExists) {
    alert("Användaren finns redan");
    return;
  }

  let newUser = {
    username: username,
    password: password,
    balance: 1000,
  };

  users.push(newUser);
  saveUsers(users);

  alert("Registrering lyckades!");
}

function login() {
  let username = document.getElementById("loginUsername").value;
  let password = document.getElementById("loginPassword").value;

  let users = getUsers();

  let user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (!user) {
    alert("Fel användarnamn eller lösenord");

    return;
  }

  setCurrentUser(user);

  window.location.href = "index.html";
}
