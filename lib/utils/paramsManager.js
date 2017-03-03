'use strict';


class ParamsManager {
    constructor() {
        this.rawParams = process.argv;
    }

    get() {
        return {};
    }

}


module.exports = ParamsManager;
