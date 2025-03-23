import axios from "axios";
import { expect, test } from "bun:test";

axios.defaults.baseURL = "http://localhost:80";
axios.defaults.validateStatus = () => true;

test("Example test", () => {
    expect(true).toBe(true);
})