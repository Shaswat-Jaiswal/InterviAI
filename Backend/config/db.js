import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    console.log(`Mongo Port: ${conn.connection.port}`);

    console.log(
      "Mongoose actual database:",
      mongoose.connection.db.databaseName
    );

    // Direct MongoDB check
    const testUser = await mongoose.connection.db
      .collection("users")
      .findOne({
        email: "shaswatjaiswal88699@gmail.com",
      });

    console.log("DIRECT MONGOOSE CHECK:", testUser);

  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;