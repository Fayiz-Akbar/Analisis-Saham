import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { syncIdx80Constituents } from "./services/idx80SyncService.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Runtime: Node.js (JavaScript ES6+)`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);

  // Jalankan auto-sync konstituen IDX80 di background saat server aktif
  syncIdx80Constituents().then((res) => {
    if (res) {
      console.log(
        `📊 Konstituen IDX80 sinkron: ${res.totalIdx80} saham aktif (${res.totalActiveIdx || "-"} emiten BEI aktif)`
      );
    }
  });
});
