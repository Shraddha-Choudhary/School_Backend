const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const {dbConnect} = require('./config/db');
const galleryRoutes = require("./routes/galleryRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes"); 
const admissionRoutes = require("./routes/admissionRoutes");
const authRoutes = require("./routes/authRoutes");
const careerRoutes = require("./routes/careerRoutes");
dotenv.config();


//middleware
// app.use(cors({origin:"http://localhost:3000"}));
app.use(
  cors({
    origin:
      process.env.CLIENT_URL || "https://webschoolmanagement.netlify.app/",
  })
);
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// ✅ Serve static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//db connection
dbConnect();
// ✅ Routes
app.use("/api", authRoutes);
app.use("/api", galleryRoutes);
app.use("/api", enquiryRoutes); 
app.use("/api", admissionRoutes); 
app.use("/api", careerRoutes);

const PORT = process.env.PORT;
app.listen(PORT,()=>{
  console.log("server running on port:", PORT);
})

