require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionsBitField
} = require('discord.js');

const express = require("express");
const mongoose = require("mongoose");

const app = express();

/* ---------------- MONGODB CONNECTION ---------------- */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

/* ---------------- DISCORD CLIENT ---------------- */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* ---------------- SLASH COMMANDS ---------------- */

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all commands'),

  new SlashCommandBuilder()
    .setName('github')
    .setDescription('Show GitHub link'),

  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete messages (Moderator only)')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete')
        .setRequired(true)
    )
].map(command => command.toJSON());

/* ---------------- REGISTER COMMANDS ---------------- */

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('Slash commands registered successfully.');
  } catch (error) {
    console.error(error);
  }
})();

/* ---------------- BOT READY ---------------- */

client.once('clientReady', () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

/* ---------------- COMMAND HANDLER ---------------- */

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply(`🏓 Pong! ${client.ws.ping}ms`);
  }

  if (interaction.commandName === 'help') {
    await interaction.reply(`
📌 **DevForge Commands**

/ping - Check latency  
/help - Show commands  
/github - GitHub link  
/clear - Delete messages (mod only)
`);
  }

  if (interaction.commandName === 'github') {
    await interaction.reply('🔗 https://github.com/your-github-link');
  }

  if (interaction.commandName === 'clear') {

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({
        content: '❌ You need Manage Messages permission.',
        ephemeral: true
      });
    }

    const amount = interaction.options.getInteger('amount');

    if (amount > 100) {
      return interaction.reply({
        content: "❌ You can only delete up to 100 messages at once.",
        ephemeral: true
      });
    }

    await interaction.channel.bulkDelete(amount, true);

    await interaction.reply({
      content: `✅ Deleted ${amount} messages.`,
      ephemeral: true
    });
  }
});

/* ---------------- LOGIN ---------------- */

client.login(process.env.TOKEN);

/* ---------------- EXPRESS SERVER ---------------- */

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Web server is running.");
});