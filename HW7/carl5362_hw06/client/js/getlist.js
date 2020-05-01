"use strict";

(function () {
	// the API end point
	var url = "getListOfFavPlaces";

	$.ajax({
		url: url, success: function (result) {
			result.forEach(function (el) {
				$('#myFavTable').append(`<tr><td>${el.place_name}</td><td>${el.addr_line1}<br>${el.addr_line2}</td><td>${el.open_time}<br>${el.close_time}</td><td>${el.add_info}</td><td><a href="${el.add_info_url}">${el.add_info_url}</a></td></tr>`);
			});
		}
	});

})();
