'use strict';

const timers = require('timers');
const pusage = require('pidusage');
const cluster = require('cluster');
const EventsEmiter = require('events');

class CpuUsage extends EventsEmiter {
    constructor(options) {
        super();
        options = options || {};
        this.timeInterval = options.timeInterval || 300;
        this.workers = {};

        this._totalWorkers = {};
        this._timeout = null;

        this._initWorkers();
    }

    _initWorkers() {
        this._totalWorkers = cluster.workers.length;
        for (const worker in cluster.workers) {
            this.workers[cluster.workers[worker].process.pid] = {
                'stat': {
                    cpu: 0
                },
                'process': cluster.workers[worker].process
            };
        }
    }

    start() {
        this._totalWorkers = Object.keys(cluster.workers).length;
        for (const worker in cluster.workers) {
            pusage.stat(cluster.workers[worker].process.pid, this._handleCpuUsage.bind(this, cluster.workers[worker], Object.keys(cluster.workers).indexOf(worker)));
        }
    }

    _handleCpuUsage(worker, index, err, stat) {
        this._totalWorkers--;
        console.debug('[LAZYGIFTER][CPU-USAGE][%d][%d] Process %d at cpu %d', this._totalWorkers, index, worker.process.pid, stat.cpu);
        this.workers[worker.process.pid] = {
            'stat': stat,
            'process': worker.process
        };
        if (this._totalWorkers === 0) {
            //console.debug('[LAZYGIFTER][CPU-USAGE] Setting new timer at %d', this.timeInterval);
            this._timeout = timers.setTimeout(this.start.bind(this), this.timeInterval);
        }
    }

    getLowerLoadWorker() {
        let workerLowLoad = this.workers[Object.keys(this.workers)[0]];
        for (const worker in this.workers) {
            workerLowLoad = (workerLowLoad.stat.cpu > this.workers[worker].stat.cpu) ? this.workers[worker] : workerLowLoad;
        }

        console.debug('[LAZYGIFTER][CPU-USAGE] Lower worker is %d at cpu %d', workerLowLoad.process.pid, workerLowLoad.stat.cpu);
        return workerLowLoad;
    }

    stop() {
        timers.clearTimeout(this._timeout);
    }
}

module.exports = CpuUsage;
