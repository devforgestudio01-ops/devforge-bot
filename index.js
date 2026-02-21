const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.find(c => c.name === 'welcome');
  if (channel) {
    channel.send(`🔥 Welcome to DevForge Studio, ${member}!`);
  }
});

client.login(process.env.TOKEN);