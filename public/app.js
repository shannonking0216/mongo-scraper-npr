$.getJSON("/articles", function (data) {

    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }

});

$(document).on("click", "p", function () {
    // WE DONT WANT THE COMMENTS TO EMPTY EACH TIME...
    $("#comment").empty();
    var thisId = $(this).attr("data-id");

    $.ajax({
        method: "GET",
        url: "/articles/" +  thisId
    })
        .then(function (data) {
            console.log(data);
            $("#comment").append("<h2>" + data.title + "</h2>");
            $("#comment").append("<input id='titleinput' name='title' >");
            $("#comment").append("<textarea id='bodyinput' name='body'></textarea>");
            $("#comment").append("<button data-id='" + data._id + "' id='savecomment'>Save comment</button>");

            if (data.comment) {
                $("#titleinput").val(data.comment.title);
                $("#bodyinput").val(data.comment.body);
            }
        });
});

$(document).on("click", "#savecomment", function() {
    var thisId = $(this).attr("data-id"); 

    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    })
    .then(function(data){
        console.log(data);
        $("#comment").empty();
      });
  
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });