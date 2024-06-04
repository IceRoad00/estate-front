// description : 로그인 Reqeust Body DTO
export interface SignInRequestDto {
    userId: string;
    userPassword: string;
}

// description : 아이디 중복 확인 Reqeust Body DTO
export interface IdCheckRequestDto {
    userId: string;
}

// description : 이메일 인증 Reqeust Body DTO
export interface EmailAuthRequestDto {
    userEmail: string;
}

// description : 이메일 인증 확인 Reqeust Body DTO
export interface EmailAutCheckRequestDto {
    userEmail: string;
    authNumber: string;
}

// description : 회원가입 Reqeust Body DTO
export interface SignUpRequestDto {
    userId: string;
    userPassword: string;
    userEmail: string;
    authNumber: string;
}
