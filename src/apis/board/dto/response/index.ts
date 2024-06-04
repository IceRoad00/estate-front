import ResponseDto from "src/apis/response.dto";
import { BoardListItem } from "src/types";

// description : 게시물 검색 Response Body DTO
export interface GetBoardListResponseDto extends ResponseDto {
    boardList: BoardListItem[];
}

export interface GetSearchBoardListResponseDto extends ResponseDto {
    boardList: BoardListItem[];
}

export interface GetBoardResponseDto extends ResponseDto {
    receptionNumber: number;
    status: boolean;
    title: string;
    writerId: string;
    writeDatetime: string;
    viewCount: number;
    contents: string;

    // comment의 내용이 필수가 아니어서 null과 같이 받아줌. 혹은 comment? 로 받을 수 있음(속성 자체가 없을 수 있음 / undefined)
    comment: string | null;
    
}