#!/usr/bin/env node

'use strict';

const GetOpt = require('node-getopt');
var getopt = new GetOpt([
  ['h', 'help',             'Display help' ],
  ['v', 'verbose',          'Show verbose output' ],
]);
getopt.setHelp('Usage: node logdump.js [OPTION] logfile ...\n\n' +
               'XCTU Log Parser\n\n' + 
               '[[OPTIONS]]');
var opt = getopt.bindHelp()
                .parseSystem();

if (opt.options.verbose) {
    console.info(opt);
}

if (opt.options.help) {
    getopt.showHelp();
    process.exit(1);
}

if (opt.argv.length < 1) {
    console.error('No logfile specified')
    console.log('');
    getopt.showHelp();
    process.exit(1);
}

const readline = require('readline');
const fs = require('fs');

var cmd = {
    0x08: 'AT Command',
    0x09: 'AT Command - Queue Value',
    0x10: 'ZigBes Tx Req',
    0x11: 'Explicit Addressing ZB Cmd',
    0x17: 'Remote',
    0x21: 'Create Source Route',
    0x88: 'AT Response',
    0x8A: 'Modem Status',
    0x8B: 'ZigBee Tx Status',
    0x90: 'ZigBee Rx Packet',
    0x91: 'ZigBee Explicit Rx Indicator',
    0x92: 'ZigBee IO Data Sample Rx Indicator',
    0x94: 'XBee Sensor Read Indicator',
    0x95: 'Node Identification Indicator',
    0x97: 'Remote Command Response',
    0xA0: 'OTA Update Status',
    0xA1: 'Route Record Indicator',
    0xA2: 'Many-to-One Route Request Indicator',
};

function toHex(d) {
    return  ("0"+(Number(d).toString(16))).slice(-2);
}

function dump_line(line) {
    if (!line) {
        return;
    }
    if (opt.options.verbose) {
        console.log('Line from file:', line);
    }
    var timestamp, line_num, dir, hex_data;
    [timestamp, line_num, dir, hex_data] = line.split(',')
    var buf = Buffer.from(hex_data, 'hex')
    if (buf[0] != 0x7e) {
        console.error('Invalid Frame:', buf);
        return;
    }
    var len = (buf[1] << 8) + buf[2];
    var cmdId = buf[3];
    var cmdData = buf.slice(4, len + 3);
    var checksum = buf[buf.length - 1];

    var sum = cmdId + checksum;
    for (var data of cmdData) {
        sum += data;
    }
    if (sum & 0xff != 0xff) {
        console.error('Checksum invalid:', buf);
        return;
    }

    if (cmdId == 0x08) {
        var frameId = cmdData[0];
        var atCmd = cmdData.slice(1, 3).toString('utf8');
        var atData = cmdData.slice(3, cmdData.length - 1);
        if (atData.length) {
            console.log(dir, 'AT Command  Frame', frameId, atCmd, atData);
        } else {
            console.log(dir, 'AT Command  Frame', frameId, atCmd);
        }
    } else if (cmdId == 0x88) {
        var frameId = cmdData[0];
        var atCmd = cmdData.slice(1, 3).toString('utf8');
        var atData = cmdData.slice(3, cmdData.length - 1);
        if (atData.length) {
            console.log(dir, 'AT Response Frame', frameId, atCmd, atData);
        } else {
            console.log(dir, 'AT Response Frame', frameId, atCmd);
        }
    } else {
        if (cmdId in cmd) {
            console.log(dir, 'Cmd:', toHex(cmdId), cmd[cmdId], cmdData);
        } else {
            console.log(dir, 'Cmd:', toHex(cmdId), '???', cmdData);
        }
    }

    //console.log(dir, 'len =', len, 'data =', cmdData, 'buf =', buf);
}


for (var logfile of opt.argv) {
    console.log('Processing ' + logfile);

    const rl = readline.createInterface({
        input: fs.createReadStream(logfile)
    });

    rl.on('line', function (line) {
        dump_line(line);
    });
}
