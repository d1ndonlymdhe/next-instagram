const fs = require("fs");

fs.unlink("../../test", (err) => { console.log(err) })