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
    save: () => {}
}

export type post = {
    caption: string;
    likes: number;
    likedBy: string[];
    postedBy: string;
    _id: string;
    save: () => {}
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