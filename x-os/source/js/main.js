// Drag & Drop Files Functions
function accept_drop(event) {
	event.preventDefault();
	if($(event.target).parent().parent().parent().hasClass("front")) {
		if(!$(event.target).hasClass("active") && !$(event.target).hasClass("dragging")) {
			$(event.target).css("background", "rgb(230,50,50)");
		}
	}
}
function cancel_drop(event) {
	$(".navmod-location, .navmod-file-wrapper").removeAttr("style");
	$(".dragging").removeClass("dragging");
	$(".navmod-location.available").addClass("unavailable").removeClass("available");
}
function leave_drop(event) {
	if($(event.target).parent().parent().parent().hasClass("front")) {
		if(!$(event.target).hasClass("active") && !$(event.target).hasClass("dragging")) {
			$(event.target).css({"background":"rgb(230,150,0)"});
		}
	}
}
function drag(event) {
	$(event.target).addClass("dragging");
	if($(event.target).hasClass("file")) {
		var type = "file";
	}
	else if($(event.target).hasClass("folder")) {
		var type = "folder";
	}
	var id = $(event.target).attr("id");
	var name = $(event.target).children(".navmod-file-name").text();
	event.dataTransfer.setData("id", id);
	event.dataTransfer.setData("type", type);
	if($(event.target).hasClass("navmod-file-wrapper")) {
		$(event.target).css("opacity", "0.5");
		$.each($(event.target).parent().parent().find(".navmod-sidebar .navmod-location"), function(key, value) {
			if(!$(value).hasClass("active")) {
				$(value).css("background", "rgb(230,150,0)");
				if($(value).hasClass("unavailable")) {
					$(value).addClass("available").removeClass("unavailable");
				}
			}
		});
		$.each($(event.target).parent().find(".navmod-file-wrapper.folder"), function(key, value) {
			if(!$(value).hasClass("dragging")) {
				$(value).css("background", "rgb(230,150,0)");
			}
		});
	}
}
function drop(event) {
	event.preventDefault();
	if($(event.target).parent().parent().parent().hasClass("front")) {
		if($(event.target).hasClass("navmod-location")) {
			var destination = $(event.target).text();
		}
		else if($(event.target).hasClass("folder")) {
			var destination = $(event.target).parent().parent().parent().attr("data-location") + "/" + $(event.target).text();
		}
		var id = event.dataTransfer.getData("id");
		var type = event.dataTransfer.getData("type");
		// So that the user can't drop a folder onto itself.
		if(!$(event.target).hasClass("dragging")) {
			move_file(id, destination, type);
		}
	}
	cancel_drop(event.target);
}
// NavMod Preloaded Functions
function get_files(location) {
	$(".navmod-window." + base64_remove_padding(btoa(location)) + " .navmod-location").removeClass("active");
	$(".navmod-window." + base64_remove_padding(btoa(location)) + " .navmod-location." + base64_remove_padding(btoa(location))).addClass("active");
	var checksum = $(".activity-wrapper").attr("data-checksum");
	$.ajax({
		url: "./scripts/api.php",
		type: "POST",
		data: { action: "get-file-system", checksum: checksum },
		success: function(data) {
			// The server returns a checksum each time it outputs the file system. This checksum is saved in the DOM on the client side, and is then compared to the one the server outputs. This way, the server doesn't output the entire file system if the client already has an identical version of it, saving resources and making the whole thing more efficient.
			if(data != "identical") {
				var response = JSON.parse(data);
				if(response['file-system'] != null) {
					$(".activity-wrapper").attr({"data-checksum":response['checksum'], "data-file-system":JSON.stringify(response['file-system'])});
					var file_system = JSON.parse($(".activity-wrapper").attr("data-file-system"));
					populate_navmod(location, file_system);
				}
				else {
					$(".navmod-window." + base64_remove_padding(btoa(location)) + " .navmod-pane").html('<button class="navmod-empty-overlay">No Files Found</button>');
				}
			}
			else {
				var file_system = JSON.parse($(".activity-wrapper").attr("data-file-system"));
				populate_navmod(location, file_system);
			}
		}
	});
}
function refresh_navmod() {
	$.each($(".navmod-window"), function(key, value) {
		var location = $(value).attr("data-location");
		get_files(location);
	});
}
function populate_navmod(location, file_system) {
	$(".navmod-window." + base64_remove_padding(btoa(location)) + " .navmod-pane").html("");
	$.each(file_system, function(key, value) {
		var timestamp = key.substring(0, 10);
		var date = new Date(timestamp * 1000);
		var time = date.format("d / m / Y");
		if(value['location'] == location) {
			if(value['type'] == "file") {
				if(value['name'].includes(".")) {
					var file_extension = value['name'].split(".").pop();
				}
				else {
					var file_extension = "";
				}
				
				var extensions_image = ["jpg","jpeg","png","icns","ico","bmp","gif","psd"];
				var extensions_video = ["mkv","mov","mp4","m4v","avi","ts","flv","wmv","m4p","3gp","webm"];
				var extensions_audio = ["mp3","wav","ogg","aac","aiff","m4a","wma"];
				var extensions_pdf = ["pdf"];
				var extensions_exe = ["exe","pkg","msi"];
				var extensions_code = ["py","sh","command","php","html","htm","css","js","config","ini","xml"];
				var extensions_ipa = ["ipa"];
				var extensions_apk = ["apk"];
				var extensions_archive = ["rar","zip","dmg","iso","7z"];
				var extensions_text = ["txt","rtf"];
				var extensions_doc = ["doc","docx"];
				
				if(extensions_image.includes(file_extension.toLowerCase())) {
					var file_icon = $(".file-icons .image_icon").html();
				}
				else if(extensions_video.includes(file_extension.toLowerCase())) {
					var file_icon = $(".file-icons .video_icon").html();
				}
				else if(extensions_audio.includes(file_extension.toLowerCase())) {
					var file_icon = $(".file-icons .audio_icon").html();
				}
				else if(extensions_pdf.includes(file_extension.toLowerCase())) {
					var file_icon = $(".file-icons .pdf_icon").html();
				}
				else if(extensions_exe.includes(file_extension.toLowerCase())) {
					var file_icon = $(".file-icons .exec_icon").html();
				}
				else if(extensions_code.includes(file_extension.toLowerCase())) {
					var file_icon = $(".file-icons .code_icon").html();
				}
				else if(extensions_ipa.includes(file_extension.toLowerCase())) {
					var file_icon = $(".file-icons .ipa_icon").html();
				}
				else if(extensions_apk.includes(file_extension.toLowerCase())) {
					var file_icon = $(".file-icons .apk_icon").html();
				}
				else if(extensions_archive.includes(file_extension.toLowerCase())) {
					var file_icon = $(".file-icons .archive_icon").html();
				}
				else if(extensions_text.includes(file_extension.toLowerCase())) {
					var file_icon = $(".file-icons .text_icon").html();
				}
				else if(extensions_doc.includes(file_extension.toLowerCase())) {
					var file_icon = $(".file-icons .word_icon").html();
				}
				else {
					var file_icon = $(".file-icons .file_icon").html();
				}
				
				if($("body").attr("id") == "desktop") {
					$(".navmod-window." + base64_remove_padding(btoa(location)) + " .navmod-pane").append('<div class="navmod-file-wrapper file" id="' + key + '" draggable="true" ondragstart="drag(event)" ondragend="cancel_drop(event)">' + file_icon + '<button class="navmod-file-name">' + value['name'] + '</button><button class="navmod-file-date">' + time + '</button></div>');
				}
				else {
					$(".navmod-window." + base64_remove_padding(btoa(location)) + " .navmod-pane").append('<div class="navmod-file-wrapper file" id="' + key + '" draggable="false">' + file_icon + '<button class="navmod-file-name">' + value['name'] + '</button><button class="navmod-file-date">' + time + '</button></div>');
				}
			}
			else if(value['type'] == "folder") {
				var folder_icon = $(".file-icons .folder_icon").html();
				if($("body").attr("id") == "desktop") {
					$(".navmod-window." + base64_remove_padding(btoa(location)) + " .navmod-pane").append('<div class="navmod-file-wrapper folder" id="' + key + '" draggable="true" ondragstart="drag(event)" ondragend="cancel_drop(event)" ondragover="accept_drop(event)" ondrop="drop(event)" ondragleave="leave_drop(event)">' + folder_icon + '<button class="navmod-file-name">' + value['name'] + '</button><button class="navmod-file-date">' + time + '</button></div>');
				}
				else {
					$(".navmod-window." + base64_remove_padding(btoa(location)) + " .navmod-pane").append('<div class="navmod-file-wrapper folder" id="' + key + '" draggable="false">' + folder_icon + '<button class="navmod-file-name">' + value['name'] + '</button><button class="navmod-file-date">' + time + '</button></div>');
				}
			}
		}
	});
	$(".navmod-window." + base64_remove_padding(btoa(location)) + " .navmod-file-wrapper").sort(function(a, b) {
		if($(a).find(".navmod-file-name").text() < $(b).find(".navmod-file-name").text()) {
			return -1;
		} 
		else {
			return 1;
		}
	}).appendTo(".navmod-window." + base64_remove_padding(btoa(location)) + " .navmod-pane");
	if($(".navmod-window." + base64_remove_padding(btoa(location)) + " .navmod-pane").html() == "" || $(".activity-wrapper").attr("data-file-system") == "") {
		$(".navmod-window." + base64_remove_padding(btoa(location)) + " .navmod-pane").html('<button class="navmod-empty-overlay">No Files Found</button>');
	}
	else {
		$(".navmod-window." + base64_remove_padding(btoa(location)) + " .navmod-empty-overlay").remove();
	}
}
function move_file(id, to, type) {
	$.ajax({
		url: "./scripts/process.php",
		type: "POST",
		data: { action: "move-file", id: id, to: to, type: type },
		success: function(data) {
			if(data.length) {
				var response = JSON.parse(data);
				notify(response['title'], response['text']);
			}
			else {
				refresh_navmod();
			}
		}
	});
}
// Other Preloaded Functions
function base64_add_padding(str) {
	return str + Array((4 - str.length % 4) % 4 + 1).join('=');
}
function base64_remove_padding(str) {
	return str.replace(/={1,2}$/, '');
}
String.prototype.replaceAll = function(str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}
function epoch() {
	var date = new Date();
	var time = Math.round(date.getTime() / 1000);
	return time;
}
function notify(title, text) {
	$.ajax({
		url: "./scripts/process.php",
		type: "POST",
		data: { action: "add-notification", title: title, text: text },
		success: function(data) {
			show_notification_menu();
		}
	});
}
function hide_menus() {
	$(".navbar-item, .navbar-icon, .navbar-battery-wrapper").removeClass("active");
	$(".navbar-menu").removeAttr("style");
}
function show_notification_menu() {
	hide_menus();
	hide_upload_menu();
	get_notifications();
	$(".notification-icon").parent().addClass("active");
	$(".notification-menu").show().css("width", "300px");
}
function hide_notification_menu() {
	if($(".notification-menu").is(":visible")) {
		$(".notification-menu").css("width", "0px");
		setTimeout(function() {
			$(".notification-menu").removeAttr("style");
			$(".notification-icon").parent().removeClass("active");
		}, 250);
	}
}
function hide_upload_menu() {
	if($(".upload-menu").is(":visible")) {
		$(".upload-menu").css("height", "0px");
		setTimeout(function() {
			$(".upload-menu").removeAttr("style");
			$(".upload-icon").parent().removeClass("active");
		}, 250);
	}
}
function get_notifications() {
	var checksum = $(".notification-menu").attr("data-checksum");
	$.ajax({
		url: "./scripts/api.php",
		type: "POST",
		data: { action: "get-notifications", checksum: checksum },
		success: function(data) {
			if(data != "identical") {
				var response = JSON.parse(data);
				var checksum = response['checksum'];
				$(".notification-menu").attr({"data-checksum":checksum, "data-notifications":JSON.stringify(response['notifications'])});
				var notifications = JSON.parse($(".notification-menu").attr("data-notifications"));
				$(".notification-list").empty();
				$.each(notifications, function(key, value) {
					var timestamp = key.substring(0, 10);
					var date = new Date(timestamp * 1000);
					var time = date.format("d / m / Y \\a\\t g:i A");
					$(".notification-list").append('<div class="notification-wrapper noselect" id="' + key + '"><div class="notification-top"><span class="notification-title">' + value['title'] + '</span><button class="notification-remove"></button></div><div class="notification-bottom"><span class="notification-text">' + value['text'] + '</span></div><div class="notification-date-wrapper"><span class="notification-date">' + time + '</span></div>');
				});
				if(notifications == null || JSON.stringify(notifications) == "[]") {
					$(".notification-clear").hide();
				}
				else {
					$(".notification-clear").show();
				}
			}
		}
	});
}
function clear_notifications() {
	$.ajax({
		url: "./scripts/process.php",
		type: "POST",
		data: { action: "clear-notifications" },
		success: function(data) {
			get_notifications();
		}
	});
}
function get_settings() {
	$.ajax({
		url: "./scripts/api.php",
		type: "POST",
		data: { action: "get-settings" },
		success: function(data) {
			if(data.length) {
				$(".main-wrapper").attr("data-settings", data);
				var settings = JSON.parse(data);
				var appearance = settings['appearance'];
				
				var theme = appearance['theme'];
				if($(".file-css").attr("data-theme") != theme) {
					$(".file-css").attr({"href":"./source/css/" + theme + ".css?" + epoch(), "data-theme":theme});
				}
				if(theme == "light") {
					$(".theme-color").attr("content", "#efefef");
				}
				else if(theme == "dark") {
					$(".theme-color").attr("content", "#323232");
				}
				
				var background_color_1 = appearance['background-color-1'];
				var background_color_2 = appearance['background-color-2'];
				if(background_color_1 != "#c31432" && background_color_2 != "#240b36") {
					var background_color_css = '.main-wrapper { background:' + background_color_1 + ';background:-webkit-linear-gradient(to right, ' + background_color_2 + ', ' + background_color_1 + ');background:linear-gradient(to right, ' + background_color_2 + ', ' + background_color_1 + '); }';
				}
				else {
					var background_color_css = '';
				}
				
				var dock_visibility = appearance['dock-visibility'];
				if(dock_visibility == "visible") {
					var dock_visibility_css = '';
				}
				else if(dock_visibility == "hidden") {
					var dock_visibility_css = '.dock-wrapper { display:none; } .activity-wrapper { height:calc(100% - 30px); }';
				}
				
				var dock_size = appearance['dock-size'];
				if(dock_visibility == "visible") {
					if(dock_size == "small") {
						var dock_size_css = '.dock-wrapper { height:60px; } .dock-item { width:40px; height:40px; } .dock-name { bottom:65px; left:2px; } #desktop .dock-item:hover .dock-icon { width:50px; height:50px; } .activity-wrapper { height:calc(100% - 30px - 60px) }';
					}
					else if(dock_size == "medium") {
						var dock_size_css = '';
					}
					else if(dock_size == "large") {
						var dock_size_css = '.dock-wrapper { height:100px; } .dock-item { width:75px; height:75px; } .dock-name { bottom:105px; left:20px; } #desktop .dock-item:hover .dock-icon { width:90px; height:90px; } .activity-wrapper { height:calc(100% - 30px - 100px) }';
					}
				}
				else {
					var dock_size_css = '';
				}
				
				var navmod_file_view = appearance['navmod-file-view'];
				$(".navbar-subitem.view-as-icons, .navbar-subitem.view-as-list").removeClass("unavailable");
				if(navmod_file_view == "icons") {
					var navmod_file_view_css = '';
					$(".navbar-subitem.view-as-icons").addClass("unavailable");
				}
				else if(navmod_file_view == "list") {
					if(theme == "light") {
						var text_color = "rgb(60,60,60)";
					}
					else if(theme == "dark") {
						var text_color = "rgb(245,245,245)";
					}
					var navmod_file_view_css = '.navmod-file-wrapper { display:block; width:100%; padding:0; margin:0; overflow:hidden; float:none; height:40px; text-align:left; } .navmod-file-wrapper .file-icon { margin:0; padding:8px; position:relative; display:inline-block; height:24px; width:24px; vertical-align:top; } .navmod-file-wrapper .folder-icon { margin:0; padding:8px; position:relative; width:24px; height:24px; display:inline-block; vertical-align:top; } .navmod-file-name { color:' + text_color + '; border-radius:5px 0 0 5px; text-align:left; bottom:0; background:none; margin:0; padding:0 10px 0 10px; position:relative; display:inline-block; width:calc(100% - 40px - 110px - 20px); height:100%; vertical-align:top; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; } .navmod-file-date { color:' + text_color + '; margin:0; padding:0; position:relative; display:inline-block; vertical-align:top; width:130px; border-radius:0; pointer-events:none; }';
					$(".navbar-subitem.view-as-list").addClass("unavailable");
				}
				
				if($(".activity-window.settings").length && $(".settings-category.active").text().toLowerCase() == "appearance") {
					$(".settings-button").removeClass("active");
					$.each($(".settings-button.choice"), function(index, element) {
						var setting = $(element).parent().attr("data-setting");
						if($(element).attr("data-choice") == appearance[setting]) {
							$(element).addClass("active");
						}
					});
					
					if(background_color_1 != "#c31432" && background_color_2 != "#240b36") {
						$(".settings-item-wrapper .color-1").val(background_color_1);
						$(".settings-item-wrapper .color-2").val(background_color_2);
					}
				}
				
				var override = '<style class="style-override">' + background_color_css + dock_visibility_css + dock_size_css + navmod_file_view_css + '</style>';
				
				if($(".style-override").length) {
					$(".style-override").remove();
				}
				
				$("head").append(override);
				
				set_dock_icons();
			}
		}
	});
}
function set_dock_icons() {
	if($(".dock-wrapper").is(":visible")) {
		$.each($(".dock-icon"), function(key, value) {
			var src = $(value).attr("data-src");
			$(value).attr("src", src);
		});
	}
}
// Fetch settings before the page has finished loading.
get_settings();
// Make sure the DOM has finished loading before the following script runs.
$(document).ready(function() {
	// Initialize and set functions to be called at a regular interval.
	initialize();
	setInterval(check_connection, 30000);
	setInterval(check_battery, 7500);
	// Navbar Functionality
	$(".navbar-item").on("click", function() {
		hide_notification_menu();
		hide_upload_menu();
		if($(this).hasClass("active")) {
			hide_menus();
		}
		else {
			hide_menus();
			// Move the menu under the navbar item the user clicked on. Extend towards the right.
			$(this).addClass("active").next(".navbar-menu").show().css("left", $(this).position().left);
		}
	});
	$(".navbar-icon, .navbar-battery-wrapper").on("click", function() {
		if($(this).children(".notification-icon").length) {
			if($(this).hasClass("active")) {
				hide_notification_menu();
			}
			else {
				show_notification_menu();
			}
		}
		else if($(this).children(".upload-icon").length) {
			if($(this).hasClass("active")) {
				hide_upload_menu();
			}
			else {
				show_upload_menu();
			}
		}
		else {
			hide_notification_menu();
			hide_menus();
			hide_upload_menu();
			// Move the menu under the navbar icon the user clicked on. Extend towards the left.
			$(this).addClass("active").next(".navbar-menu").show().css("left", $(this).position().left - $(this).next(".navbar-menu").width() + $(this).outerWidth());
		}
	});
	$(".navbar-subitem").on("click", function() {
		var action = $(this).attr("data-action");
		hide_menus();
		// X:/OS Menu
		if(action == "about") {
			$(".activity-window.about").remove();
			create_window("About", 300, 240, '<span class="activity-text">Welcome to X:/OS. This isn\'t an actual operating system, but it simulates one. You can use it to upload, store, and download files. Think of it as a cloud storage solution that looks awesome.</span>', "about");
		}
		if(action == "settings") {
			$(".activity-window.settings").remove();
			create_window("Settings", 500, 450, '<div class="settings-sidebar"><button class="settings-category">Appearance</button><button class="settings-category">Account</button><button class="settings-category">Actions</button><button class="settings-category">System</button></div><div class="settings-pane"></div>', "settings");
		}
		if(action == "logout") {
			logout();
		}
		// NavMod Menu
		if(action == "new-navmod-window") {
			create_navmod("NavMod", "NavMod", 600, 400);
		}
		// File Menu
		if(action == "upload-file") {
			show_upload_menu();
		}
		if(action == "new-file") {
			create_file($(".navmod-window.front").attr("data-location"));
		}
		if(action == "new-folder") {
			create_folder($(".navmod-window.front").attr("data-location"));
		}
		// View Menu
		if(action == "view-as-icons") {
			apply_setting("appearance", "navmod-file-view", "icons");
		}
		if(action == "view-as-list") {
			apply_setting("appearance", "navmod-file-view", "list");
		}
		if(action == "hide-all-windows") {
			$(".activity-window").css("opacity", 0);
			setTimeout(function() {
				$(".activity-window").hide();
			}, 250);
		}
		if(action == "show-all-windows") {
			$(".activity-window").show().css("opacity", 1);
		}
		// Help Menu
		if(action == "how-to-use") {
			$(".activity-window.help").remove();
			create_window("Help", 400, 500, '<input class="help-search" type="text" placeholder="Search..."><div class="help-section"><span class="tags hidden">warning, developer, tools, browser, hack, messing, danger, issue, trouble</span><span class="help-title">Warning</span><span class="help-text">Do not mess around with the DOM through the developer tools of your browser. The website relies on class names, attributes, and a lot of data stored in the DOM in order to function. Because this website is intended for individual private use rather than commercial, it doesn\'t have that many validation checks since you\'d have no reason to sabotage your own files. I doubt you can mess up too many things though, as the entire website can be reset by resetting the configuration files, which can be done in <span class="help-action" data-action="open-settings">"Settings"</span>.</span></div><div class="help-section"><span class="tags hidden">compatibility, browser, chrome</span><span class="help-title">Browser Compatibility</span><span class="help-text">As much as I hate saying it, this website currently only fully works with Chrome due to its support of "setData" in the DataTransfer API. If you don\'t use Chrome, there might be complications when moving files using drag and drop and may result in you losing easy access to your files. In any event, your files are stored in the website\'s "uploads" folder. This folder is not accessible through the website, you can only see your raw files if you have access to the server\'s files. This site works on mobile, but keep in mind the "drag and drop" features won\'t work, and some icons and menus might be unavailable due to screen size, but don\'t worry, all the important features will work.</span></div><div class="help-section"><span class="tags hidden">settings, theme, appearance, color, background</span><span class="help-title">Settings</span><span class="help-text">The <span class="help-action" data-action="open-settings">settings pane</span> can be used to change the appearance of the website, as well as change your account details, or delete all your files, reset the settings, move all your files, or see how much storage space you have left. In the "appearance" category, you can change the background of the website to a custom gradient. The value can be entered in "rgb", "rgba", or hex. If both values are identical, then the background won\'t be a gradient. If both fields are left empty, then the current theme\'s default gradient is used.</span></div><div class="help-section"><span class="tags hidden">account, password, username, change, security</span><span class="help-title">Account</span><span class="help-text">You need to be logged in to use any of this website\'s features. The login screen has a "Remember Me" feature that generates a unique token that is saved as a cookie on your browser for 1 month. After the month is over, the token is revoked and the cookie is removed. You will then have to login again. Logging out also revokes this token. This is done for security reasons to ensure that even if a hacker manages to steal your token, they cannot use the website for a whole month and will be kicked out the second a logout is triggered. Your password is stored inside a configuration file and is encrypted using BCrypt, so if you forget it, you will have to reset your account password manually by using a BCrypt hash generator online, JSON encoding the hash, and then replacing it in the account configuration file. Basically, don\'t forget your password. Performing the "Reset Everything" action in "Settings" completely resets everything, including your username and password; both will be set to "admin". All of your files will get deleted as well. It literally makes it seem like you\'ve never used the website.</span></div><div class="help-section"><span class="tags hidden">navmod, navigation, browser, file, folder</span><span class="help-title">NavMod</span><span class="help-text"><span class="help-action" data-action="open-navmod">NavMod</span> stands for Navigation Module. A module is a "part" that can be used to construct something more complex, so in this case, the NavMod is a part used in the website to allow it to function. It\'s basically the equivalent of Explorer on Windows, and Finder on Mac. Plus, it sounds cool. The NavMod can be used to browse and modify files. You cannot use some of the navigation bar\'s "File" menu options if a NavMod window isn\t at the front. You can tell a window is at the front when its close and hide button are red and orange rather than gray.</span></div><div class="help-section"><span class="tags hidden">files, folders, navmod, storage</span><span class="help-title">Files</span><span class="help-text">Files are stored inside a folder called "uploads". This folder is only accessible by the server, so unless you have access to the server\'s files, you won\'t be able to view the raw files. The files are stored using two 10 digit numbers separated by a hyphen and the file\'s extension at the end of it. The first number is the UNIX timestamp representing the time when the file was created/uploaded, and the second number is a random 10 digit number. This combination is referred to as the "ID" of the file. This ID is completely unique, and before each file is stored, the PHP script ensures that no other files exist with the same ID, and if they do, then a new ID is generated until an unused one is found. This ID shouldn\'t be changed throughout the lifetime of the file, and is it used to keep track of files.</span></div><div class="help-section"><span class="tags hidden">folders, directory, store, files, contain</span><span class="help-title">Folders</span><span class="help-text">Folders don\'t really exist in X:/OS, just like a normal OS. All the data is stored together, and then X:/OS (or any other OS) keeps track of the data and assigns it a location to make it easier for humans to go through the data. So when you create a folder or move files around on X:/OS, they aren\'t actually being moved and no folders are being created, the configuration file that keeps track of the file system is just informed of the new location it must "pretend" exists, and then you\'re shown that folder and its content. Deleting a folder will make the script go through and delete any files that were in that folder.</span></div><div class="help-section"><span class="tags hidden">upload, uploader, post, script</span><span class="help-title">Uploads</span><span class="help-text">The uploader uses the Plupload library in order to allow for multiple file uploads as well as uploading files in chunks. All uploads are stored inside the "uploads" directory on the server, and they appear in the "Uploads" folder in X:/OS. If a file exists with the same name, the new file\'s ID is appended to its own name.</span></div><div class="help-section"><span class="tags hidden">connection, wifi, internet, access</span><span class="help-title">Connection</span><span class="help-text">There is a WiFi icon on the navigation bar and the top right that shows your connection to the server. This connection is checked every 30 seconds, and if something goes wrong, the WiFi icon\'s color will change. If it\'s a client issue (your internet) then the icon will go orange. If it\'s a server issue, then the icon will go red. Every action on X:/OS requires your connection as well as the server\'s to be functioning.</span></div><div class="help-section"><span class="tags hidden">notification, alert</span><span class="help-title">Notifications</span><span class="help-text">X:/OS comes with a notification system. No audio is played as that would be annoying, but there is a notification menu that\'s accessible by clicking the bell icon at the top right of the navigation bar. These notifications are stored inside a configuration file, and clearing them all or one by one removes them from said file.</span></div><div class="help-section"><span class="tags hidden">dock, shortcut, icon</span><span class="help-title">Dock</span><span class="help-text">The dock is there to act as a shortcut to access the NavMod\'s main folders. To keep things looking good, you cannot add or remove items from the dock, but you can entirely disable it in <span class="help-action" data-action="open-settings">"Settings"</span>. Disabling the dock will make the website load faster as the dock icons are around 200KBs in size combined whereas the placeholder image is about 10KBs.</span></div><div class="help-section"><span class="tags hidden">navbar, icon, battery, discharge, charge, lightning</span><span class="help-title">Battery</span><span class="help-text">A JavaScript function is called every ~7 seconds that checks whether or not the device you\'re using is being charged. If it is, then a lightning bolt icon will appear in the battery icon on the navigation bar. If not, then the lightning bolt icon is hidden. You can disable the icon completely in the <span class="help-action" data-action="open-settings">settings</span> section, especially if you use this website on a desktop computer more often than not. This feature has some compatibility issues with certain browsers, so if it shows the wrong information, just hide the icon and ignore it. If you have access to the JavaScript files, you can completely remove it by removing/commenting out any references to the "check_battery()" function from the file.</span></div>', "help");
		}
	});
	// Navbar Functions
	function show_upload_menu() {
		hide_menus();
		hide_notification_menu();
		$(".upload-icon").parent().addClass("active");
		$(".upload-menu").show().css("height", "400px");
		count_uploads();
	}
	// Dock Functionality
	$(".dock-item").on("click", function() {
		var title = $(this).find(".dock-name").text();
		var location = title;
		create_navmod(title, location, 600, 400);
	});
	// NavMod Functionality
	$(".activity-wrapper").delegate(".navmod-location", "click", function() {
		if(!$(this).hasClass("active")) {
			var current_location = $(this).parent().parent().parent().attr("data-location");
			var title = $(this).text();
			var location = title;
			navigate_navmod(current_location, title, location);
		}
	});
	$(".activity-wrapper").delegate(".navmod-file-wrapper", "click contextmenu", function(e) {
		if(e.type == "contextmenu" && $(this).hasClass("folder") || e.type == "click" && $(this).hasClass("file") || e.type == "contextmenu" && $(this).hasClass("file")) {
			e.preventDefault();
			var width = $(".navmod-menu").width();
			var height = $(".navmod-menu").height();
			var left = e.pageX;
			var top = e.pageY;
			if(left + width > $(window).width()) {
				left = left - width;
			}
			if(top + height > $(".activity-wrapper").height()) {
				top = top - height;
			}
			show_navmod_menu(left, top);
			$(".navmod-file-wrapper").removeClass("active");
			$(this).addClass("active");
			if($(this).hasClass("file")) {
				$(".navmod-menu-item").show();
				$(".navmod-menu-item.open, .navmod-menu-item.new-file, .navmod-menu-item.new-folder").hide();
			}
			else if($(this).hasClass("folder")) {
				$(".navmod-menu-item").show();
				$(".navmod-menu-item.download, .navmod-menu-item.new-file, .navmod-menu-item.new-folder").hide();
			}
		}
		else {
			var current_location = $(this).parent().parent().parent().attr("data-location");
			var location = $(this).parent().parent().parent().attr("data-location") + "/" + $(this).find(".navmod-file-name").text();
			var title = $(this).find(".navmod-file-name").text();
			navigate_navmod(current_location, title, location);
		}
	});
	$("body").on("click", function(event) {
		if(!$(event.target).hasClass("navmod-file-wrapper") && !$(event.target).hasClass("navmod-menu") && !$(event.target).hasClass("navmod-menu-item")) {
			hide_navmod_menu();
		}
	});
	$(".activity-wrapper").delegate(".navmod-window.front .navmod-pane", "contextmenu", function(e) {
		if(!$(e.target).hasClass("navmod-file-wrapper")) {
			e.preventDefault();
			var width = $(".navmod-menu").width();
			var height = $(".navmod-menu").height();
			var left = e.pageX;
			var top = e.pageY;
			if(left + width > $(window).width()) {
				left = left - width;
			}
			if(top + height > $(".activity-wrapper").height()) {
				top = top - height;
			}
			show_navmod_menu(left, top);
			$(".navmod-menu").show();
			$(".navmod-menu-item").hide();
			$(".navmod-menu-item.new-file, .navmod-menu-item.new-folder").show();
		}
	});
	$(".navmod-menu-item").on("click", function() {
		var action = $(this).attr("data-action");
		var id = $(".navmod-file-wrapper.active").attr("id");
		var name = $(".navmod-file-wrapper.active .navmod-file-name").text();
		var location = $(".navmod-window.front").attr("data-location");
		if($(".navmod-file-wrapper.active").hasClass("file")) {
			var type = "file";
		}
		else if($(".navmod-file-wrapper.active").hasClass("folder")) {
			var type = "folder";
		}
		if(action == "open") {
			$(".navmod-file-wrapper.active").trigger("click");
		}
		else if(action == "download") {
			var iframe = $('<iframe class="hidden" src="./scripts/api.php?action=download-file&id=' + id + '"></iframe>');
			$("body").append(iframe);
			setTimeout(function() {
				$(iframe).remove();
			}, 5000);
		}
		else if(action == "rename") {
			if(name.includes(".")) {
				var parts = name.split(".");
				var extension = "." + parts[parts.length - 1];
				parts.pop();
				var name = parts.join(".");
			}
			else {
				var extension = "";
			}
			popup("Rename", 400, 140, '<input class="popup-input new-name" type="text" placeholder="New Name..." value="' + name + '"><input class="popup-input extension" type="text" placeholder="Extension..." value="' + extension + '"><input class="popup-input location hidden" type="text" placeholder="Location..." value="' + location + '"><button class="popup-submit" data-action="rename-file">Rename</button>', false, id);
			if(type == "folder") {
				$(".popup-input.new-name").css("width", "calc(100% - 40px)");
				$(".popup-input.extension").hide();
			}
		}
		else if(action == "move") {
			popup("Move", 400, 190, '<input class="popup-input current-location" type="text" placeholder="Current Location..." value="' + location + '" readonly><input class="popup-input new-location" type="text" placeholder="New Location..."><input class="popup-input type hidden" type="text" placeholder="Type..." value="' + type + '"><button class="popup-submit" data-action="move-file">Move</button>', false, id);
		}
		else if(action == "delete") {
			$(".navmod-file-wrapper.active .file-icon, .navmod-file-wrapper.active .folder-icon").removeAttr("style");
			$(".navmod-file-wrapper.active .navmod-file-name, .navmod-file-wrapper.active .navmod-file-date").removeAttr("style");
			popup("Delete", 300, 150, '<span class="popup-text">Are you sure?</span><input class="popup-input type hidden" type="text" placeholder="Type..." value="' + type + '"><button class="popup-submit" data-action="delete-file">Delete</button>', false, id);
		}
		else if(action == "get-info") {
			$.ajax({
				url: "./scripts/api.php",
				type: "POST",
				data: { action: "get-file-info", id: id },
				success: function(data) {
					if(data.length) {
						var info = JSON.parse(data);
						var name = info['name'];
						var extension = info['extension'];
						var size = bytes_to_size(info['size']);
						var location = info['location'];
						var type = info['type'];
						var creation_time = info['creation-time'];
						var date = new Date(creation_time * 1000);
						var creation_date = date.format("d / m / Y \\a\\t g:i A");
						
						popup("File Information", 300, 500, '<span class="popup-text">Name</span><input class="popup-input" value="' + name + '" style="cursor:default;" readonly><span class="popup-text">Extension</span><input class="popup-input" value="' + extension + '" style="cursor:default;" readonly><span class="popup-text">Size</span><input class="popup-input" value="' + size + '" style="cursor:default;" readonly><span class="popup-text">Location</span><input class="popup-input" value="' + location + '" style="cursor:default;" readonly><span class="popup-text">Type</span><input class="popup-input" value="' + type + '" style="cursor:default;" readonly><span class="popup-text">Creation Date</span><input class="popup-input" value="' + creation_date + '" style="cursor:default;" readonly>', true, id);
					}
				}
			});
		}
		else if(action == "new-file") {
			create_file($(".navmod-window.front").attr("data-location"));
		}
		else if(action == "new-folder") {
			create_folder($(".navmod-window.front").attr("data-location"));
		}
		hide_navmod_menu();
	});
	$(".popup-wrapper").delegate(".popup-submit", "click", function() {
		var action = $(this).attr("data-action");
		var id = $(".popup-wrapper").attr("id");
		if(action == "rename-file") {
			var new_name = $(".popup-input.new-name").val();
			var extension = $(".popup-input.extension").val();
			var location = $(".popup-input.location").val();
			rename_file(id, new_name, extension, location);
		}
		else if(action == "move-file") {
			var new_location = $(".popup-input.new-location").val().replaceAll("//", "/");
			if(new_location.substring(new_location.length - 1) == "/") {
				var new_location = new_location.substring(0, new_location.length - 1);
			}
			if(new_location.substring(0, 1) == "/") {
				var new_location = new_location.substring(1, new_location.length);
			}
			var type = $(".popup-input.type").val();
			move_file(id, new_location, type);
			hide_popup();
		}
		else if(action == "delete-file") {
			var type = $(".popup-input.type").val();
			delete_file(id, type);
		}
	});
	$(window).on("keydown", function(e) {
		// console.log(e.which);
		if(e.which == 13) {
			if($(".popup-wrapper").is(":visible")) {
				$(".popup-submit").trigger("click");
			}
		}
		if(e.which == 8) {
			if($(".navmod-menu").is(":visible")) {
				$(".navmod-menu-item.delete").trigger("click");
			}
			if($(".navmod-window.front .navmod-pane .navmod-file-wrapper").hovering) {
				var element = $(".navmod-window.front .navmod-pane").find(".navmod-file-wrapper:hover");
				var id = $(element).attr("id");
				if($(element).hasClass("file")) {
					var type = "file";
				}
				else if($(element).hasClass("folder")) {
					var type = "folder";
				}
				if(typeof id != "undefined") {
					popup("Delete", 300, 150, '<span class="popup-text">Are you sure?</span><input class="popup-input type hidden" type="text" placeholder="Type..." value="' + type + '"><button class="popup-submit" data-action="delete-file">Delete</button>', false, id);
				}
			}
		}
		if(e.which == 27) {
			if($(".activity-window").is(":visible")) {
				$(".activity-window.front").remove();
				adjust_active_locations();
				adjust_actions_availability();
			}
		}
	});
	$(".navmod-menu-item.delete").hover(function() {
		$(".navmod-file-wrapper.active .file-icon, .navmod-file-wrapper.active .folder-icon").css("fill", "rgb(230,50,50)");
		$(".navmod-file-wrapper.active .navmod-file-name, .navmod-file-wrapper.active .navmod-file-date").css("background", "rgb(230,50,50)");
		$(this).css("background", "rgb(230,50,50)");
	}, function() {
		$(".navmod-file-wrapper.active .file-icon, .navmod-file-wrapper.active .folder-icon").removeAttr("style");
		$(".navmod-file-wrapper.active .navmod-file-name, .navmod-file-wrapper.active .navmod-file-date").removeAttr("style");
		$(this).removeAttr("style");
	});
	$(".activity-wrapper").delegate(".navmod-window .back-icon", "click", function() {
		var current_location = $(this).parent().parent().attr("data-location");
		var parts = current_location.split("/");
		if(occurrences(current_location, "/") > 1) {
			var count = parts.length;
			parts.pop();
			var title = parts[parts.length - 1];
			var previous = parts.join("/");
		}
		else {
			var title = parts[0];
			var previous = parts[0];
		}
		navigate_navmod(current_location, title, previous);
	});
	// NavMod Functions
	function create_navmod(title, location, width, height) {
		$(".navmod-window." + base64_remove_padding(btoa(location))).remove();
		var window_count = $(".activity-window").length;
		var z_index = 4 + window_count + 1;
		if(window_count > 4) {
			$(".activity-window")[window_count - 1].remove();
		}
		$(".activity-window").removeClass("front");
		if(width > $(window).width()) {
			var width = $(window).width() - 2;
		}
		if(height > $(window).height()) {
			var height = $(window).height();
		}
		if($("body").attr("id") == "desktop") {
			$(".activity-wrapper").append('<div class="activity-window navmod-window ' + base64_remove_padding(btoa(location)) + ' front" style="width:' + width + 'px; height:' + height + 'px; z-index:' + z_index + ';" data-location="' + location + '"><div class="activity-window-top"><button class="activity-close"></button><button class="activity-hide"></button>' + $(".back_icon").html() + '<span class="activity-title noselect">' + title + '</span></div><div class="activity-window-bottom"><div class="navmod-sidebar"><button class="navmod-location ' + base64_remove_padding(btoa("NavMod")) + '" data-location="NavMod" ondrop="drop(event)" ondragover="accept_drop(event)" ondragleave="leave_drop(event)">NavMod</button><button class="navmod-location ' + base64_remove_padding(btoa("Movies")) + '" data-location="Movies" ondrop="drop(event)" ondragover="accept_drop(event)" ondragleave="leave_drop(event)">Movies</button><button class="navmod-location ' + base64_remove_padding(btoa("Songs")) + '" data-location="Songs" ondrop="drop(event)" ondragover="accept_drop(event)" ondragleave="leave_drop(event)">Songs</button><button class="navmod-location ' + base64_remove_padding(btoa("Pictures")) + '" data-location="Pictures" ondrop="drop(event)" ondragover="accept_drop(event)" ondragleave="leave_drop(event)">Pictures</button><button class="navmod-location ' + base64_remove_padding(btoa("Applications")) + '" data-location="Applications" ondrop="drop(event)" ondragover="accept_drop(event)" ondragleave="leave_drop(event)">Applications</button><button class="navmod-location ' + base64_remove_padding(btoa("Documents")) + '" data-location="Documents" ondrop="drop(event)" ondragover="accept_drop(event)" ondragleave="leave_drop(event)">Documents</button><button class="navmod-location ' + base64_remove_padding(btoa("Uploads")) + '" data-location="Uploads" ondrop="drop(event)" ondragover="accept_drop(event)" ondragleave="leave_drop(event)">Uploads</button></div><div class="navmod-pane"></div></div></div>');
		}
		else {
			$(".activity-wrapper").append('<div class="activity-window navmod-window ' + base64_remove_padding(btoa(location)) + ' front" style="width:' + width + 'px; height:' + height + 'px; z-index:' + z_index + ';" data-location="' + location + '"><div class="activity-window-top"><button class="activity-close"></button><button class="activity-hide"></button>' + $(".back_icon").html() + '<span class="activity-title noselect">' + title + '</span></div><div class="activity-window-bottom"><div class="navmod-sidebar"><button class="navmod-location ' + base64_remove_padding(btoa("NavMod")) + '" data-location="NavMod">NavMod</button><button class="navmod-location ' + base64_remove_padding(btoa("Movies")) + '" data-location="Movies">Movies</button><button class="navmod-location ' + base64_remove_padding(btoa("Songs")) + '" data-location="Songs">Songs</button><button class="navmod-location ' + base64_remove_padding(btoa("Pictures")) + '" data-location="Pictures">Pictures</button><button class="navmod-location ' + base64_remove_padding(btoa("Applications")) + '" data-location="Applications">Applications</button><button class="navmod-location ' + base64_remove_padding(btoa("Documents")) + '" data-location="Documents">Documents</button><button class="navmod-location ' + base64_remove_padding(btoa("Uploads")) + '" data-location="Uploads">Uploads</button></div><div class="navmod-pane"></div></div></div>');
		}
		make_interactable();
		get_files(location);
		adjust_active_locations();
		adjust_actions_availability();
	}
	function show_navmod_menu(left, top) {
		$(".navmod-menu").css({"left":left + "px", "top":top + "px"}).show();
	}
	function hide_navmod_menu() {
		$(".navmod-menu").hide();
		$(".navmod-file-wrapper").removeClass("active");
	}
	function adjust_active_locations() {
		// Remove the "unavailable" class from all the NavMod sidebar buttons.
		$(".navmod-location").removeClass("unavailable");
		// For each NavMod window, check its active NavMod location button and then add the "unavailable" class to that location button on every NavMod window except the one that has it as active.
		$.each($(".navmod-window"), function(navmod_window_key, navmod_window_value) {
			$.each($(".navmod-location.active"), function(navmod_location_key, navmod_location_value) {
				var active_location = base64_remove_padding(btoa($(navmod_location_value).attr("data-location")));
				$(".navmod-window." + base64_remove_padding(btoa($(navmod_window_value).attr("data-location"))) + " .navmod-location." + active_location).addClass("unavailable");
				$(".navmod-location.active").removeClass("unavailable");
			});
		});
		adjust_actions_availability();
	}
	function get_current_title(location) {
		if(["navmod", "movies", "songs", "pictures", "applications", "documents", "uploads"].includes(location)) {
			var title = ucfirst(location);
		}
		$(".navmod-window." + base64_remove_padding(btoa(location)) + " .activity-title").text(title);
	}
	function navigate_navmod(current_location, title, location) {
		$(".navmod-window." + base64_remove_padding(btoa(location))).remove();
		$(".navmod-window." + base64_remove_padding(btoa(current_location))).addClass(base64_remove_padding(btoa(location))).removeClass(base64_remove_padding(btoa(current_location))).attr("data-location", location);
		get_files(location);
		$(".navmod-window." + base64_remove_padding(btoa(location)) + " .activity-title").text(title);
		adjust_active_locations();
		if(location.includes("/")) {
			$(".navmod-window .back-icon").css("display", "inline-block");
		}
		else {
			$(".navmod-window .back-icon").removeAttr("style");
		}
	}
	function rename_file(id, new_name, extension, location) {
		$.ajax({
			url: "./scripts/process.php",
			type: "POST",
			data: { action: "rename-file", id: id, new_name: new_name, extension: extension, location: location },
			success: function(data) {
				if(data.length) {
					var response = JSON.parse(data);
					notify(response['title'], response['text']);
				}
				else {
					refresh_navmod();
				}
				hide_popup();
			}
		});
	}
	function delete_file(id, type) {
		$.ajax({
			url: "./scripts/process.php",
			type: "POST",
			data: { action: "delete-file", id: id, type: type },
			success: function(data) {
				refresh_navmod();
				hide_popup();
			}
		});
	}
	function create_file(location) {
		$.ajax({
			url: "./scripts/process.php",
			type: "POST",
			data: { action: "create-file", location: location },
			success: function(data) {
				get_files(location);
			}
		});
	}
	function create_folder(location) {
		$.ajax({
			url: "./scripts/process.php",
			type: "POST",
			data: { action: "create-folder", location: location },
			success: function(data) {
				get_files(location);
			}
		});
	}
	// Windows Functionality
	$(".activity-wrapper").delegate(".activity-close", "click", function() {
		$(this).parent().parent().remove();
		adjust_active_locations();
	});
	$(".activity-wrapper").delegate(".activity-hide", "click", function() {
		var wrapper = $(this);
		$(wrapper).parent().parent().css("opacity", 0);
		setTimeout(function() {
			$(wrapper).parent().parent().hide();
		}, 250);
	});
	$(".activity-wrapper").delegate(".activity-window", "mousedown", function() {
		$(".activity-window").removeClass("front");
		var window_count = $(".activity-window").length;
		var z_index = 4 + window_count + 1;
		$.each($(".activity-window"), function(key, value) {
			var z_index_relative = 5 + key;
			$(value).css("z-index", z_index_relative);
		});
		$(this).css("z-index", z_index).addClass("front");
		adjust_actions_availability();
	});
	$(".activity-wrapper").delegate(".settings-category", "click", function() {
		var settings = JSON.parse($(".main-wrapper").attr("data-settings"));
		var category = $(this).text().toLowerCase();
		$(".settings-category").removeClass("active");
		$(this).addClass("active");
		if(category == "appearance") {
			var html = '<button class="settings-label">Theme</button><div class="settings-item-wrapper" data-setting="theme"><button class="settings-button small choice" data-choice="light">Light</button><button class="settings-button small choice" data-choice="dark">Dark</button></div><button class="settings-label">Background</button><div class="settings-item-wrapper background-color"><input class="settings-input small color-1" placeholder="Color 1..." type="text"><input class="settings-input small color-2" placeholder="Color 2..." type="text"></div><button class="settings-label">Dock Visibility</button><div class="settings-item-wrapper" data-setting="dock-visibility"><button class="settings-button small choice" data-choice="hidden">Hidden</button><button class="settings-button small choice" data-choice="visible">Visible</button></div><button class="settings-label">Dock Size</button><div class="settings-item-wrapper" data-setting="dock-size"><button class="settings-button small choice" data-choice="small">Small</button><button class="settings-button small choice" data-choice="medium">Medium</button><button class="settings-button small choice" data-choice="large">Large</button></div><button class="settings-label">NavMod File View</button><div class="settings-item-wrapper" data-setting="navmod-file-view"><button class="settings-button small choice" data-choice="icons">As Icons</button><button class="settings-button small choice" data-choice="list">As List</button></div><button class="settings-label">Navbar Battery Icon</button><div class="settings-item-wrapper" data-setting="navbar-battery-icon"><button class="settings-button small choice" data-choice="hidden">Hidden</button><button class="settings-button small choice" data-choice="visible">Visible</button></div>';
		}
		if(category == "account") {
			var html = '<button class="settings-label">Logout of Account</button><div class="settings-item-wrapper"><button class="settings-button large action" data-action="logout">Logout</button></div><button class="settings-label">Username</button><div class="settings-item-wrapper"><input class="settings-input large change-username password" placeholder="Password..." type="password"><input class="settings-input large change-username username" placeholder="New Username..." type="text"><button class="settings-button large action" data-action="change-username">Change Username</button></div><button class="settings-label">Password</button><div class="settings-item-wrapper"><input class="settings-input large change-password current-password" placeholder="Current Password..." type="password"><input class="settings-input large change-password new-password" placeholder="New Password..." type="password"><input class="settings-input large change-password repeat-password" placeholder="Repeat Password..." type="password"><button class="settings-button large action" data-action="change-password">Change Password</button></div>';
		}
		if(category == "actions") {
			var html = '<button class="settings-label">Delete All Files</button><div class="settings-item-wrapper"><input class="settings-input large delete-all-files password" placeholder="Password..." type="password"><button class="settings-button large action" data-action="delete-all-files">Delete</button></div><button class="settings-label">Reset Settings</button><div class="settings-item-wrapper"><button class="settings-button large action" data-action="reset-settings">Reset</button></div><button class="settings-label">Move Files to "Uploads"</button><div class="settings-item-wrapper"><input class="settings-input large move-files password" placeholder="Password..." type="password"><button class="settings-button large action" data-action="move-files">Move</button></div><button class="settings-label">Reset Everything</button><div class="settings-item-wrapper"><input class="settings-input large reset-everything password" placeholder="Password..." type="password"><button class="settings-button large action" data-action="reset-everything">Reset</button>';
		}
		if(category == "system") {
			var html = '<button class="settings-label">Storage</button><div class="settings-item-wrapper"><div class="settings-storage-wrapper"><div class="settings-storage-foreground"></div><div class="settings-storage-background"></div></div><input class="settings-input medium noselect free" type="text" readonly style="cursor:default;" value="Free: "><input class="settings-input medium noselect used" type="text" readonly style="cursor:default;" value="Used: "></div>';
		}
		$(".settings-pane").html(html).attr("data-category", category).scrollTop(0, 0);
		if(category == "system") {
			get_storage();
		}
		if(category == "appearance") {
			get_settings();
		}
	});
	$(".activity-wrapper").delegate(".settings-button", "click", function() {
		var category = $(this).parent().parent().attr("data-category");
		if($(this).hasClass("action")) {
			var action = $(this).attr("data-action");
			if(action == "logout") {
				logout();
			}
			if(action == "change-username") {
				var password = $(".settings-item-wrapper .change-username.password").val();
				var username = $(".settings-item-wrapper .change-username.username").val();
				$.ajax({
					url: "./scripts/process.php",
					type: "POST",
					data: { action: "change-username", password: password, username: username },
					success: function(data) {
						logout();
					}
				});
			}
			if(action == "change-password") {
				var current_password = $(".settings-item-wrapper .change-password.current-password").val();
				var new_password = $(".settings-item-wrapper .change-password.new-password").val();
				var repeat_password = $(".settings-item-wrapper .change-password.repeat-password").val();
				if(new_password == repeat_password) {
					$.ajax({
						url: "./scripts/process.php",
						type: "POST",
						data: { action: "change-password", current_password: current_password, new_password: new_password, repeat_password: repeat_password },
						success: function(data) {
							logout();
						}
					});
				}
				else {
					notify("Error", "The passwords don't match.");
				}
			}
			if(action == "delete-all-files") {
				var password = $(".settings-item-wrapper .delete-all-files.password").val();
				$.ajax({
					url: "./scripts/process.php",
					type: "POST",
					data: { action: "delete-all-files", password: password },
					success: function(data) {
						if(data == "done") {
							refresh_navmod();
						}
						else {
							notify("Error", data);
						}
					}
				});
			}
			if(action == "reset-settings") {
				$.ajax({
					url: "./scripts/process.php",
					type: "POST",
					data: { action: "reset-settings" },
					success: function(data) {
						get_settings();
					}
				});
			}
			if(action == "move-files") {
				var password = $(".settings-item-wrapper .move-files.password").val();
				$.ajax({
					url: "./scripts/process.php",
					type: "POST",
					data: { action: "move-all-files", password: password },
					success: function(data) {
						if(data == "done") {
							refresh_navmod();
						}
					}
				});
			}
			if(action == "reset-everything") {
				var password = $(".settings-item-wrapper .reset-everything.password").val();
				$.ajax({
					url: "./scripts/process.php",
					type: "POST",
					data: { action: "reset-everything", password: password },
					success: function(data) {
						logout();
					}
				});
			}
		}
		else if($(this).hasClass("choice") && !$(this).hasClass("active")) {
			var setting = $(this).parent().attr("data-setting");
			var choice = $(this).attr("data-choice");
			apply_setting(category, setting, choice);
		}
	});
	$(".activity-wrapper").delegate(".settings-item-wrapper.background-color .settings-input", "keyup", function() {
		var category = $(this).parent().parent().attr("data-category");
		if($(this).hasClass("color-1")) {
			var setting = "background-color-1";
		}
		else if($(this).hasClass("color-2")) {
			var setting = "background-color-2";
		}
		var choice = $(this).val();
		if(!choice.includes("#")) {
			var choice = "#" + choice;
		}
		apply_setting(category, setting, choice);
	});
	$(".activity-wrapper").delegate(".help-search", "keyup", function() {
		var search = $(this).val().toLowerCase();
		if(search.trim().length != 0) {
			$(".help-section").filter(function() {
				$(this).toggle($(this).find(".tags").text().toLowerCase().indexOf(search) > -1);
			});
		}
		else {
			$(".help-section").show();
		}
	});
	$(".activity-wrapper").delegate(".help-action", "click", function() {
		var action = $(this).attr("data-action");
		if(action == "open-settings") {
			$(".navbar-subitem.settings").trigger("click");
		}
		else if(action == "open-navmod") {
			$(".navbar-subitem.navmod").trigger("click");
		}
	});
	// Windows Functions
	function create_window(title, width, height, html, activity) {
		var window_count = $(".activity-window").length;
		var z_index = 4 + window_count + 1;
		if(window_count > 5) {
			$(".activity-window")[window_count].remove();
		}
		$(".activity-window").removeClass("front");
		if(width > $(window).width()) {
			var width = $(window).width() - 2;
		}
		if(height > $(window).height()) {
			var height = $(window).height();
		}
		$(".activity-wrapper").append('<div class="activity-window ' + activity + ' front" style="width:' + width + 'px; height:' + height + 'px; z-index:' + z_index + ';"><div class="activity-window-top"><button class="activity-close"></button><button class="activity-hide"></button><span class="activity-title noselect">' + title + '</span></div><div class="activity-window-bottom">' + html + '</div></div>');
		make_interactable();
		adjust_actions_availability();
		if(activity == "settings") {
			get_settings();
		}
	}
	function make_interactable() {
		if($("body").attr("id") == "desktop") {
			$(".activity-window").draggable({handle: ".activity-window-top", containment: "parent"});
		}
	}
	function get_storage() {
		$.ajax({
			url: "./scripts/api.php",
			type: "POST",
			data: { action: "get-storage" },
			success: function(data) {
				var storage = JSON.parse(data);
				var free = storage['free'];
				var total = storage['total'];
				var percentage = 100 - (free * 100) / total;
				var width = percentage.toFixed(2);
				$(".settings-storage-foreground").css("width", width + "%");
				$(".settings-input.free").val("Free: " + bytes_to_size(free));
				$(".settings-input.used").val("Used: " + bytes_to_size(total - free));
			}
		});
	}
	function adjust_actions_availability() {
		if($(".front").hasClass("navmod-window")) {
			$(".navbar-subitem.new-file, .navbar-subitem.new-folder").addClass("available").removeClass("unavailable");
		}
		else {
			$(".navbar-subitem.new-file, .navbar-subitem.new-folder").addClass("unavailable").removeClass("available");
		}
	}
	function apply_setting(category, setting, choice) {
		$.ajax({
			url: "./scripts/process.php",
			type: "POST",
			data: { action: "save-settings", category: category, setting: setting, choice: choice },
			success: function(data) {
				get_settings();
			}
		});
	}
	// Upload Menu Functionality
	var uploader = new plupload.Uploader({
		browse_button: 'upload-overlay',
		container: 'upload-menu',
		drop_element: 'upload-overlay',
		url: './scripts/process.php',
		chunk_size: "10000kb",
		multiple_queues: true,
		multipart_params: { action: "upload-file" },

		init: {
			BeforeUpload: function(up, file) {
				var extension = $("#" + file.id + " .upload-file-type").val();
				if(extension.length) {
					file.name = $("#" + file.id + " .upload-file-name").val() + "." + extension;
				}
				else {
					file.name = $("#" + file.id + " .upload-file-name").val();
				}
			},
			
			PostInit: function(up, file) {
				$(".upload-list").empty();
				$(".upload-cancel").on("click", function() {
					$(".upload-list").empty();
					count_uploads();
					up.splice();
				});
				$(".upload-submit").on("click", function() {
					uploader.start();
					return false;
				});
				$(".upload-list").delegate(".upload-file-remove", "click", function() {
					var file_id = $(this).parent().parent().attr("id");
					uploader.removeFile(file_id);
					$(this).parent().parent().remove();
					count_uploads();
				});
			},

			FilesAdded: function(up, files) {
				plupload.each(files, function(file) {
					if(file.name.includes(".")) {
						var file_name = file.name.split(".").slice(0, -1).join(".");
					}
					else {
						var file_name = file.name;
					}
					$(".upload-list").append('<div class="upload-file-wrapper" id="' + file.id + '"><input class="upload-file-name" value="' + file_name + '"><input class="upload-file-type" value="' + file.name.split(".").pop().toUpperCase() + '"><div class="upload-file-progress-wrapper"><div class="upload-file-progress-background"></div><div class="upload-file-progress-foreground"></div></div><div class="upload-file-bottom"><button class="upload-file-remove">Remove</button><button class="upload-file-size">' + bytes_to_size(file.size) + '</button></div></div>');
				});
				count_uploads();
			},

			UploadProgress: function(up, file) {
				$("#" + file.id + " .upload-file-progress-foreground").css("width", file.percent + "%");
				var file_count = $(".upload-file-wrapper").length;
				
				var file_size_mb = file.size / 1000000;
				
				if(file_size_mb < 1) {
					var delay = 0.75 * 1000;
				}
				if(file_size_mb > 1 && file_size_mb < 10) {
					var delay = 1 * 1000;
				}
				if(file_size_mb > 10 && file_size_mb < 100) {
					var delay = 3 * 1000;
				}
				if(file_size_mb > 100 && file_size_mb < 500) {
					var delay = 5 * 1000;
				}
				if(file_size_mb > 500 && file_size_mb < 2500) {
					var delay = 8 * 1000;
				}
				if(file_size_mb > 2500 && file_size_mb < 6000) {
					var delay = 15 * 1000;
				}
				
				var last_progress = $(".upload-file-progress-foreground:last").width() / $(".upload-file-progress-background").width();
				
				if(last_progress == 1) {
					setTimeout(function() {
						$(".upload-list").empty();
						count_uploads();
						up.splice();
						get_files("Uploads");
						hide_upload_menu();
					}, delay);
				}
			},

			Error: function(up, err) {
				notify("Error #" + err.code, err.message);
				setTimeout(function() { $(".upload-list").empty(); up.splice(); }, 2000);
			}
		}
	});
	uploader.init();
	// Upload Menu Functions
	function count_uploads() {
		$(".upload-count").html($(".upload-file-wrapper").length + " Files");
		if(!$(".upload-file-wrapper").length) {
			$(".upload-list, .upload-actions").hide();
			$(".upload-overlay").show().css("z-index", "1");
		}
		else {
			$(".upload-list, .upload-actions").show();
			$(".upload-overlay").hide().css("z-index", "-1");
			$(".moxie-shim").hide();
		}
	}
	// Notification Menu Functionality
	$(".notification-menu").delegate(".notification-remove", "click", function() {
		var id = $(this).parent().parent().attr("id");
		$.ajax({
			url: "./scripts/process.php",
			type: "POST",
			data: { action: "remove-notification", id: id },
			success: function(data) {
				get_notifications();
			}
		});
	});
	$(".notification-clear").on("click", function() {
		clear_notifications();
	});
	// Page Functionality
	$(".main-wrapper").on("click", function() {
		hide_menus();
		hide_notification_menu();
		hide_upload_menu();
	});
	$(window).scroll(function() {
		var position = $(window).scrollTop();
		if(position > 0 || position > $(window).width()) {
			window.scrollTo(0, 0);
		}
	});
	$(".popup-overlay, .popup-close").on("click", function() {
		hide_popup();
	});
	// Page Functions
	function popup(title, width, height, html, scroll, id) {
		$(".popup-overlay").show();
		$(".popup-wrapper").show().css({"width":width, "height":height, "left":"calc(50% - " + width / 2 + "px)", "top":"calc(50% - " + (height / 2 + 30) + "px)"}).attr("id", id);
		$(".popup-bottom").html(html);
		$(".popup-title").text(title);
		if(scroll) {
			$(".popup-bottom").addClass("scroll");
		}
		else {
			$(".popup-bottom").removeClass("scroll");
		}
	}
	function hide_popup() {
		$(".popup-overlay").hide();
		$(".popup-wrapper").removeAttr("style").removeAttr("id");
		$(".popup-bottom").empty().removeAttr("scroll");
		$(".popup-title").text("");
	}
	function initialize() {
		get_ip();
		check_connection();
		check_battery();
	}
	function get_ip() {
		$.ajax({
			url: "./scripts/api.php",
			type: "POST",
			data: { action: "get-ip" },
			success: function(data) {
				$(".navbar-subitem.ip").text(data);
			}
		});
	}
	function check_connection() {
		$.ajax({
			url: "./scripts/api.php",
			type: "POST",
			data: { action: "check-connection" },
			success: function(data) {
				if(data.length) {
					$(".navbar-icon .wifi-icon").removeAttr("style");
					$(".navbar-subitem.connection").text(data);
				}
				else {
					$(".navbar-icon .wifi-icon").css("fill", "rgb(230,150,0)");
					$(".navbar-subitem.connection").text("Client Error");
				}
			},
			error: function() {
				$(".navbar-icon .wifi-icon").css("fill", "rgb(230,50,50)");
				$(".navbar-subitem.connection").text("Server Error");
			}
		});
	}
	function get_username() {
		$.ajax({
			url: "./scripts/api.php",
			type: "POST",
			data: { action: "get-username" },
			success: function(data) {
				$(".navbar-subitem.logout").text("Logout " + data);
			}
		});
	}
	function logout() {
		$.ajax({
			url: "./scripts/process.php",
			type: "POST",
			data: { action: "logout" },
			success: function(data) {
				if(data == "done") {
					location.reload();
				}
			}
		});
	}
	// Other Functions
	function bytes_to_size(b) {
		var s = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if(b == 0) {
			return '0 Bytes';
		}
		var i = parseInt(Math.floor(Math.log(b) / Math.log(1024)));
		return Math.round(b / Math.pow(1024, i), 2) + ' ' + s[i];
	}
	function occurrences(string, substring, allow_overlapping) {
		string += "";substring += "";if (substring.length <= 0) return (string.length + 1);var n = 0,pos = 0,step = allow_overlapping ? 1 : substring.length;while (true) {pos = string.indexOf(substring, pos);if (pos >= 0) {++n;pos += step;} else break;}return n;
	}
	function getKeyByValue(object, value) {
		return Object.keys(object).find(key => object[key] === value);
	}
	function ucfirst(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	function copy_to_clipboard(text) {
		var temp = $("<textarea>");
		$("body").append(temp);
		temp.val(text).select();
		document.execCommand("copy");
		temp.remove();
	}
	jQuery.fn.hovering = function() {
		return $(this).parent().find($(this).selector + ":hover").length > 0;
	};
	function check_battery() {
		battery_is_charging();
		battery_percentage();
	}
	function battery_percentage() {
		navigator.getBattery().then(function(battery) {
			var percentage = battery.level * 100;
			$(".navbar-battery-foreground").css("width", percentage + "%");
			$(".navbar-subitem.percentage").text(percentage + "%");
			if(percentage < 30) {
				$(".navbar-battery-foreground").css("background", "rgb(230,50,50)");
			}
			else if(percentage >= 30 && percentage <= 60) {
				$(".navbar-battery-foreground").css("background", "rgb(230,150,0)");
			}
			else if(percentage > 60 && percentage < 100) {
				$(".navbar-battery-foreground").removeAttr("style").css("width", percentage + "%");
			}
			else if(percentage == 100) {
				$(".navbar-battery-foreground").removeAttr("style").css("width", percentage + "%");
				$(".navbar-battery-wrapper .backward-icon, .navbar-battery-wrapper .bolt-icon").hide();
				$(".navbar-subitem.charging").text("Charged");
			}
		});
	}
	function battery_is_charging() {
		navigator.getBattery().then(function(battery) {
			if(battery.charging) {
				$(".navbar-battery-wrapper .bolt-icon").show();
				$(".navbar-battery-wrapper .backward-icon").hide();
				$(".navbar-subitem.charging").text("Charging");
			} 
			else {
				$(".navbar-battery-wrapper .bolt-icon").hide();
				$(".navbar-battery-wrapper .backward-icon").show();
				$(".navbar-subitem.charging").text("Discharging");
			}
		});
	}
});