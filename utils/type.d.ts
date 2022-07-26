export type user = {
    username: string;
    password?: string;
    followingCount: number;
    followingUsers: { username: string }[];
    followersCount: number;
    followerUsers: { username: string }[];
    firstLogin: boolean;
    hash: string;
    bio?: string;
    _id: string;
    posts: { posts: posts }[];
    save: () => void
}

export type post = {
    caption: string;
    likes: number;
    likedBy: string[];
    likedByUsernames: string[];
    postedBy: { username: string }[];
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