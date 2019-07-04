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

	if($logged_in) {
		$queries = array();
		parse_str($_SERVER['QUERY_STRING'], $queries);
		if(empty($queries['action'])) {
			$action = $_POST['action'];
		}
		else {
			$action = $queries['action'];
		}
		
		if($action == "get-file-info") {
			$id = $_POST['id'];
			$file_system = json_decode(file_get_contents("../source/cfg/file_system.config"), true);
			$file = $file_system[$id];
			
			$name = $file['name'];
			$parts = explode(".", $name);
			if(strpos($name, ".") !== false) {
				$extension = "." . array_pop($parts);
			}
			else {
				$extension = "";
			}
			$size = filesize("../files/uploads/" . $id . $extension);
			$location = $file['location'];
			$type = $file['type'];
			$creation_time = substr($id, 0, 10);
			
			$info = array("name" => $name, "extension" => $extension, "size" => $size, "location" => $location, "type" => $type, "creation-time" => $creation_time);
			echo json_encode($info);
		}
		if($action == "download-file") {
			$id = $queries['id'];
			$file_system = json_decode(file_get_contents("../source/cfg/file_system.config"), true);
			$name = $file_system[$id]['name'];
			$parts = explode(".", $name);
			if(strpos($name, ".") !== false) {
				$extension = "." . array_pop($parts);
			}
			else {
				$extension = "";
			}
			$file = "../files/uploads/" . $id . strtolower($extension);
			$mime = mime_content_type($file);
			header('Content-Type: ' . $mime);
			header('Content-Disposition: attachment; filename="' . $name . '"');
			header('Content-Length: '. filesize($file));
			readfile($file);
		}
		if($action == "get-file-system") {
			$checksum = $_POST['checksum'];
			if(empty($checksum) or $checksum != md5_file("../source/cfg/file_system.config")) {
				echo json_encode(["checksum" => md5_file("../source/cfg/file_system.config"), "file-system" => json_decode(file_get_contents("../source/cfg/file_system.config"), true)]);
			}
			else {
				echo "identical";
			}
		}
		if($action == "get-notifications") {
			$checksum = $_POST['checksum'];
			if(empty($checksum) or $checksum != md5_file("../source/cfg/notifications.config")) {
				echo json_encode(["checksum" => md5_file("../source/cfg/notifications.config"), "notifications" => array_reverse(json_decode(file_get_contents("../source/cfg/notifications.config"), true))]);
			}
			else {
				echo "identical";
			}
		}
		if($action == "get-settings") {
			echo file_get_contents("../source/cfg/settings.config");
		}
		if($action == "get-ip") {
			echo $_SERVER['REMOTE_ADDR'];
		}
		if($action == "check-connection") {
			echo "Connected";
		}
		if($action == "get-storage") {
			echo json_encode(array("free" => disk_free_space($_SERVER['DOCUMENT_ROOT']), "total" => disk_total_space($_SERVER['DOCUMENT_ROOT'])));
		}
	}
?>