const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://jimfleax:ilovetolearndsawithpython@cluster0.0fsrp8l.mongodb.net/dsa-preparation?retryWrites=true&w=majority",
  )
  .then(async () => {
    const tracks = await mongoose.connection.db
      .collection("tracks")
      .find()
      .sort({ order: 1 })
      .toArray();
    for (const t of tracks) {
      if (t.parts && t.parts.length > 0) {
        console.log("Track:", t.title);
        t.parts.forEach((p) => console.log("  Part:", p.title));
      }
    }
    process.exit(0);
  });
