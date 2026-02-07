import Chat from "./chat.js";
import Bridge from "../../napcat_bridge.js";

class QQGroup extends Chat {
    constructor(id) {
        super();

        this.id = id;
    }

    async getGroupInfo() {
        await Bridge
    }
}

export default QQGroup;