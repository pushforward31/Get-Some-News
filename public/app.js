//mainPage();

$(document).on("click", "#get-it", function() {
    console.log("button works");
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).then(function(data) {
        console.log(data);

    });
    mainPage();

});

function mainPage() {
    // Grab the movieNews as a json
    $.getJSON("/movieNews", function(data) {
        // For each one
        var button = $("<button class = 'delete-it'>");
        for (var i = 0; i < data.length; i++) {
            // Display the apropos information on the page
            $("#new-info").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
            // $("#new-info").append("<button class = '.delete-it' data-id='" + data[i]._id + "'>" + "Delete </button>");
            $("#delete-it").append(data[i]._id);
        }
    });

}
// $("<button class = '.delete-it'>" + "Delete </button>")
//data-id='" + this.id + "'








// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
            method: "GET",
            url: "/movieNews/" + thisId
        })
        // With that done, add the note information to the page
        .then(function(data) {
            console.log(data);
            // The title of the article
            $("#notes").append("<h2>" + data.title + "</h2>");
            // An input to enter a new title
            $("#notes").append("<input id='titleinput' name='title' >");
            // A textarea to add a new note body
            $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
            // A button to submit a new note, with the id of the article saved to it
            $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

            // If there's a note in the article
            if (data.note) {
                // Place the title of the note in the title input
                $("#titleinput").val(data.note.title);
                // Place the body of the note in the body textarea
                $("#bodyinput").val(data.note.body);
            }
        });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: "/movieNews/" + thisId,
            data: {
                // Value taken from title input
                title: $("#titleinput").val(),
                // Value taken from note textarea
                body: $("#bodyinput").val()
            }
        })
        // With that done
        .then(function(data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});

$(document).on("click", "#remove-it", function() {
    console.log("this on works");
    // This function does an API call to delete posts
    //function deletePost(id) {}
    $.ajax({
        method: "GET",
        datatype: "json",
        url: "/movieNews/delete",
            success: function(response){
            //+ thisid

            $("#new-info").empty();
        }
    });
    //clearPage();

});

function clearPage() {
    $("#new-info").empty();
}

$(document).on("click", '#delete-it', function() {
    console.log("it works");
    // DELETE route for deleting posts
    $.ajax({
            method: "GET",
            url: "/movieNews/id"
            //+ thisid
        })
        .then(function(data) {
            console.log("Single news removed");
            return (data);
            //$("#new-info").empty();
        });
});