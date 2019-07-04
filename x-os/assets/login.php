<!-- Copyright <?php echo date('Y'); ?> © Xtrendence -->
<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" href="./source/css/structure.css?<?php echo time(); ?>">
		<link class="file-css" rel="stylesheet" href="./source/css/<?php echo $theme; ?>.css?<?php echo time(); ?>">
		<link rel="stylesheet" href="./source/css/resize.css?<?php echo time(); ?>">
		<script src="./source/js/jquery.js"></script>
		<script src="./source/js/login.js?<?php echo time(); ?>"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="theme-color" content="<?php echo $theme_color; ?>" class="theme-color">
		<title>X:/OS</title>
	</head>
	
	<body id="<?php echo $device; ?>">
		<div class="login-wrapper">
			<div class="activity-window front login" style="width:300px;height:150px;top:calc(50% - 75px);left:calc(50% - 150px);z-index:5;">
				<div class="activity-window-top" style="cursor:default;">
					<span class="activity-title noselect">Login</span>
				</div>
				<div class="activity-window-bottom">
					<div class="login-account-wrapper">
						<?php echo $account_icon; ?>
						<span><?php echo $valid_username; ?></span>
					</div>
					<div class="login-input-wrapper">
						<?php echo $clock_icon; ?>
						<input class="login-input password" type="password" placeholder="Password...">
						<?php echo $back_icon; ?>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>