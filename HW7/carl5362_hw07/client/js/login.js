$('#login').submit(function(event) {
    event.preventDefault();
    $.ajax({
        type: 'POST',
        url: '/sendLoginDetails',
        data: { username: $('#username').val(), password: $('#password').val() },
        success: function(data, textStatus, jqXHR) {
            window.location.replace(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#error').text('Error: Invalid credentials');
            console.log("invalid password");
        }
    });
});