import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔐 Auth API at http://localhost:${PORT}/api/auth`);
  console.log(`📖 OpenAPI docs at http://localhost:${PORT}/api/auth/reference`);
});
