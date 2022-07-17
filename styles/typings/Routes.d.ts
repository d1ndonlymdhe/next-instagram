type set<T> = React.Dispatch<React.SetStateAction<T>>
type LoginPageProps = {
    setGlobalUsername: set<string>
    globalUsername: string;
}
type SetupPageProps = {
    setGlobalUsername: set<string>
    globalUsername: string;
}