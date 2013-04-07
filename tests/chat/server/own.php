<?php

//// Include server file and lets go for it
require_once("class.wsserver.php");
require_once("class.server.php");
$server = new CServer ("192.168.1.245", 9985);
$server->StartServer();