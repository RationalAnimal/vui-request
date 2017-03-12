/*
@author Ilya Shubentsov

MIT License

Copyright (c) 2017 Ilya Shubentsov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
'use strict'
var request = {};


/**
* Match object describes an individual potential match for user utterance.  For
* some platforms, e.g. Alexa at this time, there is only one match. For others,
* e.g. Luis, you may get a sorted list of possible values.  For each match you
* may get a meaningful match probability.  Again, for some systems this will be
* populated with a meaningful default value.  E.g. on Alexa there will be only
* one match with a typical probability of 100%, though under some circumstances
* this may not be 100%.  For example, if you have custom slots and the value
* returned is NOT one of them, then the probability may be lower.  For each
* match you will get a single intent name.  If you are working with an
* implementation that will alway return an intent name this will be populated.
* Some platforms may simply pass the raw text and expect you to do the complete
* processing.  In which case you will not get an intent name.  You will also get
* a list of locales that should be used to interpret the raw text.  Typically
* this will be a single locale.  If there are multiple ones - they all apply to
* the same match and to the same raw text.  For example, "Hasta la vista, baby"
* may have both the en and es locales.
*/
request.Match = class {
  /**
  * Create a Match.
  * @param {string} requestUserRawText - raw text as understood by the recognizer,
  * may be empty if the platform does not provide raw text, e.g. Alexa.  Note
  * that even on such platforms raw text will sometimes be made available IF there
  * is only one acceptable utterance for the given intent.
  * @param {number} requestMatchProbability - probability that this match is a
  * good one, 0.0 - 1.0 is the acceptable range.  If the recognizer does not
  * provide a value this will be defaulted to something meaningful, e.g. 1.0
  * @param {string} intentName - the name of the intent that the recognizer
  * matched this utterance to, may be empty.
  * @param {Object[]} mappedValues - the list of matched key/value pairs.  This
  * is called different things on different platforms.  For example, on alexa this
  * is called slot names/slot values.
  * @param {string[]} locales - an array of locales that should be used to interpret
  * the raw text.  May be an empty array if the recognizer could determine the
  * language
  */
  constructor(requestUserRawText, requestMatchProbability, intentName, mappedValues, locales){
    this.setRawText(requestUserRawText);
    this.setMatchProbability(requestMatchProbability);
    this.setIntentName(intentName);
    this.setMappedValues(mappedValues);
    this.setLocales(locales);
  }
  clone(){
    return new request.Match(this.userRawText,
                             this.matchProbability,
                             this.intentName,
                             this.mappedValues,
                             this.locales
                           );
  }
  getRawText() {
    return this.userRawText;
  }
  setRawText(requestUserRawText){
    if(typeof requestUserRawText == "string"){
      this.userRawText = requestUserRawText;
    }
    else {
      this.userRawText;
    }
  }
  getMatchProbability() {
    return this.matchProbability;
  }
  setMatchProbability(requestMatchProbability){
    if(isNaN(requestMatchProbability)){
      this.matchProbability = 1.0;
    }
    else {
      if(requestMatchProbability < 0.0){
        this.matchProbability = 0;
      }
      else if(requestMatchProbability > 1.0){
        this.matchProbability = 1.0;
      }
      else {
        this.matchProbability = requestMatchProbability;
      }
    }
  }
  getIntentName() {
    return this.intentName;
  }
  setIntentName(intentName){
    if(typeof intentName == "string"){
      this.intentName = intentName;
    }
    else {
      this.intentName;
    }
  }
  getMappedValues() {
    var returnValue = [];
    for(var i = 0; i < this.mappedValues.length; i++){
      var scratch = this.mappedValues[i];
      returnValue.push({"key": scratch.key, "value": scratch.value});
    }
    return returnValue;
  }
  setMappedValues(mappedValues){
    this.mappedValues = [];
    if(typeof mappedValues != "undefined" && Array.isArray(mappedValues)){
      for(var i = 0; i < mappedValues.length; i++){
        var mappedValue = mappedValues[i];
        if(typeof mappedValue.key == "string" && typeof mappedValue.value != "undefined"){
          var scratchValue = {};
          scratchValue.key = mappedValue.key;
          scratchValue.value = mappedValue.value;
          this.mappedValues.push(scratchValue);
        }
      }
    }
  }
  getMappedValue(key){
    for(var i = 0; i < this.mappedValues.length; i++){
      var scratch = this.mappedValues[i];
      if(scratch.key == key){
        return scratch.value;
      }
    }
    return undefined;
  }
  getLocales() {
    return this.locales.slice();
  }
  setLocales(locales){
    if(typeof locales != null && Array.isArray(locales) && locales.length > 0){
      this.locales = locales.slice();
    }
    else {
      this.locales = [];
    }
  }
};

