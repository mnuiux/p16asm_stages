// p16asm.js
//

    // Import our main Controller module (we will write
    // this next).
        const Controller = require('./src/Controller');

    // Instantiate the module.
        const _controller = Controller();

    // Error check - we will build this functionality into
    // the Controller module.
        _controller.isError(true);

