import app from "./app.js";
import { config } from "./utils/config.js";
import { logger } from "./utils/logger.js";

const { info } = logger();
const { PORT } = config();
app.listen(PORT, () => {
  info(`Server running on port ${PORT}`);
});
