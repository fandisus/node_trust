class JSONResponse {
  public static success(message:string, retObj:any={}):any {
    retObj.message = message;
    retObj.result = 'success';
    return retObj;
  }
  public static debug(data:any={}):any {
    return {result:'debug',data:data};
  }
  public static error(message:string|undefined):any {
    if (message === undefined) return {result:'error', message:'Error message is undefined'};
    return {result:'error', message:message};
  }
}
export { JSONResponse };