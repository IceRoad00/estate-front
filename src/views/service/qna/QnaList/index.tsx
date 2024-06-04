import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react'
import './style.css'
import { useUserStore } from 'src/stores';
import { useNavigate } from 'react-router';
import { AUTH_ABSOLUTE_PATH, COUNT_PER_PAGE, COUNT_PER_SECTION, QNA_DETAIL_ABSOLUTE_PATH, QNA_WRITE_ABSOLUTE_PATH } from 'src/constant';
import { BoardListItem } from 'src/types';
import { getBoardListRequest, getSearchBoardListRequest } from 'src/apis/board';
import { useCookies } from 'react-cookie';
import ResponseDto from 'src/apis/response.dto';
import { GetBoardListResponseDto } from 'src/apis/board/dto/response';
//              component                //
function Listitem (
    {
        receptionNumber,
        status,
        title,
        writerId,
        writeDatetime,
        viewCount
    }: BoardListItem) {

        //              function                //
        const navigator = useNavigate();

        //              event handler                //
        const onClickHandler = () => navigator(QNA_DETAIL_ABSOLUTE_PATH(receptionNumber));

    //              component                //
    return (
        <div className='qna-list-table-tr' onClick={onClickHandler}>
            <div className='qna-list-reception-number'>{receptionNumber}</div>
            <div className='qna-list-status'>
                {status ?
                <div className='disable-bedge'>완료</div> :
                <div className='primary-bedge'>접수</div>
                }   
            </div>
            <div className='qna-list-title' style={{textAlign : 'left'}}>{title}</div>
            <div className='qna-list-writer-id'>{writerId}</div>
            <div className='qna-list-write-date'>{writeDatetime}</div>
            <div className='qna-list-view-count'>{viewCount}</div>
        </div>
    );
}
//              component                //
export default function QnaList() {

    //              state                //
    const {loginUserRole} = useUserStore();

    const [cookies] = useCookies();

    const [boardList, setBoardList] = useState<BoardListItem[]>([]);
    const [viewList, setViewList] = useState<BoardListItem[]>([]);
    const [totalLength, setTotalLength] = useState<number>(0);
    const [totalPage, setTotalPage] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageList, setPageList] = useState<number[]>([1]);
    const [totalSection, setTotalSection] = useState<number>(1);
    const [currentSection, setCurrentSection] = useState<number>(1);
    const [isToggleOn, setToggleOn] = useState<boolean>(false);

    const[searchWord, setSearchWord] = useState<string>('');

    //              function                //
    const navigator = useNavigate();

    const changePage = (boardList: BoardListItem[], totalLength: number) => {
        if(!currentPage) return;
        const startIndex = (currentPage - 1) * COUNT_PER_PAGE;
        let endIndex = currentPage * COUNT_PER_PAGE;
        if(endIndex > totalLength - 1) endIndex = totalLength;
        const viewList = boardList.slice(startIndex, endIndex);
        setViewList(viewList);
    };

    const changeSection = (totalPage: number) => {
        if(!currentSection) return;
        const startPage = (currentSection * COUNT_PER_SECTION - (COUNT_PER_SECTION - 1));
        let endPage = currentSection * COUNT_PER_SECTION;
        if(endPage > totalPage) endPage = totalPage;
        const pageList: number[] = [];
        for(let page = startPage; page <= endPage; page++) pageList.push(page);
        setPageList(pageList);
    }

    const changeBoardList = (boardList: BoardListItem[]) => {
        // boardList의 미완료 보기에 있는 status의 false 값만 반환해줌
        if(isToggleOn) boardList = boardList.filter(board => !board.status)
        setBoardList(boardList);

        const totalLength = boardList.length;
        setTotalLength(totalLength);

        const totalPage = Math.floor((totalLength - 1) / COUNT_PER_PAGE) + 1;
        setTotalPage(totalPage);

        const totalSection = Math.floor((totalPage - 1) / COUNT_PER_SECTION) + 1;
        setTotalSection(totalSection);

        changePage(boardList, totalLength);

        changeSection(totalPage);
    }

    const getBoardListResponse = (result: GetBoardListResponseDto | ResponseDto | null) => {
        const message =
        !result ? '서버에 문제가 있습니다.' :
            result.code === 'AF' ? '인증에 실패했습니다.' :
            result.code === 'DBE' ? '서버에 문제가 있습니다.' : "";

        if(!result || result.code !== 'SU') {
            alert(message);
            if(result?.code === 'AF') navigator(AUTH_ABSOLUTE_PATH);
            return;
        }

        const {boardList} = result as GetBoardListResponseDto;
        changeBoardList(boardList);

        setCurrentPage(!boardList.length ? 0 : 1);
        setCurrentSection(!boardList.length ? 0 : 1);
    };

    const getSearchBoardListResponse = (result: GetBoardListResponseDto | ResponseDto | null) => {
        const message =
            !result ? '서버에 문제가 있습니다.' :
            result.code === 'VF' ? '검색어를 입력하세요.' :
            result.code === 'AF' ? '인증에 실패했습니다.' :
            result.code === 'DBE' ? '서버에 문제가 있습니다.' : '';

        if(!result || result.code !== 'SU') {
            alert(message);
            if(result?.code === 'AF') navigator(AUTH_ABSOLUTE_PATH);
            return result;
    } 
        const {boardList} = result as GetBoardListResponseDto;
        changeBoardList(boardList);

        setCurrentPage(!boardList.length ? 0 : 1);
        setCurrentSection(!boardList.length ? 0 : 1);
    };

    //              event handler                //
    const onWriteButtonClickHandler = () => {
        if(loginUserRole !== 'ROLE_USER') return;
        navigator(QNA_WRITE_ABSOLUTE_PATH);
    };

    const onToggleClickHandler = () => {
        if(loginUserRole !== 'ROLE_ADMIN') return;
        setToggleOn(!isToggleOn);
    };

    const onPageClickHandler = (page: number) => {
        setCurrentPage(page);
    };

    const onPreSectionClickHandler = () => {
        if(currentSection <= 1) return;
        setCurrentSection(currentSection - 1);
        setCurrentPage((currentSection-1)* COUNT_PER_SECTION);
    };

    const onNextSectionClickHandler = () => {
        if(currentSection === totalSection) return;
        setCurrentSection(currentSection + 1);
        setCurrentPage(currentSection * COUNT_PER_SECTION + 1);
    };

    const onSearchWordChangeHandler = (event:ChangeEvent<HTMLInputElement>) => {
        const searchWord = event.target.value;
        setSearchWord(searchWord);
    }

    const onPasswordKeydownHandler = (event:KeyboardEvent<HTMLInputElement>) => {
        if(event.key === 'Enter') return onSearchButtonClickHandler();
    };

    const onSearchButtonClickHandler = () => {
        if(!searchWord) return;
        if(!cookies.accessToken) return;
        getSearchBoardListRequest(searchWord, cookies.accessToken).then(getSearchBoardListResponse);
    }

    //              effect                //
    useEffect(() => {
        if(!cookies.accessToken) return;
        getSearchBoardListRequest(searchWord, cookies.accessToken).then(getSearchBoardListResponse);
    }, [isToggleOn])

    useEffect(() => {
        if(!boardList.length) return;
        changePage(boardList, totalLength);
    }, [currentPage])

    useEffect(() => {
        if(!boardList.length) return;
        changeSection(totalPage);
    }, [currentSection])

    //              render                //
    const toggleClass = isToggleOn ? 'toggle-active' : 'toggle';
    const searchButtonClass = searchWord ? 'primary-button' : 'disable-button';

    return (
    <div id='qna-list-wrapper'>
        <div className='qna-list-top'>
            <div className='qna-list-size-text'>전체 <span className='emphasis'>{totalLength}건</span> | 페이지 <span className='emphasis'>{currentPage}/{totalPage}</span></div>
            <div className='qna-list-top-right'>
                {loginUserRole === 'ROLE_USER' ?  
                <div className='primary-button' onClick={onWriteButtonClickHandler}>글쓰기</div> :
                <>
                <div className={toggleClass} onClick={onToggleClickHandler}></div>
                <div className='qna-list-admin-text'>미완료 보기</div>
                </>
                }
            </div>
        </div>
        <div className='qna-list-table'>
            <div className='qna-list-table-th'>
                <div className='qna-list-reception-number'>접수번호</div>
                <div className='qna-list-status'>상태</div>
                <div className='qna-list-title'>제목</div>
                <div className='qna-list-writer-id'>작성자</div>
                <div className='qna-list-write-date'>작성일</div>
                <div className='qna-list-view-count'>조회수</div>
            </div>
            {viewList.map(item => <Listitem key={item.receptionNumber} {...item} />)}
        </div>
        <div className='qna-list-bottom'>
            <div style={{width: '299px'}}></div>
            <div className='qna-list-pagenation'>
                <div className='qna-list-page-left' onClick={onPreSectionClickHandler}></div>
                <div className='qna-list-page-box'>
                    {pageList.map(page => 
                        page === currentPage ?
                        <div className='qna-list-page-active' key={page}>{page}</div> :
                        <div className='qna-list-page' onClick={() => onPageClickHandler(page)} key={page}>{page}</div>
                        )}
                </div>
                <div className='qna-list-page-right' onClick={onNextSectionClickHandler}></div>
            </div>
            <div className='qna-list-search-box'>
                <div className='qna-list-search-input-box'>
                    <input className='qna-list-search-input' placeholder='검색어를 입력하세요.' value={searchWord} onChange={onSearchWordChangeHandler} onKeyDown={onPasswordKeydownHandler}/>
                </div>
                <div className={searchButtonClass} onClick={onSearchButtonClickHandler}>검색</div>
            </div>
        </div>
    </div>
    );
}