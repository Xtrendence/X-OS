$(document).ready(function() {
	$(".clock-icon").on("click", function() {
		if($(this).hasClass("active")) {
			$(this).removeClass("active");
		}
		else {
			$(this).addClass("active");
		}
	});
	$(".login-input-wrapper .back-icon").on("click", function() {
		var password = $(".password").val();
		var remember = "disabled";
		if($(".clock-icon").hasClass("active")) {
			var remember = "enabled";
		}
		$.ajax({
			url: "./scripts/process.php",
			type: "POST",
			data: { password: password, remember: remember, action: "login" },
			success: function(data) {
				if(data != "valid") {
					$(".password").val("");
					$(".login-response").remove();
					var response = $('<button class="login-response">' + data + '</button>');
					$(".login-wrapper").append(response);
					response.css("opacity", 1);
					setTimeout(function() {
						response.css("opacity", 0);
						setTimeout(function() {
							response.remove();
						}, 250);
					}, 3000);
				}
				else {
					location.reload();
				}
			}
		});
	});
	$(window).on("keydown", function(e) {
		if(e.which == 13) {
			$(".login-input-wrapper .back-icon").trigger("click");
		}
	});
});