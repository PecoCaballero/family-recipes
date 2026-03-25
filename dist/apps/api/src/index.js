"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Accept JSON request bodies.
app.use(express_1.default.json());
// In dev, allow the frontend to talk to this API.
// For production, prefer restricting `origin` via an env var.
app.use((0, cors_1.default)({
    origin: true,
    credentials: false,
}));
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use((_req, res) => {
    res.status(404).json({ error: 'not_found' });
});
const port = Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4001);
app.listen(port, () => {
    console.log(`[api] listening on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map