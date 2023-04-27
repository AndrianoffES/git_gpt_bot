
import {Telegraf, session} from 'telegraf'
import config from 'config'
import {message} from "telegraf/filters"
import {code} from 'telegraf/format'
import {ogg} from './oggToMp3.js'
import {openAi} from "./openAi.js"

console.log(config.get('TEST_ENV'))

const INITIAL_SESSION = {
    messages: []
}
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())
bot.command('new', async (ctx)=>{
    ctx.session = INITIAL_SESSION
    await ctx.reply('Жду сообщение')
})
bot.command('start', async (ctx)=>{
    ctx.session = INITIAL_SESSION
    await ctx.reply('Жду сообщение')
})

bot.on(message('voice'), async (ctx)=>{
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('принял, жду ответ сервера'))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)
        //console.log(link.href)
        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)
        const text = await openAi.transcription(mp3Path)
        await ctx.reply(code(`Твой запрос: ${text}`))
        ctx.session.messages.push({
            role:openAi.roles.USER,
            content:text})
        const response = await openAi.chat(ctx.session.messages)
        ctx.session.messages.push({
            role:openAi.roles.ASSISTANT,
            content:response.content})

        await ctx.reply(response.content)
       // await ctx.reply(JSON.stringify(link, null, 2))
    } catch (e){
        console.log('Error while voice message', e.message)
    }


})
bot.on(message('text'), async(ctx)=>{
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('принял, жду ответ сервера'))
        ctx.session.messages.push({
            role:openAi.roles.USER,
            content:ctx.message.text})
        const response = await openAi.chat(ctx.session.messages)
        ctx.session.messages.push({
            role:openAi.roles.ASSISTANT,
            content:response.content})

        await ctx.reply(response.content)
        // await ctx.reply(JSON.stringify(link, null, 2))
    } catch (e){
        console.log('Error while voice message', e.message)
    }


})



bot.launch();

process.once('SIGINT', ()=> bot.stop('SIGINT'))
process.once('SIGTERM', ()=> bot.stop('SIGTERM'))