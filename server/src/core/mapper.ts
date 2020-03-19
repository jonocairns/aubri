export const objectToProps = (object: any) => {
    return Object.keys(object).map(key => ({
        prop: key, value: object[key]
    }));
}