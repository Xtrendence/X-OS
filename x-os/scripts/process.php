<?php
	session_start();
	$account = json_decode(file_get_contents("../source/cfg/account.config"), true);
	$valid_username = $account['username'];
	$valid_password = $account['password'];
	if(!empty($account['time']) && time() - $account['time'] > 2592000) {
		$account['token'] = str_shuffle(hash("sha512", str_shuffle(time())));
		$account['time'] = "";
		file_put_contents("../source/cfg/account.config", json_encode($account));
		setcookie("x-os-token", null, -1, "/");
	}
	if($_SESSION['LoggedIn'] or isset($_COOKIE['x-os-token']) && $_COOKIE['x-os-token'] == $account['token'] && !empty($account['time'])) {
		$logged_in = true;
	}
	
	$queries = array();
	parse_str($_SERVER['QUERY_STRING'], $queries);
	if(empty($queries['action'])) {
		$action = $_POST['action'];
	}
	else {
		$action = $queries['action'];
	}

	if($logged_in) {
		function generate_id() {
			return time() . "-" . random_int(10000000, 99999999);
		}
		$default_settings = array("appearance" => array("theme" => "dark", "background-color-1" => "#", "background-color-2" => "#", "dock-visibility" => "visible", "dock-size" => "medium", "navmod-file-view" => "icons", "navbar-battery-icon" => "visible"));
		
		if($action == "save-settings") {
			$category = trim(strtolower($_POST['category']));
			$setting = trim(strtolower($_POST['setting']));
			$choice = trim(strtolower($_POST['choice']));
			if(!empty($category) && !empty($setting) && !empty($choice)) {
				$settings = json_decode(file_get_contents("../source/cfg/settings.config"), true);
				$settings[$category][$setting] = $choice;
				file_put_contents("../source/cfg/settings.config", json_encode($settings));
			}
		}
		if($action == "reset-settings") {
			file_put_contents("../source/cfg/settings.config", json_encode($default_settings));
		}
		if($action == "change-username") {
			if(!empty($_POST['username']) && !empty($_POST['password'])) {
				if(password_verify($_POST['password'], $valid_password)) {
					if(ctype_alnum($_POST['username'])) {
						$account['username'] = $_POST['username'];
						$account['token'] = str_shuffle(hash("sha512", str_shuffle(time())));
						$account['time'] = "";
						$change = file_put_contents("../source/cfg/account.config", json_encode($account));
						setcookie("x-os-token", null, -1, "/");
						if($change) {
							echo "done";
						}
						else {
							echo "Could not change username.";
						}
					}
					else {
						echo "Username can only have letters and numbers.";
					}
				}
				else {
					echo "Wrong password.";
				}
			}
			else {
				echo "Please fill out both fields.";
			}
		}
		if($action == "change-password") {
			if(!empty($_POST['current_password']) && !empty($_POST['new_password']) && !empty($_POST['repeat_password'])) {
				if($_POST['new_password'] == $_POST['repeat_password']) {
					if(password_verify($_POST['current_password'], $valid_password)) {
						$hashed = password_hash($_POST['new_password'], PASSWORD_BCRYPT);
						$account['password'] = $hashed;
						$account['token'] = str_shuffle(hash("sha512", str_shuffle(time())));
						$account['time'] = "";
						$change = file_put_contents("../source/cfg/account.config", json_encode($account));
						setcookie("x-os-token", null, -1, "/");
						if($change) {
							echo "done";
						}
						else {
							echo "Could not change username.";
						}
					}
					else {
						echo "Wrong password.";
					}
				}
				else {
					echo "Passwords don't match.";
				}
			}
			else {
				echo "Please fill out all fields.";
			}
		}
		if($action == "delete-all-files") {
			if(password_verify($_POST['password'], $valid_password)) {
				$files = glob("../files/uploads/*");
				foreach($files as $file) {
					unlink($file);
				}
				$delete = file_put_contents("../source/cfg/file_system.config", "");
				if($delete) {
					echo "done";
				}
			}
			else {
				echo "Wrong password.";
			}
		}
		if($action == "move-all-files") {
			if(password_verify($_POST['password'], $valid_password)) {
				$file_system = json_decode(file_get_contents("../source/cfg/file_system.config"), true);
				foreach($file_system as $file_id => $info) {
					$file_system[$file_id]['location'] = "Uploads";
				}
				$move = file_put_contents("../source/cfg/file_system.config", json_encode($file_system));
				if($move) {
					echo "done";
				}
			}
			else {
				echo "Wrong password.";
			}
		}
		if($action == "reset-everything") {
			if(password_verify($_POST['password'], $valid_password)) {
				$account['username'] = "admin";
				$account['password'] = password_hash("admin", PASSWORD_BCRYPT);
				$account['token'] = str_shuffle(hash("sha512", str_shuffle(time())));
				$account['time'] = "";
				file_put_contents("../source/cfg/account.config", json_encode($account));
				
				file_put_contents("../source/cfg/settings.config", json_encode($default_settings));
				
				$files = glob("../files/uploads/*");
				foreach($files as $file) {
					unlink($file);
				}
				file_put_contents("../source/cfg/file_system.config", "");
				
				file_put_contents("../source/cfg/notifications.config", "");
				
				$_SESSION = array();
				setcookie("x-os-token", null, -1, "/");
			}
			else {
				echo "Wrong password.";
			}
		}
		if($action == "add-notification") {
			$title = $_POST['title'];
			$text = $_POST['text'];
			$id = generate_id();
			$notifications = json_decode(file_get_contents("../source/cfg/notifications.config"), true);
			while(isset($notifications[$id])) {
				$id = generate_id();
			}
			$notifications[$id] = array("title" => $title, "text" => $text);
			file_put_contents("../source/cfg/notifications.config", json_encode($notifications));
		}
		if($action == "remove-notification") {
			$id = $_POST['id'];
			$notifications = json_decode(file_get_contents("../source/cfg/notifications.config"), true);
			unset($notifications[$id]);
			file_put_contents("../source/cfg/notifications.config", json_encode($notifications));
		}
		if($action == "clear-notifications") {
			file_put_contents("../source/cfg/notifications.config", "");
		}
		if($action == "create-file") {
			$location = $_POST['location'];
			$file_id = generate_id();
			$file_system = json_decode(file_get_contents("../source/cfg/file_system.config"), true);
			while(isset($file_system[$file_id])) {
				$file_id = generate_id();
			}
			$file_system[$file_id] = array("name" => "New File (" . $file_id . ")", "location" => $location, "type" => "file");
			file_put_contents("../source/cfg/file_system.config", json_encode($file_system));
			file_put_contents("../files/uploads/" . $file_id, "");
		}
		if($action == "create-folder") {
			$location = $_POST['location'];
			$file_id = generate_id();
			$file_system = json_decode(file_get_contents("../source/cfg/file_system.config"), true);
			while(isset($file_system[$file_id])) {
				$file_id = generate_id();
			}
			$file_system[$file_id] = array("name" => "New Folder (" . $file_id . ")", "location" => $location, "type" => "folder");
			file_put_contents("../source/cfg/file_system.config", json_encode($file_system));
		}
		if($action == "move-file") {
			$id = $_POST['id'];
			$to = $_POST['to'];
			$type = $_POST['type'];
			$parts = explode("/", $to);
			$file_system = json_decode(file_get_contents("../source/cfg/file_system.config"), true);
			$name = $file_system[$id]['name'];
			$location = $file_system[$id]['location'];
			$folder = $location . "/" . $name;
			$exists = false;
			foreach($file_system as $file_id => $info) {
				if($info['location'] . "/" . $info['name'] == $to . "/" . $name) {
					$exists = true;
				}
			}
			if(!$exists) {
				if($type == "folder") {
					foreach($file_system as $file_id => $info) {
						if(strpos($file_system[$file_id]['location'], $folder) !== false && $file_id != $id) {
							$file_system[$file_id]['location'] = str_replace($folder, $to . "/" . $name, $file_system[$file_id]['location']);
						}
					}
				}
				$file_system[$id]['location'] = $to;
				file_put_contents("../source/cfg/file_system.config", json_encode($file_system));
			}
			else {
				echo json_encode(array("title" => "Error", "text" => "A file with that name already exists in that location."));
			}
		}
		if($action == "delete-file") {
			$id = $_POST['id'];
			$type = $_POST['type'];
			$file_system = json_decode(file_get_contents("../source/cfg/file_system.config"), true);
			$name = $file_system[$id]['name'];
			$parts = explode(".", $name);
			if(strpos($name, ".") !== false) {
				$extension = "." . array_pop($parts);
			}
			else {
				$extension = "";
			}
			if($type == "file") {
				$delete = unlink("../files/uploads/" . $id . strtolower($extension));
			}
			else if($type == "folder") {
				$location = $file_system[$id]['location'] . "/" . $name;
				foreach($file_system as $file_id => $info) {
					if($location == $info['location']) {
						if($info['type'] == "file") {
							$parts = explode(".", $info['name']);
							if(strpos($info['name'], ".") !== false) {
								$file_extension = "." . array_pop($parts);
							}
							else {
								$file_extension = "";
							}
							unlink("../files/uploads/" . $file_id . strtolower($file_extension));
						}
						unset($file_system[$file_id]);
					}
				}
			}
			if($delete or $type == "folder") {
				unset($file_system[$id]);
				file_put_contents("../source/cfg/file_system.config", json_encode($file_system));
			}
		}
		if($action == "rename-file") {
			$id = $_POST['id'];
			$new_name = $_POST['new_name'];
			$extension = strtolower($_POST['extension']);
			if(!empty($extension) && strpos($extension, ".") === false) {
				$extension = "." . $extension;
			}
			$location = $_POST['location'];
			$file_system = json_decode(file_get_contents("../source/cfg/file_system.config"), true);
			$current_name = $file_system[$id]['name'];
			$type = $file_system[$id]['type'];
			if(strpos($current_name, ".") !== false) {
				$parts = explode(".", $current_name);
				$current_extension = "." . array_pop($parts);
			}
			else {
				$current_extension = "";
			}
			$exists = false;
			foreach($file_system as $file_id => $info) {
				if($info['location'] . "/" . $info['name'] == $location . "/" . $new_name . $extension) {
					$exists = true;
				}
				if($type == "folder") {
					if($info['location'] == $location . "/" . $current_name) {
						$file_system[$file_id]['location'] = $location . "/" . $new_name;
					}
				}
			}
			if(!$exists) {
				$file_system[$id]['name'] = $new_name . $extension;
				file_put_contents("../source/cfg/file_system.config", json_encode($file_system));
				rename("../files/uploads/" . $id . strtolower($current_extension), "../files/uploads/" . $id . $extension);
			}
			else {
				echo json_encode(array("title" => "Error", "text" => "A file with that name already exists in that location."));
			}
		}
		if($action == "upload-file") {
			@set_time_limit(5 * 60);
			
			$file_size = $_FILES['file']['size'];
			$file_name = $_POST['name'];
			$parts = explode(".", strtolower($file_name));
			$file_id = generate_id();
			$file_size_max = 6000000000;
			if(strpos($file_name, ".") !== false) {
				$file_extension = "." . array_pop($parts);
				$file_name_no_extension = str_ireplace($file_extension, "", $file_name);
			}
			else {
				$file_extension = "";
				$file_name_no_extension = $file_name;
			}
			
			$whitelist = ["jpg","jpeg","png","icns","ico","bmp","gif","psd","mkv","mov","mp4","m4v","avi","ts","flv","wmv","m4p","3gp","webm","mp3","wav","ogg","aac","aiff","m4a","wma","pdf","exe","pkg","msi","py","sh","command","php","html","htm","css","js","config","ini","xml","ipa","apk","rar","zip","dmg","iso","7z","txt","rtf","doc","docx", "ovpn", ""];
			
			if(in_array(str_replace(".", "", $file_extension), $whitelist) && $file_size < $file_size_max) {
				$file_system = json_decode(file_get_contents("../source/cfg/file_system.config"), true);
				$upload_location = "../files/uploads/";
				$file_tmp = $_FILES['file']['tmp_name'];
				$file_path = $upload_location . $file_id . strtolower($file_extension);
				while(file_exists($file_path) or isset($file_system[$file_id])) {
					$file_id = generate_id();
				}
				$chunk = isset($_REQUEST["chunk"]) ? intval($_REQUEST["chunk"]) : 0;
				$chunks = isset($_REQUEST["chunks"]) ? intval($_REQUEST["chunks"]) : 0;
				if(!$out = @fopen("{$file_path}.part", $chunks ? "ab" : "wb")) {
					die('{"jsonrpc" : "2.0", "error" : {"code": 102, "message": "Failed to open output stream."}, "id" : "id"}');
				}
				if(!empty($_FILES)) {
					if($_FILES["file"]["error"] || !is_uploaded_file($_FILES["file"]["tmp_name"])) {
						die('{"jsonrpc" : "2.0", "error" : {"code": 103, "message": "Failed to move uploaded file."}, "id" : "id"}');
					}
					if(!$in = @fopen($_FILES["file"]["tmp_name"], "rb")) {
						die('{"jsonrpc" : "2.0", "error" : {"code": 101, "message": "Failed to open input stream."}, "id" : "id"}');
					}
				} 
				else {	
					if(!$in = @fopen("php://input", "rb")) {
						die('{"jsonrpc" : "2.0", "error" : {"code": 101, "message": "Failed to open input stream."}, "id" : "id"}');
					}
				}
				while($buff = fread($in, 4096)) {
					fwrite($out, $buff);
				}
				@fclose($out);
				@fclose($in);
				if(!$chunks || $chunk == $chunks - 1) {
					rename("{$file_path}.part", $file_path);
				}
				
				$exists = false;
				foreach($file_system as $id => $info) {
					if($info['location'] == "Uploads" && $info['name'] == $file_name_no_extension . strtolower($file_extension)) {
						$exists = true;
					}
				}
				if($exists) {
					$file_name_no_extension = $file_name_no_extension . " (" . generate_id() . ")";
				}
				$file_system[$file_id] = array("name" => $file_name_no_extension . strtolower($file_extension), "location" => "Uploads", "type" => "file");
				file_put_contents("../source/cfg/file_system.config", json_encode($file_system));
				
				die('{"jsonrpc" : "2.0", "result" : null, "id" : "id"}');
			}
		}
		if($action == "logout") {
			$_SESSION = array();
			$account['token'] = str_shuffle(hash("sha512", str_shuffle(time())));
			$account['time'] = "";
			file_put_contents("../source/cfg/account.config", json_encode($account));
			setcookie("x-os-token", null, -1, "/");
			echo "done";
		}
	}
	else {
		if($action == "login") {
			$password = $_POST['password'];
			if(password_verify($password, $valid_password)) {
				$_SESSION['Username'] = $valid_username;
				$_SESSION['LoggedIn'] = true;
				if($_POST['remember'] == "enabled") {
					$account['time'] = time();
					file_put_contents("../source/cfg/account.config", json_encode($account));
					setcookie("x-os-token", $account['token'], time() + 2592000, "/");
				}
				else {
					$account['token'] = str_shuffle(hash("sha512", str_shuffle(time())));
					$account['time'] = "";
					file_put_contents("../source/cfg/account.config", json_encode($account));
					setcookie("x-os-token", null, -1, "/");
				}
				echo "valid";
			}
			else {
				echo "Invalid Credentials";
			}
		}
	}
?>