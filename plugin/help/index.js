export default {
    id: "built-in-help",

    main(cat) {
        const context = cat.context;
        cat.onCommand("help").then(async (msg, args) => {
            const ctxs = context.manager.pluginLoaded.values();
            let helpList = [];
            for (const ctx of ctxs) {
                if (ctx.plugin.help) {
                    helpList.push(ctx.plugin.help);
                }
            }
            
            let help = null;
            let item = args[0];
            if (item) {
                if (parseInt(item)) {
                    item = helpList[parseInt(item) - 1]?.title;
                }
                help = helpList.find(h => h.title === item);
                if (help) {
                    return msg.reply(`帮助 - ${help.title}\n${help.content}`)
                } else {
                    return msg.reply(`未找到帮助 - ${item}`)
                }
            } else {
                let reply = `Nodecat帮助列表:\n(请通过"/help [项目]"来查看具体帮助哦)`;
                for (let i = 0; i < helpList.length; i++) {
                    reply += `\n${i + 1}. ${helpList[i].title}`;
                }
                msg.reply(reply);
            }
        })
    }
}