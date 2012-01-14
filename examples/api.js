// api.js

module.exports = {
  echo: {
    /**
      A GET method for 'echo'

      @param {Object} response is the callback function to siesta which handles the response
      */
    GET: function (response) {
      /**
        Response function

        @param {integer} status [optional] status code of response
        @param {Object} message the message to relay back to the user, if it's a string it'll be converted to an object
        */
      response('hello world');
    }
  }
};
