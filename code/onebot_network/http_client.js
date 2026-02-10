import http from "http"
import Client from "./client.js";

class HTTPClient extends Client {
    constructor(url, token) {
        super(url);
        this.token = token;
    }
}

export default HTTPClient;