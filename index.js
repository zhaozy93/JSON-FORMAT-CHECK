'use strict'
/**
 * scheme Object
 * @param name     用于元素检查失败时返回的标志符，必填项
 * @param type     元素的类型， [Object, Array, Number, String, Null, Undefined, Regex ] 必填项
 * @param required 元素是否必须填写，默认false，即不是必须存在，可选项
 * @param allowNull  是否允许null，默认false，即不允许，可选项
 * @param allowUndefined  是否允许undefined，默认false，即不允许，可选项
 * @param enum     元素可选的枚举，可选项
 * @param min      元素的最小长度或最小值，应用在Array、String、Number，可选项
 * @param max      元素的最大长度或最大值，应用在Array、String、Number，可选项
 * @param pattern  用正则方式去检验元素，可选项
 * @param items    类型为Array时，用于确定数组内部元素格式的scheme Object
 * @param attrs    类型为Object时，用于确定子对象元素格式的scheme Object
 */


function getType(target){
  return Object.prototype.toString.call(target).slice(8,-1);
}

function checkScheme(scheme, target){
  let keys = Object.keys(scheme);
  for(let key of keys){
    let rule = scheme[key];
    let item = target[key];
    // no name in rule return false
    // if(!rule['name']){
    //   return {
    //       success: false,
    //       rule: 'name',
    //       param: key,
    //       descript: `no corresponding name provided in scheme object`
    //     }
    // }
    // // no type in rule return false
    // if(!rule['type']){
    //   return {
    //       success: false,
    //       rule: 'type',
    //       param: key,
    //       descript: `no corresponding type provided in scheme object`
    //     }
    // }
    // if param is not must required and the item is not provided, then just break
    if(!rule['required'] && !item){
      break;
    }
    // if param is required, but not provided return false
    if(rule['required'] && !item){
      return {
          success: false,
          rule: 'required',
          param: key,
          descript: `${key} is required, but not provided`
      }
    }
    // if allowNull in this param, and the value is Null, then just jump into next param
    if(rule['allowNull'] && getType(item) === 'Null'){
      break;
    }
    // if allowNull in this param, and the value is Null, then just jump into next param
    if(rule['allowUndefined'] && getType(item) === 'Undefined'){
      break;
    }
    // has type but not excepted return false
    if(rule['type'] !== getType(item)) {
      return {
        success: false,
        rule: 'type',
        param: key,
        descript: `excepted ${rule['type']}, but get ${getType(item)}`
      }
    }
    // if enum is provided, the value should be in this enum array
    if(rule['enum'] && rule['enum'].indexOf(item) === -1){
      return {
          success: false,
          rule: 'enum',
          param: key,
          descript: `${key} should be in provided array, but not find`
      }
    }
    // if min is provided, then check the length or value 
    if(rule['min']){
      if(getType(item) === 'Number'){
        if(item < rule['min']){
          return {
            success: false,
            rule: 'min',
            param: key,
            descript: `min of ${key} is ${rule['min']}, but get ${item}`
          } 
        }
      }else if(getType(item) === 'Array' || getType(item) === 'String'){
        if(item.length < rule['min']){
          return {
            success: false,
            rule: 'min',
            param: key,
            descript: `min length of ${key} is ${rule['min']}, but get ${item.length}`
          } 
        }
      }else{
        return {
            success: false,
            rule: 'min',
            param: key,
            descript: `${key} is not Array、 String or Number, cannot set min check`
        }
      }
    }
    // if max is provided, then check the length or value 
    if(rule['max']){
      if(getType(item) === 'Number'){
        if(item > rule['max']){
          return {
            success: false,
            rule: 'max',
            param: key,
            descript: `max of ${key} is ${rule['max']}, but get ${item}`
          } 
        }
      }else if(getType(item) === 'Array' || getType(item) === 'String'){
        if(item.length > rule['max']){
          return {
            success: false,
            rule: 'max',
            param: key,
            descript: `max length of ${key} is ${rule['max']}, but get ${item.length}`
          } 
        }
      }else{
        return {
            success: false,
            rule: 'max',
            param: key,
            descript: `${key} is not Array、 String or Number, cannot set min check`
        }
      }
    }
    // if pattern is provided, test it with reg.test
    if(rule['pattern']){
      let reg;
      try{
        reg = new RegExp(rule['pattern']);
      }
      catch(e){
        return {
            success: false,
            rule: 'pattern',
            param: key,
            descript: `the pattern "${rule['pattern']}" provided in ${key} is not correct`
        }
      }
      if(!reg.test(item)){
        return {
            success: false,
            rule: 'pattern',
            param: key,
            descript: `the ${item} is not pass the test with pattern "${rule['pattern']}" provided in ${key}`
        }
      }
    }
    // if item is provided, then item should be Array type then check all elements in Array
    if(rule['items']){
      if(getType(item) !== 'Array'){
        return {
          success: false,
          rule: 'items',
          param: key,
          descript: `the ${item} is not Array type, so should not have the items rule`
        }
      }
      let len = item.length;
      if(len){
        for(let i=0; i<len; i++){
          let result = checkScheme({i:rule['items']},{i:item[i]});
          if(!result.success){
            return Object.assign({}, result, {param: key, index: i});
          }
        }
      }
    }
    // if attrs is provided, then item should be Object type then check it as check themself
    if(rule['attrs']){
      if(getType(item) !== 'Object'){
        return {
          success: false,
          rule: 'attrs',
          param: key,
          descript: `the ${item} is not Object type, so should not have the attrs rule`
        }
      }
      let result = checkScheme(rule['attrs'],item);
      if(!result.success){
        return Object.assign({}, result, {param: key});
      }
    }
  }
  return { success: true }
}


function Object_format_check(scheme, target){
	if(getType(scheme) !== 'Object'){
  	return 'Scheme type error';
  }
  let schemeDefault = {
    name: {
      name: 'Scheme type error',
      type: 'String',
      required: true
    },
    type: {
      name: 'Scheme type error',
      type: 'String',
      enum: ['Object', 'Array', 'Number', 'String', 'Null', 'Undefined', 'Regex'],
      required: true
    }
  }
  let keys = Object.keys(scheme);
  for(let i=0; i< keys.length; i++){
    let result = checkScheme(schemeDefault, scheme[keys[i]]);
    if(!result.success){
      return {success: false, descript: 'I will not tell you where are incorrect in your scheme Object, just see it detailed'}
    }
  }
  
  return checkScheme(scheme, target);
}

export let JSONFormatCheck = Object_format_check;
export default JSONFormatCheck = Object_format_check;
