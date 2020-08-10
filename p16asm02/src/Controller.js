// src/Controller.js
//

//  We will import a module to handle processing
//  the command line arguments. This module will
//  also load any input files.
//
//  If all goes well it will return an object
//  literal that gives us access to an array of
//  input files and data, and some other useful
//  info, see:
//
//      src/modules/Args.js
//
//  For more info.
//
    const   Args = require('./modules/Args');


    const Controller = () =>
    {

    //  We will record any error messages here.
        let     __errorMessage  = false;

    //  The Args module will return an object literal
    //  which is stored here.
        let     __args          = false;

    
    //  __initialise()
    //
    //  We will call this in the module constructor so
    //  that it will only be called once when the object
    //  is first instantiated.
    //
    //  We will instantiate the Args module here, this
    //  will process command line arguments and load any
    //  input files.
    //
        let     __initialise = () =>
        {
        //  The Args module expects a single parameter,
        //  a function/method for recording any errors.
            __args = Args(__setError);

        //  Error check, return here is _isError() returns
        //  non-false.
            if (_isError() !== false)
                return;

        //  If we get to this point we know the Args 
        //  module didn't encounter any errors and we
        //  can proceed with processing and sorting the
        //  inpur files...we'll do that in part 4.
        //
        //  For now we'll just get a dump of input
        //  parameters.
            __args.dump();
        
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
    
