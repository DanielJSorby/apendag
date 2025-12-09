import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Message, User, initDB } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	try {
		await initDB();

		const { text, brukerID } = await request.json();
		const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Check if user exists
		const user = await User.findOne({ where: { id: brukerID } });

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Create message
		const message = await Message.create({
			id: messageId,
			melding: text,
			brukerID
		});

		return json(
			{
				id: (message as any).id,
				text: (message as any).melding,
				sender_name: (user as any).navn,
				brukerID: (message as any).brukerID
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error saving message:', error);
		return json({ error: 'Error saving message' }, { status: 500 });
	}
};
