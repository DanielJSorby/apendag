import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Message, User, initDB } from '$lib/db';

export const GET: RequestHandler = async () => {
	try {
		await initDB();

		const messages = await Message.findAll({
			include: {
				model: User,
				attributes: ['id', 'navn', 'email']
			},
			limit: 50
		});

		const formattedMessages = messages.map((msg: any) => ({
			id: msg.id,
			text: msg.melding,
			sender_name: msg.User?.navn || 'Unknown',
			brukerID: msg.brukerID,
			email: msg.User?.email || ''
		}));

		return json(formattedMessages);
	} catch (error) {
		console.error('Error fetching messages:', error);
		return json({ error: 'Error fetching messages' }, { status: 500 });
	}
};
