const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// IMPORT ROUTES
const studentRoutes = require("./routes/studentRoutes");
const groupRoutes = require("./routes/groupRoutes");
const profRoutes = require("./routes/profRoutes");
const periodeRoutes = require('./routes/periodeRoutes');
const salleRoutes = require('./routes/salleRoutes');
const tableauxRoutes = require('./routes/tableauxRoutes');
const authRoutes = require("./routes/authRoutes");
const semaineRoutes = require("./routes/semaineRoutes");
const matiereRoutes = require("./routes/matiereRoutes");
const emploiRoutes = require("./routes/emploiRoutes");
const seanceRoutes = require("./routes/seanceRoutes");
//const professeurRoutes = require("./routes/professeurRoutes");
// USE ROUTES
app.use("/groupes", groupRoutes);
app.use("/profs", profRoutes);
app.use("/students", studentRoutes);
app.use("/periodes", periodeRoutes);
app.use("/salles", salleRoutes);
app.use("/tableaux", tableauxRoutes);
app.use("/matieres", matiereRoutes);
app.use("/auth", authRoutes);
app.use("/semaines", semaineRoutes);
app.use("/emploi", emploiRoutes);
app.use("/seance", seanceRoutes);
//app.use("/professeur", professeurRoutes);   
// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong!",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
