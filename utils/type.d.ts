export type user = {
    username: string;
    password?: string;
    followingCount: number;
    followingUsers: string[];
    followersCount: number;
    followerUsers: string[];
    firstLogin: boolean;
    hash: string;
    bio?: string;
    _id: string;
    posts: string[];
    save: () => void
}

export type post = {
    caption: string;
    likes: number;
    likedBy: string[];
    postedBy: string;
    uploader: user;
    postedByUsername: string;
    postedOn: number;
    _id: string;
    save: () => void
}

export type updateUserOptionsType = {
    following?: number;
    followersCount?: number;
    password?: string;
    newUsername?: string;
    hash?: string;
    bio?: string;
    firstLogin?: boolean;
}