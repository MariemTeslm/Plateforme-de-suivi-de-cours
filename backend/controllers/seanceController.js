const seanceModel = require("../models/seanceModel");

exports.updateSeance = (req, res) => {

    const id = req.params.id;
    const data = req.body;

    seanceModel.updateSeance(id, data, (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({
            message: "Séance modifiée"
        });
    });
};