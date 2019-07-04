<?php
	include "./assets/icons.php";
	include "./scripts/detect_device.php";
	if($user_agent_mobile) {
		$device = "mobile";
	}
	else {
		$device = "desktop";
	}

	session_start();
	
	$account = json_decode(file_get_contents("./source/cfg/account.config"), true);
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
	
	$settings = json_decode(file_get_contents("./source/cfg/settings.config"), true);
	$theme = $settings['appearance']['theme'];
	if($theme == "light") {
		$theme_color = "#efefef";
	}
	elseif($theme == "dark") {
		$theme_color = "#323232";
	}

	if(!$logged_in) {
		include "./assets/login.php";
	}
	else {
?>
<!-- Copyright <?php echo date('Y'); ?> © Xtrendence -->
<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" href="./source/css/structure.css?<?php echo time(); ?>">
		<link class="file-css" rel="stylesheet" href="./source/css/<?php echo $theme; ?>.css?<?php echo time(); ?>" data-theme="<?php echo $theme; ?>">
		<link rel="stylesheet" href="./source/css/resize.css?<?php echo time(); ?>">
		<script src="./source/js/jquery.js"></script>
		<script src="./source/js/jquery-ui.js"></script>
		<script src="./source/js/plupload.js"></script>
		<script src="./source/js/date.js"></script>
		<script src="./source/js/main.js?<?php echo time(); ?>"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="theme-color" content="<?php echo $theme_color; ?>" class="theme-color">
		<title>X:/OS</title>
	</head>
	
	<body id="<?php echo $device; ?>">
		<div class="navbar">
			<div class="navbar-left">
				<button class="navbar-item x-os">X:/OS</button>
				<div class="navbar-menu x-os">
					<button class="navbar-subitem" data-action="about">About</button>
					<button class="navbar-subitem settings" data-action="settings">Settings</button>
					<button class="navbar-subitem logout" data-action="logout">Logout</button>
				</div>
				<button class="navbar-item navmod">NavMod</button>
				<div class="navbar-menu navmod">
					<button class="navbar-subitem navmod" data-action="new-navmod-window">New Window</button>
				</div>
				<button class="navbar-item file">File</button>
				<div class="navbar-menu file">
					<button class="navbar-subitem" data-action="upload-file">Upload File</button>
					<button class="navbar-subitem unavailable new-file" data-action="new-file">New File</button>
					<button class="navbar-subitem unavailable new-folder" data-action="new-folder">New Folder</button>
				</div>
				<button class="navbar-item view">View</button>
				<div class="navbar-menu view">
					<button class="navbar-subitem view-as-icons" data-action="view-as-icons">As Icons</button>
					<button class="navbar-subitem view-as-list" data-action="view-as-list">As List</button>
					<button class="navbar-subitem" data-action="hide-all-windows">Hide All Windows</button>
					<button class="navbar-subitem" data-action="show-all-windows">Show All Windows</button>
				</div>
				<button class="navbar-item help">Help</button>
				<div class="navbar-menu help">
					<button class="navbar-subitem" data-action="how-to-use">How to Use</button>
				</div>
			</div>
			<div class="navbar-right">
				<div class="navbar-battery-wrapper">
					<?php echo $bolt_icon; ?>
					<?php echo $backward_icon; ?>
					<div class="navbar-battery-background">
						<div class="navbar-battery-foreground"></div>
					</div>
				</div>
				<div class="navbar-menu">
					<button class="navbar-subitem percentage">Loading...</button>
					<button class="navbar-subitem charging">Loading...</button>
				</div>
				<button class="navbar-icon upload"><?php echo $upload_icon; ?></button>
				<button class="navbar-icon connection"><?php echo $wifi_icon; ?></button>
				<div class="navbar-menu">
					<button class="navbar-subitem ip">Loading...</button>
					<button class="navbar-subitem connection">Loading...</button>
				</div>
				<button class="navbar-icon notifications"><?php echo $notification_icon; ?></button>
			</div>
		</div>
		<div class="upload-menu" id="upload-menu">
			<div class="upload-overlay" id="upload-overlay">
				<button class="upload-overlay-label" id="upload-overlay-label">Drag &amp; Drop</button>
			</div>
			<div class="upload-list" id="upload-list"></div>
			<div class="upload-actions">
				<button class="upload-cancel">Cancel</button>
				<button class="upload-count">... Files</button>
				<button class="upload-submit">Upload</button>
			</div>
		</div>
		<div class="notification-menu">
			<button class="notification-clear">Clear</button>
			<div class="notification-list"></div>
		</div>
		<div class="main-wrapper">
			<div class="activity-wrapper" data-file-system=""></div>
			<div class="dock-wrapper noselect">
				<div class="dock">
					<div class="dock-item navmod">
						<button class="dock-name">NavMod</button>
						<img class="dock-icon" src="./images/system-icons/folders/placeholder.png" data-src="./images/system-icons/folders/navmod.png" draggable="false">
					</div>
					<div class="dock-item movies">
						<button class="dock-name">Movies</button>
						<img class="dock-icon" src="./images/system-icons/folders/placeholder.png" data-src="./images/system-icons/folders/movies.png" draggable="false">
					</div>
					<div class="dock-item songs">
						<button class="dock-name">Songs</button>
						<img class="dock-icon" src="./images/system-icons/folders/placeholder.png" data-src="./images/system-icons/folders/songs.png" draggable="false">
					</div>
					<div class="dock-item pictures">
						<button class="dock-name">Pictures</button>
						<img class="dock-icon" src="./images/system-icons/folders/placeholder.png" data-src="./images/system-icons/folders/pictures.png" draggable="false">
					</div>
					<div class="dock-item applications">
						<button class="dock-name">Applications</button>
						<img class="dock-icon" src="./images/system-icons/folders/placeholder.png" data-src="./images/system-icons/folders/applications.png" draggable="false">
					</div>
					<div class="dock-item documents">
						<button class="dock-name">Documents</button>
						<img class="dock-icon" src="./images/system-icons/folders/placeholder.png" data-src="./images/system-icons/folders/documents.png" draggable="false">
					</div>
					<div class="dock-item uploads">
						<button class="dock-name">Uploads</button>
						<img class="dock-icon" src="./images/system-icons/folders/placeholder.png" data-src="./images/system-icons/folders/uploads.png" draggable="false">
					</div>
				</div>
			</div>
		</div>
		<div class="navmod-menu">
			<button class="navmod-menu-item open" data-action="open">Open</button>
			<button class="navmod-menu-item download" data-action="download">Download</button>
			<button class="navmod-menu-item rename" data-action="rename">Rename</button>
			<button class="navmod-menu-item move" data-action="move">Move</button>
			<button class="navmod-menu-item delete" data-action="delete">Delete</button>
			<button class="navmod-menu-item get-info" data-action="get-info">Get Info</button>
			<button class="navmod-menu-item new-file" data-action="new-file">New File</button>
			<button class="navmod-menu-item new-folder" data-action="new-folder">New Folder</button>
		</div>
		<div class="popup-overlay"></div>
		<div class="popup-wrapper">
			<div class="popup-top">
				<button class="popup-close"></button>
				<span class="popup-title noselect"></span>
			</div>
			<div class="popup-bottom"></div>
		</div>
		<div class="file-icons hidden">
			<?php foreach($file_icons as $name => $svg) { echo '<div class="' . $name . '">' . $svg . '</div>'; } ?>
		</div>
		<div class="other-icons hidden">
			<div class="back_icon">
				<?php echo $back_icon; ?>
			</div>
		</div>
	</body>
</html>
<?php } ?>