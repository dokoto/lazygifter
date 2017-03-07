'use strict';

const util = require('util');
const fs = require('fs');
const _ = require('underscore');

class Misc {
    static random(min, max) {
        let low = Math.ceil(min);
        let high = Math.floor(max);

        return Math.floor(Math.random() * (high - low + 1)) + low;
    }

    static extratExtFromUrl(url) {
        try {
            let fileName = url.substr(url.lastIndexOf('/') + 1).split('?')[0];
            return fileName.substr(fileName.indexOf('.') + 1);
        } catch (error) {
            console.error(util.format('[LAZYGIFTER][MISC] %j', error));
            return 'jpg';
        }
    }

    static extratFileNameFromUrl(url) {
        try {
            return url.substr(url.lastIndexOf('/') + 1).split('?')[0];
        } catch (error) {
            console.error(util.format('[LAZYGIFTER][MISC] %j', error));
            return 'jpg';
        }
    }

    static recursiveAssign(tree, value, excludes) {
        excludes = excludes || [];
        if (typeof tree !== 'object') {
            throw new Error('"tree" param must be and object');
        }
        for (let key in tree) {
            if (Array.isArray(tree[key])) {
                continue;
            }
            if (typeof tree[key] === 'object') {
                Misc.recursiveAssign(tree[key], value, excludes);
            } else {
                if (excludes.indexOf(key) === -1) {
                    tree[key] = value;
                }
            }
        }
    }

    static isFalse(tree) {
        for (let key in tree) {
            if (typeof tree[key] === 'boolean' && tree[key]) return false;
        }
        return true;
    }

    static isTrue(tree) {
        for (let key in tree) {
            if (typeof tree[key] === 'boolean' && !tree[key]) return false;
        }
        return true;
    }

    static createHomeFolder(path) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }

    generateHtml(links) {
        console.log('[LAZYGIFTER][MISC] Generating html...');
        let tpl = fs.readFileSync('assets/templates/index.html', 'utf8');
        let tplCompiled = _.template(tpl);
        fs.writeFileSync('test/web/index.html', tplCompiled(links), 'utf8');
    }
}

module.exports = Misc;
