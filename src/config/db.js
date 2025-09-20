import mongoose from "mongoose";

export const connectDB = async () =>{

    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log("Database connected");
    } catch (error) {
        console.log("Error connecting to mongoDB", error.message);
    }
}

export default connectDB