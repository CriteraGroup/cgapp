__cg = {
  messenger: createMessenger()
};

function createMessenger() {
  function Messenger() {}

  Messenger.prototype = Object.create(null);
  Messenger.prototype.success = success;
  Messenger.prototype.fail = fail;

  return new Messenger();

  function fail(msg) {
    _makeMessage(msg, false);
  }

  function success(msg) {
    _makeMessage(msg, true);
  }

  function _makeMessage(msg, isSuccess) {
    let msgContainer = document.createElement('div'),
        msgText = document.createTextNode(msg);

    msgContainer.className = isSuccess ? 'success-message' : 'fail-message';
    msgContainer.appendChild(msgText);

    document.body.appendChild(msgContainer);

    setTimeout(function() {
      msgContainer.className = msgContainer.className + ' active';
    }, 0);

    setTimeout(function() {
      document.body.removeChild(msgContainer);
    }, 1600);
  }
}
