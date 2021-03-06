const fs = require('fs');
const Discord = require('discord.js');
const { token, prefix, messages, emojis, roles } = require('./config.json');

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
});


client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (commandName === 'test') {
        return test(message, args);
    }

    if (!command) return;
    

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 1) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

function test(message, args) {
    message.channel.send("Yeah I work idiot. What? You thought I was badly programmed!?!");
}


client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
    }
    
    switch(reaction.message.id) {
        case messages.csgo:
            if (reaction.emoji.id === emojis.csgo) {
                reaction.message.guild.member(user).roles.add(roles.csgo);
            }
          break;
        case messages.rotmg:
            if (reaction.emoji.id === emojis.rotmg) {
                reaction.message.guild.member(user).roles.add(roles.rotmg);
            }
          break;
        case messages.programming:
            if (reaction.emoji.id === emojis.programming) {
                reaction.message.guild.member(user).roles.add(roles.programming);
            }
          break;
        default:
          // Do nothing
          break;
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
    }
    
    switch(reaction.message.id) {
        case messages.csgo:
            if (reaction.emoji.id === emojis.csgo) {
                reaction.message.guild.member(user).roles.remove(roles.csgo);
            }
          break;
        case messages.rotmg:
            if (reaction.emoji.id === emojis.rotmg) {
                reaction.message.guild.member(user).roles.remove(roles.rotmg);
            }
          break;
        case messages.programming:
            if (reaction.emoji.id === emojis.programming) {
                reaction.message.guild.member(user).roles.remove(roles.programming);
            }
          break;
        default:
          // Do nothing
          break;
    }
});

client.login(token);