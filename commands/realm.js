const { users } = require('../config.json');
const request = require('request');
const { time_ago } = require('../time.js');
const Discord = require('discord.js');

module.exports = {
	name: 'realm',
	description: 'Get details on realm accounts',
	aliases: ['accounts', 'rotmg'],
	execute(message, args) {
		if (message.author.id !== users.zyrn) {
			return message.reply('you don\'t have permission to use that command.');
		}
        
        request({url: 'https://zyrn.dev/api/realm/refresh/recent'}, function (err, res, body) {
            if (err) {
                message.reply('something went wrong while processing your request.');
            } else {
                let accounts = JSON.parse(body).filter(account => {
                    return account.status != 'Success' || (account.time + (1000 * 60 * 60 * 6)) < Date.now();
                });

                if (accounts.length == 0) {
                    message.reply("all account are refreshing successfully.");
                }

                for (const account of accounts) {
                    let embed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Account #' + account.accountID)
                    .setURL('https://zyrn.dev/realm/accounts')
                    .addFields([
                        { name: 'GUID', value: account.guid, inline: true },
                        { name: 'Status', value: account.status, inline: true },
                        { name: 'Time', value: time_ago(account.time), inline: true },
                        { name: 'Message', value: account.message, inline: true },
                    ])
                    .setTimestamp()
                
                    message.channel.send(embed);
                }
            }
        });
        
		
        
	},
};
