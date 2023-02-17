const indexCtrl = {};
//controladores que renderizan distintas vistas
indexCtrl.renderIndex = (req, res) => {
    res.render('index')
};

indexCtrl.renderAbout = (req, res) => {
    res.render('about')
};

module.exports = indexCtrl;