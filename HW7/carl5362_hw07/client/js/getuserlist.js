"use strict";

(function () {
	// the API end point
	var url = "getListOfUsers";

	$.ajax({
		url: url, success: function (result) {
			result.forEach(function (el) {
				$('#adminTable').append(`<tr id="row-${el.acc_login}"><td>${el.acc_id}</td><td>${el.acc_name}</td><td>${el.acc_login}</td><td></td><td><a href = "#" onclick="editUser('${el.acc_login}')"><span class="glyphicon glyphicon-pencil"></span></a> <a href="#" onclick="deleteUser('${el.acc_login}')"><span class="glyphicon glyphicon-trash"></span></a></td></tr>`);
			});
		}
	});

})();
