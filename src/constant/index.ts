//jwt配置常量
const JWT_SECRET = 'JWT_SECRET';
//Token有效期限：半年
const TOKEN_EXP = 'TOKEN_EXP';
const TOKEN = 'token';
const MESSAGE_OK = 'ok';
const passwordReg = /^(?=.*\d)((?=.*[a-z])|(?=.*[A-Z]))[a-zA-Z0-9]/;
const phoneReg = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
const nickNameReg = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/;
export { JWT_SECRET, TOKEN_EXP, MESSAGE_OK, TOKEN, passwordReg, phoneReg, nickNameReg };