/**
* This is a constructor for the platform independent request.  It includes
*/
request.Request = class {
  getRequestId(){
    return this.requestId;
  }
  setRequestId(requestId){
    if(typeof requestId == "string"){
      this.requestId = requestId;
    }
    else if (isNaN(requestId) == false){
      this.requestId = "" + requestId;
    }
    else {
      this.requestId = undefined;
    }
  }
  getRequestType(){
    return this.type;
  }
  setRequestType(requestType){
    if(request.Request.types.indexOf(requestType) >= 0){
      this.type = requestType;
    }
    else {
      this.type = undefined;
    }
  }
  getRequestTimeStamp(){
    return this.timeStamp;
  }
  setRequestTimeStamp(requestTimeStamp){
    this.timeStamp = requestTimeStamp;
  }
  getRequestLocale(){
    return this.locale;
  }
  setRequestLocale(requestLocale){
    if(typeof requestLocale == "string"){
      this.locale = requestLocale;
    }
    else {
      this.locale;
    }
  }
  getRequestMatchCount(){
    return this.matches.length;
  }
  getRequestMatch(atPosition){
    if(this.matches.length > atPosition){
      return this.matches[atPosition];
    }
    return;
  }
  setRequestMatches(replacementMatches){
    this.matches = [];
    if(Array.isArray(replacementMatches)){
      for(var i = 0; i < replacementMatches.length; i++){
        if(typeof replacementMatches[i].clone == "function")
        this.matches.push(replacementMatches[i].clone());
      }
    }
  }
  getRequestReason(){
    return this.reason;
  }
  setRequestReason(requestReason){
    if(typeof requestReason == "string"){
      this.reason = requestReason;
    }
    else {
      this.reason;
    }
  }
  getRequestError(){
    if(typeof this.error == "undefined"){
      return;
    }
    var returnValue = {};
    returnValue = {};
    if(typeof this.error.type == "string"){
      returnValue.type = this.error.type;
    }
    if(typeof this.error.message == "string"){
      returnValue.message = this.error.message;
    }
    return returnValue;
  }
  setRequestError(requestError){
    if(typeof requestError != "undefined" &&
       (typeof requestError.type == "string" ||
        typeof requestError.message == "string")){
      this.error = {};
      if(typeof requestError.type == "string"){
        this.error.type = requestError.type;
      }
      if(typeof requestError.message == "string"){
        this.error.message = requestError.message;
      }
    }
    else {
      this.error;
    }
  }
  constructor(requestId, requestType, requestTimeStamp, requestLocale, requestMatches, requestReason, requestError){
    this.setRequestId(requestId);
    this.setRequestType(requestType);
    this.setRequestTimeStamp(requestTimeStamp);
    this.setRequestLocale(requestLocale);
    this.setRequestMatches(requestMatches);
    this.setRequestReason(requestReason);
    this.setRequestError(requestError);
  }

};

request.Request.type = {};
request.Request.type.START_SESSION = "START_SESSION";
request.Request.type.END_SESSION = "END_SESSION";
request.Request.type.INTENT = "INTENT";
request.Request.types =
[
  request.Request.type.START_SESSION,
  request.Request.type.END_SESSION,
  request.Request.type.INTENT
];

request.Request.endSessionReason = {};
request.Request.endSessionReason.USER_INITIATED = "USER_INITIATED";
request.Request.endSessionReason.ERROR = "ERROR";

request.Request.endSessionReasons =
[
  request.Request.endSessionReason.USER_INITIATED,
  request.Request.endSessionReason.ERROR
];

request.Request.errorCode = {};
request.Request.errorCode.INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";

request.Request.errorCodeS =
[
  request.Request.errorCode.INTERNAL_SERVER_ERROR
];

/**
 * Call this function to add vui-request functionality to
 * any object.
 * @param {object} app - The object to which the functionality should be added.
 */
request.addRequestToApp = function(app){
  if(app.requestAlreadyAdded == true){
    return;
  }
  app.requestAlreadyAdded = true;
  app.parsers = [];
  app.addRequestParser = function(parser){
    parsers.push(parser);
  }
  /**
  * Call this function to parse the request.
  * @param requestToParse - either a string containing a json object or an actual
  *   json object that was received as the request.  Note that this is the raw
  *   request that is platform specific.  Thus we are trying parsers in order
  *   until we get one that works.  This allows multiple platforms to be
  *   supported by the same backend.
  */
  app.parse = function(requestToParse, requestToPopulate, sessionToPopulate, stateToPopulate){
    var parsed = false;
    for(var i = 0; i < parsers.length; i++){
      if(parsers[i].parse(requestString, requestToPopulate, sessionToPopulate, stateToPopulate) == true){
        parsed = true;
        break;
      }
    }
    return parsed;
  }
  app.Match = request.Match;
  app.Request = request.Request;
};


module.exports = request;
