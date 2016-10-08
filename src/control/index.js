module.exports.calculateScore = function calculateScore(c) {
  var totalPointValue = 4;

  if(_isNoAnswer()) {
    _setZeroPoints();
  } else if(_isYes()) {
    _setFullPoints();
  }  else if(_isNo()) {
    _setZeroPoints();
  } else if(_isNotApplicable()) {
    _setNotApplicable();
  } else if(_isNotReviewed()) {
    _setNotReviewed();
  } else if(_isPartial()) {
    _getPartial();
  }

  function _getValue(property) {
    let value = 0;

    if(!c[property]) { return value; }

    if(c[property].id === 5) {
      totalPointValue--;
      return value;
    }

    return c[property].value;
  }

  function _getPartial() {
    let total = 0;

    total += _getValue(CONTROL_AUTOMATED);
    total += _getValue(CONTROL_IMPLEMENTED);
    total += _getValue(CONTROL_REPORTED);
    total += _getValue(POLICY_DEFINED);

    c[STATUS] = (totalPointValue === 0) ? 0 : ((total/totalPointValue) * 100);
  }

  function _isNoAnswer() {
    return !c[ANSWER];
  }

  function _isNo() {
    return c[ANSWER].id === 1;
  }

  function _isNotApplicable() {
    return c[ANSWER].id === 2;
  }

  function _isNotReviewed() {
    return c[ANSWER].id === 3;
  }

  function _isPartial() {
    return c[ANSWER].id === 5;
  }

  function _isYes() {
    return c[ANSWER].id === 0;
  }

  function _setFullPoints() {
    c[STATUS] = 100;
  }

  function _setNotApplicable() {
    c[STATUS] = -1;
  }

  function _setNotReviewed() {
    c[STATUS] = -2;
  }

  function _setZeroPoints() {
    c[STATUS] = 0;
  }
}
