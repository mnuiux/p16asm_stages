// src/Controller.js
//
//  Some basic things to note:
//
//  Modules are always named using PascalCase.
//
//  Private member and method names are always camelCase
//  and will be prefixed with a double __underscore, public
//  member and method names are also camelCase but with a
//  single _underscore prefix.
//
//  The public object literal will only return _public
//  members and methods, revealing keys identical to
//  the member/method name minus the _prefix. So the
//  _isError() method is revealed:
//
//      return {
//          isError:    _isError
//      };
//
//  These conventions will be used for all of the modules
//  we write for this application.
//

    const Controller = () =>
    {

    //  We will record any error messages here.
        let     __errorMessage = false;

    
    //  __initialise()
    //
    //  We will call this in the module constructor so
    //  that it will only be called once when the object
    //  is first instantiated.
    //
    //  For now, we will just have it set an __errorMessage
    //  so that we can test that the p16asm.js application
    //  is properly reporting any errors.
    //
        let     __initialise = () =>
        {
            __setError('Controller error test');
        };


    //  __setError()
    //  
    //  Copies/appends errorMessage to the __errorMessage
    //  buffer--unless errorMessage is false in which
    //  case __errorMessage is reset.
    //
    //  This method always returns false, this allows
    //  other methods to simply do:
    //
    //      return __setError('something bad happened!');
    //
    //  Rather than:
    //
    //      __setError('Bad thing...');
    //      return false;
    //
    //  Note that this method will be passed to other
    //  modules so that they too may record any errors.
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
    //  any errors are dumped via console.error(). However,
    //  if reportError is an instance of a function it is
    //  assumed to be a stream (stdout, for example) and
    //  any __errorMessage is written to that stream.
    //
        let     _isError = (reportError = true) =>
        {
        //  Dump anyting? Both __errorMessage and reportError
        //  must be non-false.
            if (__errorMessage !== false && reportError !== false) {
                if (reportError instanceof Function)
                //  reportError is assumed to be an opened
                //  file stream.
                    reportError.write(__errorMessage);
                else
                    console.error(__errorMessage);
            }

            return __errorMessage;
        };


    //  Initialise/constructor.
    //
    //  This code will be executed when the object is first
    //  created. We will just call a private function here
    //  to initialise the module.
    //
        __initialise();


    //  Return any public members/methods. You can see in the
    //  p16asm.js file that we use the isError()
    //  method to check for and report any errors.
    //
        return {
            isError:    _isError
        };

    };

    module.exports = Controller;
    
