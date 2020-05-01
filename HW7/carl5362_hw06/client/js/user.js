"use strict";

(function () {
  // the API end point
  var url = "currentUser";

  $.ajax({
    url: url, success: function (result) {
      $('#user').text(`Welcome, ${result}`);
    }
  });

})();
