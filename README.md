# JSON-FORMATE-CHECK

## The Problem:
Everytime when you send some data to servicer, they will check your role, your authority then check your data, at last processing the data that you send to them.

For solving the role and authority problems, hard engineer invent the token\cookies mechanism. However for imporve the probability of success and imporve the experience of our website or application, we need to check the data that we send before we send it using some simply rules. Although we cannot determine what content user could input or manipulate, we can determine what data should be accepted by server, then we just need to tell user your input is illegality when necessary.

## The Solution
Using this package and write some simple rules to check the format of JSON data.

wanted data
```
{
  name: 'students',
  number: 5,
  age:[10, 11, 12, 14, 15],
  info:[{
    name: 'A Student',
    sex: 'male',
    studentID: 00001
  },{
    name: 'B Student',
    sex: 'female',
    studentID: 00002
  },{
    name: 'C Student',
    sex: 'male',
    studentID: 00003
  },{
    name: 'D Student',
    sex: 'male',
    studentID: 00004
  },{
    name: 'E Student',
    sex: 'male',
    studentID: 00005
  }]
}
```

schema data
```
{
  name:{
    name: '姓名',
    type: 'String',
    required: true
  },
  number:{
    name: '学生数量',
    type: 'Number'
  },
  age:{
    name: '年龄',
    type: 'Array',
    items:{
      name: '年龄元素',
      type: 'Number',
      min: '18'
    },
    require: false
  },
  info:{
    name: '学生信息',
    type: 'Array'
  }
}
```


processing
```
import {JSONFormatCheck} from 'json-format-check'
console.log(JSONFormatCheck(schema_data, wanted_data)); 
```
you will get {success: true}
then add part of schema_data into 
```
school:{
  name: '学校',
  type: 'String',
  required: true
}
```

then you will get one error message
```
descript: "school is required, but not provided",
name : "学校",
param : "school", 
rule : "required", 
success : false
```

you can find that your json data is not pass the validation because the school attr is not provided. so you need to reminder the user to input this field.

## All rules

* each one attr should corresponding one attr with same name in scheme object

scheme attr name| required | description | 解释 | *
:------------ | :------------ | :------------ | ------------:
name | required | used in return as one flag to quiclky find error data|用于元素检查失败时返回的标志符 | 
type | required | type of attr | 元素的类型 | [Object, Array, Number, String, Null, Undefined, Regex, Date ]
required | not | attr is required? default is false | 元素是否必须填写，默认false，即不是必须存在 | [true, false]
allowNull | not | allow value is Null? default is false | 是否允许null，默认false，即不允许 | [true, false]
allowUndefined | not | allow value is Undefined? default is false | 是否允许undefined，默认false，即不允许 | [true, false]
enum | not | value should be in one fixed data pool? | 元素可选的枚举 | 
min | not | the min length or min value for String\Array or Number type value |元素的最小长度或最小值，应用在Array、String、Numbe |
max | not | the max length or max value for String\Array or Number type value |元素的最大长度或最大值，应用在Array、String、Numbe |
pattern | not | value should test with one regex? | 用正则方式去检验元素 | 
items | not | should test the item of one Array with shceme still? |类型为Array时，用于确定数组内部元素格式的scheme Object |
attrs | not | should test object attr with shceme still? |类型为Object时，用于确定子对象元素格式的scheme Object |