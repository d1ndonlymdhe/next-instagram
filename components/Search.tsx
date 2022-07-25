import axios from "axios";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { server } from "../pages";
import { useGlobalContext, useGlobalUpdateContext } from "./GlobalContext2";
import Cookies from "js-cookie";
import { ArrowLeftIcon, SearchIcon } from "@heroicons/react/outline";
import Input from "./Input";
import Spinner from "./Spinner";
//@ts-ignore
import uuid from "react-uuid"
import Button from "./Button";
import Error from "./Error"
type set<T> = React.Dispatch<React.SetStateAction<T>>
type SearchPropType = {
    setVisitingProfile: set<string>
}

export default function Search(props: SearchPropType) {
    const { setVisitingProfile } = props;
    const globalState = useGlobalContext();
    const updateGlobalState = useGlobalUpdateContext()
    const { username } = globalState;
    const searchRef = useRef<HTMLInputElement>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchComplete, setSearchComplete] = useState(false);
    const [forRerender, setForReRender] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const initiateSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSearching(true);
        setError("");
        const searchTerm = searchRef?.current?.value;
        if (searchTerm && searchTerm != "") {
            axios.get(`${server}/search`, { params: { searchTerm, hash: Cookies.get("hash") } }).then(res => {
                if (res.data.status === "ok") {
                    updateGlobalState({ ...globalState, searchResults: res.data.results });
                    setSearchComplete(true);
                    setIsSearching(false)
                } else {
                    setError(res.data.message.error)
                }
            })
        }
    }
    type searchBarProps = {
        initiateSearch: (e: React.FormEvent) => void;
    }
    const Searchbar = React.forwardRef<HTMLInputElement, searchBarProps>(
        (props, ref) => {
            const { initiateSearch } = props;
            return <form onSubmit={(e) => {
                initiateSearch(e)
            }}>
                <div className="h-full w-full grid grid-cols-[10fr_90fr_10fr] gap-2 px-2 items-center">
                    <ArrowLeftIcon className="hover:cursor-pointer" onClick={() => {
                        router.back()
                    }}></ArrowLeftIcon>
                    <Input onChange={() => { }} ref={ref} placeholder="Search" autoFocus={true} className="h-4/6"></Input>
                    <button><SearchIcon></SearchIcon></button>
                </div>
            </form>

        }
    );
    Searchbar.displayName = "SearchBar"
    type SearchResultsProps = {
        isSearching: boolean;
        searchComplete: boolean;
        setVisitingProfile: set<string>
    }
    function SearchResults(props: SearchResultsProps) {
        const globalState = useGlobalContext();
        const { isSearching, searchComplete, setVisitingProfile } = props;
        const { username } = globalState;
        const [searchResults, setSearchResults] = useState(globalState.searchResults);

        const router = useRouter();

        //loading
        if (isSearching) {
            return <div className="h-full w-full flex items-center justify-center">
                <Spinner></Spinner>
            </div>
        }
        //if query not return anything
        if (searchResults[0] == undefined) {
            return <div className="h-full w-full flex items-center justify-center">
                <div>No user found</div>
            </div>
        }
        //if search results in default state
        if (searchResults[0].username == "") {
            return <div className="h-full w-full"></div>
        }
        return (<div className="h-full flex flex-col my-5 mx-5">
            {
                searchResults.map(result => {
                    if (result.username !== username) {
                        return <div onClick={() => {
                            setVisitingProfile(result.username);
                            router.push(`?username=${result.username}#profile`);
                        }} key={uuid()}>
                            <div className="flex flex-row items-center justify-between my-3 border border-black rounded-sm py-2 px-3 hover:cursor-pointer">
                                <div className="flex flex-row items-center justify-between">
                                    <img alt="Profile Picture" src={`${server}/getProfilePic?username=${result.username}`} height="50" width="50" className="rounded-full border border-black "></img>
                                    <div className="text-center mx-5">{result.username}</div>
                                </div>
                                <Button key={uuid()} bonClick={(e) => {
                                    e.stopPropagation();
                                    if (!result.isFollowing) {
                                        //try extracting logic to fucntion
                                        axios.post(`${server}/follow`, { hash: Cookies.get("hash"), toFollow: result.username }).then(res => {
                                            console.log("follow res = ", res);
                                            if (res.data.status === "ok") {
                                                const tempResults: (typeof searchResults) = Object.assign([], searchResults);
                                                tempResults[searchResults.indexOf(result)].isFollowing = true;
                                                setSearchResults(tempResults);
                                                setForReRender(!forRerender);
                                            }
                                        })
                                    } else {
                                        axios.post(`${server}/unfollow`, { hash: Cookies.get("hash"), toUnFollow: result.username }).then(res => {
                                            if (res.data.status === "ok") {
                                                const tempResults: (typeof searchResults) = Object.assign([], searchResults);
                                                tempResults[searchResults.indexOf(result)].isFollowing = false;
                                                setSearchResults(tempResults);
                                                setForReRender(!forRerender);
                                            }
                                        })
                                    }
                                }} text={`${result.isFollowing ? "Following" : "Follow"}`} className={`${result.isFollowing ? "bg-slate-500" : "bg-blue-400"}`}></Button>
                            </div>
                        </div>
                    }
                })
            }
        </div>
        )
    }
    return <>
        <Searchbar ref={searchRef} {...{ initiateSearch }} ></Searchbar>
        {error !== "" &&
            <div className="h-full w-full flex justify-center items-center">
                <Error message={error} className="px-3 py-2"></Error>
            </div>
        }
        {error == "" && <SearchResults {...{ isSearching, searchComplete, setVisitingProfile }}></SearchResults>}
    </>
}
