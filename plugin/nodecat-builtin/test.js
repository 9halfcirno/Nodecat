export default {
	id: "built-in-test",
	enable: false,
	main(cat) {
		cat.onMessage.all().then(async msg => {
			console.log(`${msg.sender.id}: ${msg.sender.role}`)
		})
	}
}