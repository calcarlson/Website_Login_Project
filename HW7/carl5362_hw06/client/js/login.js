// $('#login').submit(function(event) {
//     event.preventDefault();
//     $.ajax({
//         type: 'POST',
//         url: '/getContacts',
//         data: {
//             username: $('#username').val(),
//             password: $('#password').val()
//         },

//         success: function(data, textStatus, jqXHR) {
//             window.location.replace(data);
//         },
//         error: function(jqXHR, textStatus, errorThrown) {
//             $('#error').text('invalid username or password inside Ajax call');
//         }
//     });
// });

(function() {

    var url = 'http://localhost:9362/getContacts';
    $(document).ready(function() {
        $.ajax({
            url: url,
            success: function(result) {

                $("#contactTable").append(result);
                console.log("Success!");
            }
        });
    });
})();