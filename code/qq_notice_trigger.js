import {
	Trigger
} from "./qq_message_trigger.js";

class NoticeTrigger extends Trigger {
	constructor({
		notice_type,
		sub_type
	}) {
		super(data => {
			if (data.post_type === "notice") {
				
			} else {
				return false;
			}
		})
	}
}