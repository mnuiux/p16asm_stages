// src/Controller.js
//

    const   Args = require('./modules/Args');


//  Each of the individual input files will be passed
//  to the Tokeniser module - this will break the
//  file into an array of lines which it will
//  return:
//
//      {
//          lines: []   // Array of tokenised lines
//      };
//
//  The returned array is sorted in a way that will
//  make assembling our input files a lot easier. Each
//  "line" in the array is really an array of token
//  strings.
//
//  For more information see the module:
//
//      src/modules/Tokeniser.js
//
    const   Tokeniser = require('./modules/Tokeniser');


    const Controller = () =>
    {

    //  We will record any error messages here.
        let     __errorMessage  = false;

    //  The Args module will return an object literal
    //  which is stored here.
        let     __args          = false;

    
    //  We will collect the _lines arrays returned by
    //  the Tokeniser here.
        let     __lines         = [];


    //  __tokeniseInputFiles()
    //
    //  This method will loop through all of our input
    //  files, tokenising each using the Tokeniser
    //  module.
    //
    //  Each instance of the Tokeniser will return an
    //  array of tokenised lines which we will push to
    //  the private __lines[] member defined above.
    //
        let     __tokeniseInputFiles = () =>
        {
            let totalLines = 0;

            process.stdout.write(`\n Tokenising input files...\n\n`);

            __args.fileName.forEach((fileName, fileIndex) => {
                let fileData = __args.fileData[fileIndex];

            //  Tokenise the file, we won't check for errors
            //  here, instead any errors will be collected
            //  and all reported at once.
                let tokens = Tokeniser(
                    fileName,
                    fileData,
                    __setError
                );

                let lines = tokens.lines;

                if (lines.length === 0)
                    return true;

                __lines.push(lines);
                totalLines += lines.length;

            //  We will always dump some basic output here,
            //  specifying what file was tokenised and how
            //  many lines were generated.
            //
            //  However, if verbose output is enabled we
            //  will also call the dump() method for each
            //  instance of the Tokeniser, this will dump 
            //  the entire table of lines and tokens so that
            //  we can see exactly what's happening to our
            //  input files.
                process.stdout.write(`  Tokenised file ${fileName} (${lines.length} total lines)\n`);
            
                if (__args.verbose)
                    tokens.dump();
            });

            process.stdout.write(`\n Generated ${totalLines} tokenised lines\n\n`)
        };

    
    //  __initialise()
    //
    //  We will call this in the module constructor so
    //  that it will only be called once when the object
    //  is first instantiated.
    //
        let     __initialise = () =>
        {
        //  The Args module expects a single parameter,
        //  a function/method for recording any errors.
            __args = Args(__setError);

        //  Error check, return here if _isError() returns
        //  non-false.
            if (_isError() !== false)
                return;

            __args.dump();

        //  Now we call the __tokeniseInputFiles() method,
        //  it will loop through and tokenise each of our
        //  input files.
            __tokeniseInputFiles();
    
            if (_isError() !== false)
                return;

            return;
        };


    //  __setError()
    //  
    //  Copies/appends errorMessage to the __errorMessage
    //  buffer--unless errorMessage is false in which
    //  case __errorMessage is reset.
    //
    //  This method always returns false.
    //
        let     __setError = (errorMessage = false) =>
        {
            if (errorMessage === false)
            //  Reset __errorMessage.
                __errorMessage = false;
            else {
                if (__errorMessage === false)
                    __errorMessage = errorMessage;
                else
                //  We can append new error messages,
                //  they will be separated by a newline.
                    __errorMessage += `\n${errorMessage}`
            }

            return false;
        };


    //  _isError()
    //
    //  Basically, it returns _errorMessage which will be
    //  false if there are no errors to report, so if
    //  _isError() returns non-false it return a string
    //  of one or more \n separated messages.
    //
    //  The reportError parameter is used to tell _isError()
    //  to report any errors--if reportError is true then
    //  any errors are dumped via console.error(). 
    //
        let     _isError = (reportError = false) =>
        {
        //  Dump anything? Both __errorMessage and reportError
        //  must be non-false.
            if (__errorMessage !== false && reportError !== false)
                    console.error(__errorMessage);

            return __errorMessage;
        };


    //  Initialise/constructor.
    //
        __initialise();


    //  Return any public members/methods.
    //
        return {
            isError:    _isError
        };

    };

    module.exports = Controller;
    
