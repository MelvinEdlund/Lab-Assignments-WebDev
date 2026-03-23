function getUsers() {
  let users = localStorage.getItem("users");

  if (!users) {
    return [];
  }

  return JSON.parse(users);
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}
