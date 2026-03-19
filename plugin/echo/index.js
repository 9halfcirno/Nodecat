export default {
	main(cat) {
		cat.onCommand("echo").then((msg, args) => {
			msg.reply(args.join(" "))
		})
	}
}