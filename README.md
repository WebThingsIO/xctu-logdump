# xctu-logdump
Parses an XCTU log file

This uses node.js and assumes you have node and npm installed.

# Dependencies

The following node modules need to be installed:
```
npm install express node-getopt
```

# To use

```
node ./logdump.js xctu.log
```

I captured the startup log that XCTU sends to the XSTICK and also checked in that
log. The output from logdump looks something like:
```
Processing xctu.log
SENT AT Command  Frame 1 ID
RECV AT Response Frame 1 ID <Buffer 00 00 00 00 00 00 00 00>
SENT AT Command  Frame 2 SC
RECV AT Response Frame 2 SC <Buffer 00 ff>
SENT AT Command  Frame 3 SD
RECV AT Response Frame 3 SD <Buffer 00>
SENT AT Command  Frame 4 ZS
RECV AT Response Frame 4 ZS <Buffer 00>
```
