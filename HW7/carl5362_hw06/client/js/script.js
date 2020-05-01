"use strict";


(function() {

    var url = 'http://localhost:9362/getContacts';
    $(document).ready(function() {
        $.ajax({
            url: url,
            success: function(result) {

                $("#contactTable").append(result);

            }
        });
    });
})();