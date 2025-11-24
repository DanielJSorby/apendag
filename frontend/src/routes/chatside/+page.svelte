<script lang="ts">
	import { onMount } from 'svelte';

	let messages = $state<any[]>([]);
	let newMessage = $state('');
	let brukerID = $state('');
	let userName = $state('');
	let isConnected = $state(false);

	onMount(() => {
		// Load existing messages
		loadMessages();

		// Start polling for new messages
		startPolling();
		isConnected = true;

		return () => {
			if (pollInterval) {
				clearInterval(pollInterval);
			}
		};
	});

	async function loadMessages() {
		try {
			const response = await fetch('/api/messages/get');
			if (response.ok) {
				messages = await response.json();
			}
		} catch (error) {
			console.error('Error loading messages:', error);
		}
	}

	// Poll for new messages every 3 seconds (since we removed WebSocket)
	let pollInterval: any;

	function startPolling() {
		pollInterval = setInterval(async () => {
			await loadMessages();
		}, 3000);
	}

	async function sendMessage() {
		if (!newMessage.trim() || !userName.trim()) return;

		try {
			const response = await fetch('/api/messages/post', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					text: newMessage,
					brukerID: brukerID
				})
			});

			if (response.ok) {
				const data = await response.json();
				// Add message to local list
				messages = [...messages, { ...data, sender_name: userName }];
				newMessage = '';
			} else {
				// If user doesn't exist, we need to handle it
				console.error('Error sending message');
				alert('Could not send message. Make sure your user exists in the database.');
			}
		} catch (error) {
			console.error('Error sending message:', error);
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}
</script>

<div class="chat-container">
	<div class="chat-header">
		<h1>Chat</h1>
		<div class="connection-status" class:connected={isConnected}>
			{isConnected ? '🟢 Connected' : '🔴 Disconnected'}
		</div>
	</div>

	<div class="user-input">
		<input
			type="text"
			bind:value={userName}
			placeholder="Enter your name"
			class="name-input"
		/>
		<input
			type="text"
			bind:value={brukerID}
			placeholder="Enter your user ID (e.g., user_test123)"
			class="name-input"
		/>
	</div>

	<div class="messages-container">
		{#each messages as message}
			<div class="message" class:own-message={message.brukerID === brukerID}>
				<div class="message-header">
					<span class="sender-name">{message.sender_name || message.username}</span>
				</div>
				<div class="message-text">{message.text}</div>
			</div>
		{/each}
	</div>

	<div class="input-container">
		<input
			type="text"
			bind:value={newMessage}
			onkeypress={handleKeyPress}
			placeholder="Type a message..."
			class="message-input"
			disabled={!userName.trim() || !brukerID.trim()}
		/>
		<button onclick={sendMessage} disabled={!newMessage.trim() || !userName.trim() || !brukerID.trim()}>
			Send
		</button>
	</div>
</div>

<style>
	.chat-container {
		max-width: 800px;
		margin: 0 auto;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: var(--color-white);
	}

	.chat-header {
		padding: 20px;
		background-color: var(--color-pink);
		color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.chat-header h1 {
		margin: 0;
		font-size: 1.5rem;
	}

	.connection-status {
		font-size: 0.9rem;
		opacity: 0.8;
	}

	.connection-status.connected {
		opacity: 1;
	}

	.user-input {
		padding: 15px 20px;
		background-color: #f5f5f5;
		display: flex;
		gap: 10px;
		align-items: center;
		border-bottom: 2px solid var(--color-pink);
	}

	.name-input {
		flex: 1;
		padding: 10px;
		border: 2px solid var(--color-pink);
		border-radius: 5px;
		font-size: 1rem;
		font-family: 'Oslo Sans', sans-serif;
	}

	.messages-container {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 15px;
		background-color: #fafafa;
	}

	.message {
		max-width: 70%;
		padding: 12px 16px;
		border-radius: 12px;
		background-color: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		align-self: flex-start;
	}

	.message.own-message {
		align-self: flex-end;
		background-color: var(--color-pink);
		color: white;
	}

	.message-header {
		margin-bottom: 5px;
	}

	.sender-name {
		font-weight: 600;
		font-size: 0.9rem;
	}

	.message.own-message .sender-name {
		color: rgba(255, 255, 255, 0.9);
	}

	.message-text {
		word-wrap: break-word;
		line-height: 1.4;
	}

	.input-container {
		padding: 20px;
		background-color: white;
		border-top: 1px solid #ddd;
		display: flex;
		gap: 10px;
	}

	.message-input {
		flex: 1;
		padding: 12px;
		border: 2px solid var(--color-pink);
		border-radius: 8px;
		font-size: 1rem;
		font-family: 'Oslo Sans', sans-serif;
	}

	.message-input:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
	}

	button {
		padding: 12px 24px;
		background-color: var(--color-pink);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.2s;
		font-family: 'Oslo Sans', sans-serif;
	}

	button:hover:not(:disabled) {
		background-color: var(--color-blue);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.chat-container {
			max-width: 100%;
		}

		.message {
			max-width: 85%;
		}

		.chat-header h1 {
			font-size: 1.2rem;
		}
	}
</style>
