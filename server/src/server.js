import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => console.log(`My Learning OS API is running on http://localhost:${env.PORT}`));
