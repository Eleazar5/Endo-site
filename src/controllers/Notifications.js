// Validation URL
exports.getNotification = (req, res) => {
    const resObject = {
        ResultDesc:"Confirmation Service request accepted successfully",
        ResultCode:"0"
    };
    res.send(resObject);
};