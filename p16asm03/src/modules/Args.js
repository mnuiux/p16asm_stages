// src/modules/Args.js
//

//  We need the fs package to work with files.
//
    const   fs = require('fs');


//  The Args module requires a parameter, in this case
//  a function it can use to report any error we may
//  encounter.
//
//  The Controller module should pass a reference to
//  the __setError() method.
// 
    const Args = (
        reportError
    ) =>
    {

    //  This module will return the following:
    //
    //      fileName        This is an array containing
    //                      any input file names found
    //                      in the command line arguments.
    //
    //      fileData        For each fileName there will
    //                      be fileData, so if fileName[0]
    //                      is "file01.p16", fileData[0]
    //                      contains the data from the file
    //                      named "file01.p16" (assuming it
    //                      exists).
    //
    //      fileOut         Output file, this is where the
    //                      assembled bytecode is written.
    //
    //      verbose         This is a boolean, if set to
    //                      true our assembler will dump a
    //                      lot of info about the assembly
    //                      process, if false the assembler
    //                      will output less information
    //                      during the assembly.
    //
    //                      This is for us so that we can
    //                      see what's going on during the
    //                      assembly process.
    //
        let     _fileName           = [];
        let     _fileData           = [];
        
        let     _fileOut            = 'out.p16';

        let     _verbose            = false;


    //  __loadInputFile()
    //
    //  Will attempt to load the specified fileName from
    //  the file system, if the file doesn't exist this
    //  method will record an error message and bail.
    //
    //  If the file does exist it will be loaded and
    //  the file name and data will be pushed to the
    //  _fileName and _fileData arrays.
    //
        let     __loadInputFile = fileName =>
        {
        //  We want to ensure that the same file isn't
        //  included more than once, so we will first
        //  check _fileName to see if the file has already
        //  been included.
        //
        //  If it has, we will record an error message.
        //
            if (_fileName.indexOf(fileName) >= 0)
                reportError(`Error: Input file '${arg}' included multiple times`);

        //  Does the input file exist?
            if (fs.existsSync(fileName) === false)
                return reportError(`Error: Input file '${fileName}' could not be found`);

        //  The file exists, so we push the file name and
        //  data to the arrays.
            _fileName.push(fileName);
            _fileData.push(fs.readFileSync(fileName, { encoding: 'utf8' }));
        };


    //  __initialise()
    //
    //  All we need to do is loop through the command line
    //  arguments looking for input files. There are only
    //  two possible options available:
    //
    //      -o <file_name>      Specify an output file
    //                          other than the default
    //                          'out.p16' (the .p16
    //                          extension is optional).
    //
    //      -v                  Verbose mode - this tells
    //                          the assembler to dump more
    //                          information during the
    //                          build.
    //
    //  Anything else is assumed to be an input file name.
    //
        let     __initialise = () =>
        {
            let     argv = process.argv;

        //  argv[0] and [1] will be set to 'node' and
        //  'p16asm.js' so we skip those, our arguments
        //  really start in argv[2]:
            for (let argNo = 2; argNo < argv.length; argNo++) {
                let arg = argv[argNo];

                if (arg === '-v')
                //  Enable verbose output.
                    _verbose = true;
                else if (arg === "-o") {
                //  Specify an output file, this option requires
                //  a parameter.
                    if ((argNo + 1) === argv.length)
                        reportError(`Error: The ${arg} option requires a parameter`);
                    _fileOut = argv[++argNo];
                }
                else
                //  Anything else is assumed to be an input file
                //  to be assembled. The __loadInputFile() method
                //  will handle this, checking the file exists
                //  and hasn't already been included, etc.
                //
                    __loadInputFile(arg);
            }

        //  Before we return we need to ensure that at least 1
        //  input file was specified, if not then we have
        //  nothing to build and must generate an error
        //  message.
            if (_fileName.length === 0)
                return reportError(`Error: No input files!`);
        };


    //  _dump()
    //
    //  We can use this public method to dump some info before
    //  the build starts.
    //
        let     _dump = () =>
        {
            let     totalBytes = 0;

            process.stdout.write(`Dumping a list of ${_fileName.length} input files:\n\n`);

            _fileName.forEach((fileName, fileIndex) => {
                let     fileData = _fileData[fileIndex];
                let     fileSize = fileData.length;

                totalBytes += fileSize;

                process.stdout.write(` File ${fileName} (${fileSize} bytes)\n`);
            });

            process.stdout.write(`\nTotal input bytes: ${totalBytes}\n\n`);
            process.stdout.write(`Writing output file: ${_fileOut}\n`);
        };


    //  Initialise/constructor.
    //
        __initialise();


    //  Return any public members/methods.
    //
        return {
            fileName:       _fileName,
            fileData:       _fileData,
            verbose:        _verbose,

            dump:           _dump
        };

    };

    module.exports = Args;
    
