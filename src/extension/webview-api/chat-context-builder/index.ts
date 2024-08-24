import { ChatContextBuilder } from './chat-context-builder'
import { PluginManager } from './plugin-manager'
import { CodeChunksPlugin } from './plugins/code-chunks.plugin'
import { ConversationPlugin } from './plugins/conversation.plugin'
import { CurrentFilePlugin } from './plugins/current-file.plugin'
import { ExplicitContextPlugin } from './plugins/explicit-context.plugin'
import { GitPlugin } from './plugins/git.plugin'

export const createChatContextBuilder =
  async (): Promise<ChatContextBuilder> => {
    const pluginManager = new PluginManager()
    await pluginManager.registerPlugin(new CurrentFilePlugin())
    await pluginManager.registerPlugin(new ConversationPlugin())
    await pluginManager.registerPlugin(new CodeChunksPlugin())
    await pluginManager.registerPlugin(new ExplicitContextPlugin())
    await pluginManager.registerPlugin(new GitPlugin())

    const chatContextBuilder = new ChatContextBuilder(pluginManager)

    return chatContextBuilder
  }
