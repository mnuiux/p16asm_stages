// src/modules/Tokeniser.js
//

///////////////////////////////////////////////////////////
//
//  Let's take 5 minutes to go over what the Tokeniser
//  is actually doing, it's not a complex module. 
//
///////////////////////////////////////////////////////////
//
//  The Tokeniser module will take 3 inputs:
//
//      fileName        A string containing the name of
//                      the file being tokenised.
//
//      fileData        The data to be tokenised.
//
//      reportError     Reference to the Controllers
//                      __setError() method.
//
//  The job of the tokeniser is to take the fileData
//  and produce an array of tokenised lines.
//
///////////////////////////////////////////////////////////
//
//  What is a token?
//
//  It's best with a simple example, imagine a single
//  line from an input file like this:
//
//      Here is a "line of code!"
//
//  If we tokenise the above line we will get 4 tokens:
//
//      token[0] = Here
//      token[1] = is
//      token[2] = a
//      token[3] = "line of code!"
//
//  The tokeniser will break the input string at any
//  white space character unless it's quoted, in which
//  case white space preserved.
//
//  By white space I'm referring to either a space, tab
//  or newline.
//
///////////////////////////////////////////////////////////
//
//  Single-character tokens
//
//  Some tokens are 'single-character' tokens, for example
//  the [ and ] characters are a single-character tokens.
//  Take the following line for example:
//
//      thhiiissss[iss]aaa"line of code"
//
//  Would yield 6 tokens:
//
//      token[0] = thhiiissss
//      token[1] = [
//      token[2] = iss
//      token[3] = ]
//      token[4] = aaa
//      token[5] = "line of code"
//
//  Unquoted character sequences are broken at any white
//  space or single character or string token.
//  
//  The tokeniser will return the _lines[] array, where
//  each element is an array of tokens for a particular
//  line of the fileData. So if our file has 3 "lines"
//  then the _lines[] array will contain 3 arrays of
//  tokens.
//
///////////////////////////////////////////////////////////
//
//  File names and line numbers
//
//  Note that for every line we tokenise we will add two
//  tokens to the start of the tokenised line. For example,
//  if we pass in a file named "file.p16a" then each
//  tokenised "line" of tokens will contain:
//
//      token[0] = file.p16a
//      token[1] = <line_number>
//
//  Where <line_number> is the individual line number
//  that the tokenised line appeared in the fileData.
//  The reason for this is we're going to be merging
//  sections and input files and need to be able to
//  track each line for the purposes of error reporting.
//
//  An important note about this...imagine this input
//  file:
//
//      // example.p16a
//      //
//      
//      section code
//          A line "of
//          code"
//
//  This means the the line of code actually spans two
//  lines, since the "quotes" preserve any whitespace
//  including newlines.
//
///////////////////////////////////////////////////////////
//
//  Error handling
//
//  What if we forget to close the string:
//
//          A line "of
//          code
//
//  What's the problem here? We have an unterminated
//  quoted string on line 6. But what line is the "error"
//  actually on?
//
//      1: // example.p16a
//      2: //
//      3: 
//      4: section code
//      5:    A line "of
//      6:    code
//
//  The missing quote should be on line 6, If we want to
//  report this error, however, we should state that the
//  error is on line 5 since that's the line on which
//  the quoted string actually opens.
//
//  So we need to know what line number the current line
//  starts on as well as track any newlines within the
//  current line. This is important, the broken line of
//  code from the above example when fixed would actually
//  yield 5 tokens:
//
//      token[0] = example.p16a     // file name
//      token[1] = 5                // line number
//      token[2] = A
//      token[3] = line
//      token[4] = "of
//                  code"
//
//  We need to make sure that the newline within token 4
//  doesn't result in a token[1] being set to 6! 
//
//  This might seem weird, and I'm sure there are millions
//  of other ways of doing this, some more efficient. But
//  it'll make sense once we actually tokenise some input
//  files and inspect the results, it  makes translating
//  our assembly instructions into bytecode a lot easier.
//
//  Note that an unterminated quoted string is the only
//  error that the Tokeniser will report.
//
    const   Tokeniser = (
        fileName,
        fileData,
        reportError
    ) =>
    {

    //  We will treat the fileData as a stream of bytes,
    //  iteracting over them until we reach the end.
    //
    //  We will do this the traditional way using a
    //  standard loop and a counter since we may need to
    //  do some back-tracking.
        let     __byteNo            = 0;

    //  We will read each token into __inputToken one
    //  byte at a time. When a token is terminated it
    //  will then be pushed to the __inputTokens array
    //  and the _inputToken buffer will be cleared
    //  for the next input token.
        let     __inputToken        = '';
        let     __inputTokens       = [];

    //  Any time we open a quoted string we will store
    //  the opening quote character here. If this is
    //  non-false it means we are reading in a quoted
    //  string token.
        let     __quoteChar         = false;

    //  As mentioned previously we need to track the
    //  line number as well as any newlines within
    //  quoted tokens.
    //
    //  __codeLine stores the opening line number for
    //  the current input line, __actualLine will be used
    //  to track any newlines embedded within a string
    //  token.
        let     __codeLine          = 1;
        let     __actualLine        = 1;

    //  The _lines array, this is the public array of
    //  tokenised lines that's returned to the caller.
        let     _lines              = [];


    //  __isSpaceChar()
    //
    //  Will return true if inputChar matches any
    //  white space character (except \n), otherwise
    //  returns false.
    //
        let     __isSpaceChar = inputChar =>
        {
            let     legalChars = [
                ' ', '\t'
            ];

            if (legalChars.indexOf(inputChar) >= 0)
                return true;

            return false;
        };


    //  __isSingleChar()
    //
    //  Will return true if inputChar is a single-
    //  character token, otherwise returns false.
    //
        let     __isSingleChar = inputChar =>
        {
            let     legalChars = [
                ',', ';', ':', '[', ']', '{', '}', '(', ')',
                '+', '-', '/', '*', '=', '_', '^', '%', '$'
            ];

            if (legalChars.indexOf(inputChar) >= 0)
                return true;

            return false;
        };


    //  __isQuoteChar()
    //
    //  Will return true if inputChar matches any
    //  any quote character, otherwise returns false.
    //
        let     __isQuoteChar = inputChar =>
        {
            let     legalChars = [ 
                '"', "'", '`'
            ];

            if (legalChars.indexOf(inputChar) >= 0)
                return true;

            return false;
        };


    //  __addTokenisedLine()
    //
    //  Will push the __inputTokens to the _lines
    //  array, will then clear the __inputToken and
    //  __inputTokens for the next line of input.
    //
        let     __addTokenisedLine = () =>
        {
        //  First, we want to make sure we actually
        //  have some tokens to add...
            if (__inputTokens.length)
            //  ...before we add them.
                _lines.push(__inputTokens);

        //  Since the current input line has ended we can
        //  sync up __codeLine and __actualLine.
            __codeLine = __actualLine;

            __inputTokens = [];
            __inputToken = '';
        };


    //  __addLineToken()
    //
    //  Will push the current __inputToken string to
    //  the __inputTokens array then clear it for the
    //  next input token.
    //
        let     __addLineToken = () =>
        {
        //  First, make sure the __inputToken isn't empty.
        //  
            __inputToken = __inputToken.trim();
            
            if (__inputToken !== '') {
            //  Now, if this is the first token being added for
            //  this line then we must first add the file name
            //  and line number tokens before we push the next
            //  input token.
                if (__inputTokens.length === 0) {
                    __inputTokens.push(fileName);
                    __inputTokens.push(__codeLine);
                }

                __inputTokens.push(__inputToken);
            }

            __inputToken = '';
        };


    //  __nextInputChar()
    //
    //  Returns the next byte from the fileData and
    //  increases the __byteNo.
    //
    //  If __byteNo is > fileData.length an empty token
    //  is returned.
    //
        let     __nextInputChar = () =>
        {
            if (__byteNo >= fileData.length)
                return '';

            return fileData.substr(__byteNo++, 1);
        };


    //  __getStringToken()
    //
    //  Get the next string token from the fileData.
    //
    //  The inputChar should be the opening quote character,
    //  this will be copied to the resulting __inputToken
    //  as well as any closing quote character.
        let     __getStringToken = inputChar =>
        {
            __quoteChar = __inputToken = inputChar;

        //  We just collect each input byte in __inputToken
        //  until we find the matching quote character or
        //  reach the end of the fileData stream.
            while (__byteNo < fileData.length) {
                let nextChar = __nextInputChar();

            //  We will remember the previous character,
            //  this will allow us to create strings that
            //  contain escaped quotes.
                let lastChar = '';

            //  Any newlines need to be counted here, 
            //  we count them in __actualLine, as __codeLine
            //  should always point to the line number the
            //  line of code starts on.
                if (nextChar === "\n") 
                    __actualLine++;
                    
                if (nextChar === __quoteChar && lastChar !== '\\') {
                //  We found the terminating quote
                //  character.
                    __inputToken += nextChar;
                    __quoteChar = false;
                    break;
                }

                __inputToken += nextChar;
                lastChar = nextChar;
            }
            
        //  If we get to here and __quoteChar is not
        //  false we have an unterminated quoted
        //  string token.
        //
            if (__quoteChar !== false)
                return reportError(`Error in file ${fileName} on line ${__codeLine}: Unterminated quoted string`);
        };


    //  __getCharacterToken()
    //
    //  Returns an unquoted character string token.
    //
    //  This is basically any sequence of characters
    //  delimited by any white space, quoted string or
    //  single-character token.
    //
        let     __getCharacterToken = inputChar =>
        {
            __inputToken = inputChar;

            while (__byteNo < fileData.length) {
                let nextChar = __nextInputChar();

            //  Look for any character that will terminate
            //  the current token...
                if (
                    __isSpaceChar(nextChar) ||
                    __isSingleChar(nextChar) ||
                    __isQuoteChar(nextChar) ||
                    nextChar === "\n"
                ) {
                //  The nextChar byte isn't part of this
                //  token, it simply ends the current token,
                //  so we need to decrement the __byteNo to
                //  account for this or we'll lose a byte
                //  of input.
                    __byteNo--;
                    break;
                }

                __inputToken += nextChar;
            }

            if (__quoteChar !== false)
                return false;

            return true;
        };


    //  __filterInlineComment()
    //
    //  Essentially swallows everything in the fileData
    //  stream until the first \n character is found.
    //
        let     __filterInlineComment = () =>
        {
            while (__byteNo < fileData.length) {
                let nextChar = __nextInputChar();

                let lastChar = '';

            //  We need to allow for users to be able to
            //  escape special characters in comments.
                if (nextChar === "\n" && lastChar !== '\\') {
                    __actualLine++;
                    break;
                }

                lastChar = nextChar;
            }
        };


    //  __nextInputToken()
    //
    //  Will populate the __inputToken buffer with the
    //  next input token.
    //
        let     __nextInputToken = () =>
        {
        //  Grab the next byte from the fileData stream,
        //  from there we can decide what to do next...
            let     nextChar;

        //  We continually grab the next byte looking for
        //  the first non space or tab character.
            while (__byteNo < fileData.length) {
                nextChar = __nextInputChar();

                if (__isSpaceChar(nextChar) === false)
                    break;
            }

        //  Filter out any inline comments.
        //
            if (nextChar === '/') {
                if (fileData.substr(__byteNo, 1) === '/')
                    __filterInlineComment();

            //  The inline comment will end with a \n
            //  character so we will return a \n
            //  input token.
                __inputToken = "\n";
                return;
            }

        //  If it's a newline character we want to increase
        //  the __actualLine count.
            if (nextChar === "\n") {
                __actualLine++;

            //  If there are currently no __inputTokens we
            //  want to sync __codeLine with __actualLine.
                if (__inputTokens.length < 2)
                    __codeLine = __actualLine;

            //  Lastly, the \n becomes a single-character
            //  token that signals to the caller that this
            //  is the end of the current input line.
            //
                __inputToken = "\n";
                return;
            }
            
        //  Look for any single-character tokens, these are
        //  easy to handle, all we do is copy nextChar to the
        //  __inputTokens and we're done!
            else if (__isSingleChar(nextChar))
                __inputToken = nextChar;

        //  Look for a string token. If nextChar is a quote
        //  character we call the __getStringToken() method,
        //  this will return the quoted token string in the
        //  __inputToken buffer..
        //
        //  We pass in the opening quote character (nextChar)
        //  as these are added to the token returned in
        //  __inputToken.
            else if (__isQuoteChar(nextChar))
                __getStringToken(nextChar);

        //  Anything else is an unquoted character token, this
        //  means any sequence of characters until the first
        //  white space, single-character token or quote
        //  character.
        //
        //  The __getCharacterToken() method will handle this,
        //  returning the token in __inputToken.
            else
                __getCharacterToken(nextChar);
        };


    //  __initialise()
    //
    //  This will tokenise the fileData and report any
    //  errors.
    //
        let     __initialise = () =>
        {
        //  We have a main while() loop that will
        //  continually grab tokens from the input
        //  stream until we reach the end.
        //
        //  The flow is simple - while __byteNo is
        //  < the length of the fileData:
        //
        //      1. Grab the next token from fileData
        //      2. If the token is a \n goto 4
        //      3. Else push the token to the array
        //         of __inputTokens and go back to 1.
        //      4. The \n token ends the current line
        //         of __inputTokens, we push the line
        //         of __inputTokens to _lines, clear
        //         __inputTokens array and go back to
        //         step 1.
        //
            while (__byteNo < fileData.length) {

            //  First, we call the __nextToken()
            //  method. This will populate the
            //  __inputToken with the next token
            //  from the fileData stream.
                __nextInputToken();

            //  If we get a token containing a single \n
            //  character this ends the current input
            //  line. The __addTokenisedLine() method
            //  will push the currrent line tokens to
            //  the _lines array and prepare for the
            //  next line of input tokens.
                if (__inputToken === "\n") {
                    __addTokenisedLine();
                    continue;
                }
                
            //  If we get an empty or false input
            //  token we've reached the end of
            //  our fileData.
                if (__inputToken === false || __inputToken.trim() === '')
                    continue;

            //  Anything else is assumed to be a token
            //  of some kind, we don't care what. All
            //  we need to do is add it to the current
            //  __inputTokens array, this is doneusing
            //  the __addLineToken() method.
                __addLineToken();
        
            }

        //  The above loop may potentially break while
        //  some input tokens remain to be pushed to
        //  _lines...
        //
            if (__inputToken !== "")
                __addLineToken();
            if (__inputTokens.length)
                __addTokenisedLine();
        };


    //  _dump()
    //
    //  The Controller may call this to produce a dump
    //  of verbose output for each tokenised file.
    //
        let     _dump = () =>
        {
            let totalTokens = 0;

            process.stdout.write(`\n   File ${fileName} generated ${_lines.length} tokenised lines...\n\n`);

            _lines.forEach(line => {
            //  Dump the total number of line tokens minus the
            //  file name and line number tokens.
                process.stdout.write(`    Line ${line[1]} (${(line.length - 2)} tokens): `);
            
            //  Dump all of the tokens minus file name
            //  and line number.
                for (let tokenNo = 2; tokenNo < line.length; tokenNo++)
                    process.stdout.write(`${line[tokenNo]}\t`);
                process.stdout.write(`\n`);

                totalTokens += (line.length - 2);
            });

            process.stdout.write(`\n   ${totalTokens} tokens in total\n\n`);
        };


    //  Initialise the tokeniser.
    //
        __initialise();


        return {
            lines:          _lines,
            dump:           _dump
        };

    };

    module.exports = Tokeniser;

