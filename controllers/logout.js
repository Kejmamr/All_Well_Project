const logout = (req, res ) => {
    res.clearCookie("userRegistered");
    res.redirect("/log-out");
}

module.exports = logout;