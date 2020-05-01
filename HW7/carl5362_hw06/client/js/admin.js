function newUser() {
  clearError();
  if (!document.getElementById('new-row')) {
    $('#adminTable').append(`<tr id="new-row"><td></td><td><input id="new-name" type="text"></td><td><input id="new-login" type="text"></td><td><input id="new-password" type="text"></td><td><a href="#" onclick="submitNewUser()"><span class="glyphicon glyphicon-floppy-save"></span></a> <a href="#" onclick="hideNewRow()"><span class="glyphicon glyphicon-remove"></span></a></td></tr>`);
  }
}

function hideNewRow() {
  clearError();
  var r = document.getElementById('new-row');
  if (r) {
    r.remove();
  }
}

function submitNewUser() {
  clearError();
  $.ajax({
    type: 'POST',
    url: '/validateNewUser',
    data: { name: $('#new-name').val(), login: $('#new-login').val(), password: $('#new-password').val() },
    success: function (data, textStatus, jqXHR) {
      console.log("Success. Reloading...");
      window.location.reload();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('#error').text('Error: This login is used by another user');
    }
  });
}

function updateUser(oldLogin) {
  clearError();
  $.ajax({
    type: 'POST',
    url: '/updateUser',
    data: { name: $('#new-name').val(), login: $('#new-login').val(), oldLogin: oldLogin, password: $('#new-password').val() },
    success: function (data, textStatus, jqXHR) {
      console.log("Success. Reloading...");
      window.location.reload();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('#error').text('Error: This login is used by another user');
    }
  });
}

function deleteUser(login) {
  clearError();
  $.ajax({
    type: 'DELETE',
    url: '/deleteUser',
    data: { login: login },
    success: function (data, textStatus, jqXHR) {
      window.location.reload();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('#error').text('Error: Can not delete the user that is logged in');
    }
  });
}

function editUser(login) {
  clearError();
  var r = $(`#row-${login}`);
  var oldHTML = r.html().quote;
  console.log(oldHTML);
  var id = $(`#row-${login} td`)[0].innerHTML;
  var oldName = $(`#row-${login} td`)[1].innerHTML;
  var oldLogin = $(`#row-${login} td`)[2].innerHTML;
  r.html(`<td>${id}</td><td><input id="new-name" type="text" value="${oldName}"></td><td><input id="new-login" type="text" value="${oldLogin}"></td><td><input id="new-password" type="text"></td><td><a href="#" onclick="updateUser('${oldLogin}')"><span class="glyphicon glyphicon-floppy-save"></span></a> <a href="#" onclick="window.location.reload()"><span class="glyphicon glyphicon-remove"></span></a></td>`);
}

function clearError() {
  $('#error').text('');
}
