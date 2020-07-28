# JSONResponse

This class simply provide predefined JSON object, designed to be used as JSON response of POST request
##### Dependencies
none

#### How to import
```javascript
    const JSONResponse = require('@icfm/trust').JSONResponse;
```

#### Sending Error message
```javascript
JSONResponse.error('Something is not right');
```
Will send {result:'error', message:'Something is not right'}

#### Sending Debug object
```javascript
JSONResponse.debug(obj);
```
Will send {result:'debug',data:obj}

#### Sending Success message and/or object
```javascript
JSONResponse.success("It's a success", retObj);
// OR
JSONResponse.success("Just want to inform your success");
```
The first version will merge "It's a success" into retObj.
For example, if retObj is {newUser:oUser}, will return:
{result:'success', message:"It's a success", newUser:oUser}
If only message is put in parameter:
{result:'success', message:"Just want to inform your success"}