const _max_seq = 8000;
const Long = require('long');
const BufferPack = require('bufferpack');
const ip = require('ip');
const localIp = ip.address();
const ipInt = ipToInt(localIp);

class TraceId {
    constructor() {
        this.seq = 0;
        this.pid = process.pid;
    }

    generate() {
        this.seq = this.seq % _max_seq + 1;
        const num = Long.fromNumber(Date.now(), true);
        let traceId = Buffer.concat([
            BufferPack.pack('>H', [this.seq]),
            BufferPack.pack('>LL', [num.getHighBitsUnsigned(), num.getLowBitsUnsigned()]),
            BufferPack.pack('>L', [ipInt]),
            BufferPack.pack('>H', [this.pid]),
        ], 16).toString('hex');
        
        return traceId;
    }
}

function ipToInt(ip) {
    const result = ip.split('.');
    result.reverse();
    return result.map((octet, index, array) => {
        return parseInt(octet) * Math.pow(256, (array.length - index - 1));
    }).reduce((prev, curr) => {
        return prev + curr;
    });
}


module.exports = TraceId;
