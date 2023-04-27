import {Configuration, OpenAIApi} from 'openai'
import config from "config"
import {createReadStream} from 'fs'
class OpenAi{
    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system'
    }
    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey,
        });
         this.openai = new OpenAIApi(configuration);
    }
   async chat(messages){
        try {
          const response = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages,

            })
            return response.data.choices[0].message
        }catch (e){
            console.log('GPT chat error', e.message)
        }
    }

    async transcription(filepath){
        try {
            const file = createReadStream(filepath)
            const response = await this.openai.createTranscription(file, 'whisper-1')
            return response.data.text
        }catch (e){
            console.log('AI transcription error', e.message)
        }
    }
}

export const openAi = new OpenAi(config.get('OPENAI_KEY'))