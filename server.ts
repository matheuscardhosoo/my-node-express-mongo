import app from "./src/app";
import connectDatabase from "./src/configs/mongodb";
import { SERVER_SETTINGS } from "./src/configs/settings";

app.listen(SERVER_SETTINGS.port, async () => {
    await connectDatabase();
    console.log(`Server running at http://localhost:${SERVER_SETTINGS.port}/`);
});
