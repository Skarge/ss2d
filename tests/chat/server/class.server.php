<?php

class CServer extends PHPWebSocket {
	
	private $wsserver;
	private $host;
	private $port;
	
	private $player 	= array();
	private $map		= array();
	private $tilesize	= 24;
	
	private $logmode	= 1;
	private $logdate	= 1;
	
	public function __construct ($host = "localhost", $port = 9985) {
		$this->host		= $host;
		$this->port		= $port;
		
		for ($i = 0; $i < 10; $i++) {
			for ($j = 0; $j < 10; $j++) {
				$this->map[$i][$j] = 1;
			}
		}
	}
	
	
	public function __destruct () {
	}
	
	
	public function StartServer () {
		$this->LogMsg("Starting Server...");
		$this->wsStartServer($this->host, $this->port);
		$this->LogMsg("Listening on " . $this->host . ":" . $this->port);
	}
	
	
	public function ClientConnect ($clientId) {
		$player[0] 	= $clientId;
		$player[1]	= rand(0, 10) * $this->tilesize;
		$player[2]	= rand(0, 10) * $this->tilesize;
		$output		= "[*LGN*]" . $player[0] . "||" . $player[1] . "||" . $player[2];
		
		$this->LogMsg("Client #" . $clientId . " connected");
		$this->LogMsg("Client #" . $clientId . " set to position " . $player[1] . "," . $player[2]);
		$this->LogMsg("Sending to client #" . $clientId . ": " . json_encode($output));
		$this->wsSend($clientId, json_encode($output));
	}	
	
	
	public function ClientDisconnect ($clientId) {
		$this->LogMsg("Client #" . $clientId . " disconnected");
	}	
	
	
	
	public function ProcessData ($clientId, $data, $dataLength, $binary) {
		if ($dataLength < 0) {
			$this->wsClose($clientId);
			return;
		}
		
		if (preg_match("/\[\*MSG\*\]/", $data)) {
			$this->LogMsg("#" . $clientId . ": " . $data);
			foreach ($this->wsClients as $id => $client) {
				if ($id != $clientId)
					$this->wsSend($id, $data);
			}
		}
		elseif (preg_match("/\[\*MOV\*\]/", $data)) {
			$package 	= json_decode($data, true);
			$temp		= explode("||", substr($package["data"], 7));
			foreach ($temp as $v) {
				$tempA		= explode("=", $v);
				$player[$tempA[0]] = $tempA[1];
			}
			
			$this->LogMsg("#" . $clientId . ": Moving to " . $player["X"] . "," . $player["Y"]);
			foreach ($this->wsClients as $id => $client) {
				if ($id != $clientId)
					$this->wsSend($id, json_decode($data));
			}
		}
	}
	
	
	public function LogMsg ($message) {
		if ($this->logmode == (1 || 3)) {
			if ($this->logdate == 1)
				echo "[" . @date("m-d-Y H:i:s", time()) . "] ";
			
			echo $message . "\n";
		}
	}
	
	
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////
	////
	////	Bestehende Methoden überschreiben zwecks Steuerung
	////
	
	
	public function wsProcessClient($clientID, &$buffer, $bufferLength) {
		if ($this->wsClients[$clientID][2] == self::WS_READY_STATE_OPEN) {
			// handshake completed
			$result = $this->wsBuildClientFrame($clientID, $buffer, $bufferLength);
		}
		elseif ($this->wsClients[$clientID][2] == self::WS_READY_STATE_CONNECTING) {
			// handshake not completed
			$result = $this->wsProcessClientHandshake($clientID, $buffer);
			if ($result) {
				$this->wsClients[$clientID][2] = self::WS_READY_STATE_OPEN;

				$this->ClientConnect($clientID);
			}
		}
		else {
			// ready state is set to closed
			$result = false;
		}

		return $result;
	}
	
	
	
	function wsProcessClientMessage($clientID, $opcode, &$data, $dataLength) {
		// check opcodes
		if ($opcode == self::WS_OPCODE_PING) {
			// received ping message
			return $this->wsSendClientMessage($clientID, self::WS_OPCODE_PONG, $data);
		}
		elseif ($opcode == self::WS_OPCODE_PONG) {
			// received pong message (it's valid if the server did not send a ping request for this pong message)
			if ($this->wsClients[$clientID][4] !== false) {
				$this->wsClients[$clientID][4] = false;
			}
		}
		elseif ($opcode == self::WS_OPCODE_CLOSE) {
			// received close message
			if (substr($data, 1, 1) !== false) {
				$array = unpack('na', substr($data, 0, 2));
				$status = $array['a'];
			}
			else {
				$status = false;
			}

			if ($this->wsClients[$clientID][2] == self::WS_READY_STATE_CLOSING) {
				// the server already sent a close frame to the client, this is the client's close frame reply
				// (no need to send another close frame to the client)
				$this->wsClients[$clientID][2] = self::WS_READY_STATE_CLOSED;
			}
			else {
				// the server has not already sent a close frame to the client, send one now
				$this->wsSendClientClose($clientID, self::WS_STATUS_NORMAL_CLOSE);
			}

			$this->wsRemoveClient($clientID);
		}
		elseif ($opcode == self::WS_OPCODE_TEXT || $opcode == self::WS_OPCODE_BINARY) {
			$this->ProcessData($clientID, $data, $dataLength, $opcode == self::WS_OPCODE_BINARY);
		/*
			if ( array_key_exists('message', $this->wsOnEvents) )
				foreach ( $this->wsOnEvents['message'] as $func )
					$func($clientID, $data, $dataLength, $opcode == self::WS_OPCODE_BINARY);
		*/
		}
		else {
			// unknown opcode
			return false;
		}

		return true;
	}
	
	
	
	
	function wsRemoveClient($clientID) {
		// fetch close status (which could be false), and call wsOnClose
		$closeStatus = $this->wsClients[$clientID][5];
		$this->ClientDisconnect($clientID);

		// close socket
		$socket = $this->wsClients[$clientID][0];
		socket_close($socket);

		// decrease amount of clients connected on this client's IP
		$clientIP = $this->wsClients[$clientID][6];
		if ($this->wsClientIPCount[$clientIP] > 1) {
			$this->wsClientIPCount[$clientIP]--;
		}
		else {
			unset($this->wsClientIPCount[$clientIP]);
		}

		// decrease amount of clients connected
		$this->wsClientCount--;

		// remove socket and client data from arrays
		unset($this->wsRead[$clientID], $this->wsClients[$clientID]);
	}
}