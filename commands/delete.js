const { users } = require('../config.json');

module.exports = {
	name: 'delete',
	description: 'Delete up to 99 messages of less than 2 weeks old',
	aliases: ['del', 'prune', 'purge'],
	cooldown: 2,
	execute(message, args) {
		if (message.author.id !== users.zyrn) {
			return message.reply('you don\'t have permission to use that command.');
		}
		
		const amount = parseInt(args[0]) + 1;

		if (isNaN(amount)) {
			return message.reply('that doesn\'t seem to be a valid number.');
		} else if (amount < 1 || amount > 100) {
			return message.reply('you need to input a number between 1 and 99.');
		}

		message.channel.bulkDelete(amount, true).catch(err => {
			console.error(err);
			message.channel.send('There was an error trying to prune messages in this channel!');
		});
	},
};
